const pool = require('./db');
const { authenticate } = require('./auth');
const { access, unitAccess } = require('./learning');
const { fail, positiveId } = require('./validation');
const { audit } = require('./management');
const parse = value => typeof value === 'string' ? JSON.parse(value) : value;
const txt = (value, label, max, required = true) => { if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`Enter ${label} (up to ${max} characters).`); return value.trim(); };
const integer = (value, label, min, max) => { const n = Number(value); if (!Number.isInteger(n) || n < min || n > max) fail(`${label} must be between ${min} and ${max}.`); return n; };
async function staff(user, courseId, conn = pool) {
  if (user.admin_access) return true;
  const [rows] = await conn.query('SELECT user_id FROM course_trainers WHERE course_id=? AND user_id=?', [courseId, user.id]);
  return rows.length > 0;
}
async function requireStaff(user, courseId, conn = pool) { if (!await staff(user, courseId, conn)) fail('Only an assigned trainer or administrator can manage this course.', 403); }
async function unit(id, conn = pool) {
  const [[row]] = await conn.query('SELECT u.*,m.course_id FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE u.id=?', [positiveId(id)]);
  if (!row) fail('Learning unit not found.', 404); return row;
}
function files(value, language) {
  const names = language === 'web' ? ['index.html', 'style.css', 'main.js'] : language.startsWith('judge0:') ? ['main'] : ['main.js'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !names.includes(key))) fail('Invalid project files.');
  return Object.fromEntries(names.map(name => { if (typeof value[name] !== 'string' || value[name].length > 60000) fail(`Limit ${name} to 60,000 characters.`); return [name, value[name]]; }));
}
function exerciseBody(body) {
  const language = body.language;
  if (!['javascript', 'web'].includes(language) && !/^judge0:\d+$/.test(language)) fail('Choose JavaScript or Web.');
  const rubric = body.rubric;
  if (!Array.isArray(rubric) || !rubric.length || rubric.length > 15) fail('Add 1 to 15 marking criteria.');
  const criteria = rubric.map(item => ({ label: txt(item.label, 'criterion', 160), points: integer(item.points, 'Criterion marks', 1, 100) }));
  if (!Array.isArray(body.tests) || body.tests.length > 30) fail('Use up to 30 self-tests.');
  if (language.startsWith('judge0:') && body.tests.length > 10) fail('Use up to 10 runner test cases.');
  const tests = body.tests.map(item => {
    const label = txt(item.label, 'test name', 160);
    if (language === 'javascript') {
      if (!/^[A-Za-z_$][\w$]{0,79}$/.test(item.functionName)) fail('Tests need a valid JavaScript function name.');
      if (!Array.isArray(item.args) || JSON.stringify(item.args).length > 4000 || item.expected === undefined || JSON.stringify(item.expected).length > 4000) fail('Provide JSON arguments and an expected JSON value.');
      return { label, functionName: item.functionName, args: item.args, expected: item.expected };
    }
    if (language.startsWith('judge0:')) {
      if (typeof item.stdin !== 'string' || item.stdin.length > 10000 || typeof item.expected_output !== 'string' || item.expected_output.length > 10000) fail('Provide text input and expected output up to 10,000 characters.');
      return { label, stdin:item.stdin, expected_output:item.expected_output };
    }
    return { label, selector: txt(item.selector, 'CSS selector', 200), expectedText: txt(item.expectedText || '', 'expected text', 1000, false) };
  });
  return { title: txt(body.title, 'title', 200), instructions: txt(body.instructions, 'task instructions', 15000), language,
    starter: files(body.starter, language), tests, rubric: criteria, pass_mark: integer(body.pass_mark, 'Pass mark', 1, 100),
    required: body.required === true || body.required === 1 ? 1 : 0, published: body.published === true || body.published === 1 ? 1 : 0 };
}
function decode(row) { for (const key of ['starter','tests','rubric','files','snapshot','marks','annotations']) if (row[key] != null) row[key] = parse(row[key]); return row; }
async function getExercise(id, user, conn = pool) {
  const [[row]] = await conn.query('SELECT e.*,m.course_id,u.title AS unit_title FROM coding_exercises e JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE e.id=?', [positiveId(id)]);
  if (!row) fail('Practical task not found.', 404);
  if (!await staff(user, row.course_id, conn)) { await unitAccess(conn, user, row.unit_id); if (!row.published) fail('This practical task is not published.', 403); }
  return decode(row);
}
async function transaction(fn) { const conn = await pool.getConnection(); try { await conn.beginTransaction(); const result = await fn(conn); await conn.commit(); return result; } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); } }

function registerPractice(app) {
  app.use('/api/practice', authenticate);
  require('./local-runner').registerExecution(app, getExercise);
  app.get('/api/practice/dashboard', async (req,res) => {
    const [rows] = await pool.query("SELECT s.id,s.exercise_id,s.status,s.score,s.passed,s.feedback,e.title,c.title AS course_title FROM coding_submissions s JOIN coding_exercises e ON e.id=s.exercise_id JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id JOIN courses c ON c.id=m.course_id WHERE s.user_id=? AND EXISTS(SELECT 1 FROM enrollments n WHERE n.course_id=c.id AND n.user_id=s.user_id AND n.status IN ('approved','completed')) ORDER BY s.id DESC LIMIT 12",[req.user.id]);
    res.json(rows);
  });
  app.get('/api/practice/teaching', async (req, res) => {
    const [courses] = await pool.query(`SELECT c.id,c.title FROM courses c ${req.user.admin_access ? '' : 'JOIN course_trainers t ON t.course_id=c.id WHERE t.user_id=?'} ORDER BY c.title`, req.user.admin_access ? [] : [req.user.id]);
    res.json({ courses, admin: !!req.user.admin_access });
  });
  app.get('/api/practice/courses/:id/studio', async (req, res) => {
    const id = positiveId(req.params.id); await requireStaff(req.user, id);
    const [units] = await pool.query('SELECT u.id,u.title,m.title AS module_title FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE m.course_id=? ORDER BY m.position,m.id,u.position,u.id', [id]);
    const [exercises] = await pool.query('SELECT e.* FROM coding_exercises e JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE m.course_id=? ORDER BY e.id', [id]);
    const [submissions] = await pool.query('SELECT s.id,s.exercise_id,s.user_id,s.status,s.score,s.passed,s.submitted_at,u.name,e.title FROM coding_submissions s JOIN users u ON u.id=s.user_id JOIN coding_exercises e ON e.id=s.exercise_id JOIN learning_units l ON l.id=e.unit_id JOIN learning_modules m ON m.id=l.module_id WHERE m.course_id=? ORDER BY s.id DESC LIMIT 300', [id]);
    const [trainers] = await pool.query('SELECT u.id,u.name,u.email FROM course_trainers t JOIN users u ON u.id=t.user_id WHERE t.course_id=?', [id]);
    const [users] = req.user.admin_access ? await pool.query('SELECT id,name,email FROM users WHERE account_active=1 ORDER BY name') : [[]];
    res.json({ units, exercises: exercises.map(decode), submissions, trainers, users });
  });
  app.put('/api/practice/courses/:id/trainers', async (req, res) => {
    if (!req.user.admin_access) fail('Administrator access is required to assign trainers.', 403);
    const courseId = positiveId(req.params.id); const ids = req.body.user_ids;
    if (!Array.isArray(ids) || ids.length > 30) fail('Choose up to 30 trainers.');
    const userIds = [...new Set(ids.map(positiveId))];
    await transaction(async conn => {
      for (const id of userIds) { const [[user]] = await conn.query('SELECT id FROM users WHERE id=? AND account_active=1', [id]); if (!user) fail('Choose an active user.'); }
      await conn.query('DELETE FROM course_trainers WHERE course_id=?', [courseId]);
      for (const id of userIds) await conn.query('INSERT INTO course_trainers(course_id,user_id) VALUES(?,?)', [courseId,id]);
      await audit(conn, req.user, 'assign_trainers', 'courses', courseId);
    });
    res.json({ message: 'Trainer assignments saved.' });
  });
  app.post('/api/practice/exercises', async (req, res) => {
    const parent = await unit(req.body.unit_id); await requireStaff(req.user, parent.course_id);
    const data = exerciseBody(req.body); if (data.language.startsWith('judge0:')) data.language_name = (await require('./local-runner').resolveLanguage(data.language.split(':')[1])).name; const values = { unit_id: parent.id, ...data };
    for (const key of ['starter','tests','rubric']) values[key] = JSON.stringify(values[key]);
    const id = await transaction(async conn => { const [result] = await conn.query('INSERT INTO coding_exercises SET ?', [values]); await audit(conn,req.user,'create','practical',result.insertId); return result.insertId; });
    res.status(201).json({ id });
  });
  app.put('/api/practice/exercises/:id', async (req, res) => {
    const old = await getExercise(req.params.id, req.user); await requireStaff(req.user, old.course_id);
    const values = exerciseBody(req.body);
    if (values.language.startsWith('judge0:')) values.language_name = (await require('./local-runner').resolveLanguage(values.language.split(':')[1])).name;
    for (const key of ['starter','tests','rubric']) values[key] = JSON.stringify(values[key]);
    await transaction(async conn => { await conn.query('UPDATE coding_exercises SET ?,version=version+1 WHERE id=?',[values,old.id]); await audit(conn,req.user,'update','practical',old.id); });
    res.json({ message: 'Task updated. Submitted work retains its original rubric.' });
  });
  app.get('/api/practice/units/:id', async (req, res) => {
    const parent = await unit(req.params.id); const trainer = await staff(req.user,parent.course_id);
    if (!trainer) await unitAccess(pool,req.user,parent.id);
    const [rows] = await pool.query(`SELECT e.id,e.title,e.language,e.language_name,e.required,e.pass_mark,e.published, EXISTS(SELECT 1 FROM coding_submissions s WHERE s.exercise_id=e.id AND s.user_id=? AND s.passed=1) AS passed FROM coding_exercises e WHERE e.unit_id=? ${trainer?'':'AND e.published=1'} ORDER BY e.id`,[req.user.id,parent.id]);
    res.json(rows);
  });
  app.get('/api/practice/exercises/:id', async (req, res) => {
    const exercise = await getExercise(req.params.id,req.user);
    const [[draft]] = await pool.query('SELECT * FROM coding_drafts WHERE exercise_id=? AND user_id=?',[exercise.id,req.user.id]);
    const [submissions] = await pool.query('SELECT s.*,u.name AS reviewer_name FROM coding_submissions s LEFT JOIN users u ON u.id=s.reviewer_id WHERE exercise_id=? AND s.user_id=? ORDER BY s.id DESC',[exercise.id,req.user.id]);
    res.json({ exercise, draft: draft ? decode(draft) : null, submissions: submissions.map(decode) });
  });
  app.put('/api/practice/exercises/:id/draft', async (req,res) => {
    const exercise = await getExercise(req.params.id,req.user); const code = files(req.body.files,exercise.language);
    const revision = integer(req.body.revision,'Draft revision',0,2147483646);
    if (revision === 0) {
      try { await pool.query('INSERT INTO coding_drafts(exercise_id,user_id,files) VALUES(?,?,?)',[exercise.id,req.user.id,JSON.stringify(code)]); }
      catch(error) { if(error.code==='ER_DUP_ENTRY') fail('This draft changed in another tab. Copy your work, then reload.',409); throw error; }
    } else { const [result] = await pool.query('UPDATE coding_drafts SET files=?,revision=revision+1 WHERE exercise_id=? AND user_id=? AND revision=?',[JSON.stringify(code),exercise.id,req.user.id,revision]); if(!result.affectedRows) fail('This draft changed in another tab. Copy your work, then reload.',409); }
    res.json({ revision:revision+1 });
  });
  app.post('/api/practice/exercises/:id/submit', async (req,res) => {
    const exercise = await getExercise(req.params.id,req.user); const code = files(req.body.files,exercise.language);
    if (Number(req.body.version)!==exercise.version) fail('The task has changed. Save your draft and reload before submitting.',409);
    const reflection = txt(req.body.reflection||'','reflection',4000,false);
    const id = await transaction(async conn => {
      const [[current]] = await conn.query('SELECT version FROM coding_exercises WHERE id=? FOR UPDATE',[exercise.id]);
      if (!current || current.version !== exercise.version) fail('The task has changed. Reload before submitting.',409);
      const [[pending]] = await conn.query("SELECT id FROM coding_submissions WHERE exercise_id=? AND user_id=? AND status='submitted'",[exercise.id,req.user.id]);
      if(pending) fail('Your previous submission is awaiting review. Continue practicing while your trainer reviews it.',409);
      const [result] = await conn.query('INSERT INTO coding_submissions(exercise_id,user_id,version,files,snapshot,reflection) VALUES(?,?,?,?,?,?)',[exercise.id,req.user.id,exercise.version,JSON.stringify(code),JSON.stringify(exercise),reflection]);
      return result.insertId;
    });
    res.status(201).json({id,message:'Submitted for trainer review. Self-test results do not determine your official mark.'});
  });
  app.get('/api/practice/submissions/:id', async (req,res) => {
    const [[row]] = await pool.query('SELECT s.*,u.name AS student_name,r.name AS reviewer_name,m.course_id FROM coding_submissions s JOIN users u ON u.id=s.user_id LEFT JOIN users r ON r.id=s.reviewer_id JOIN coding_exercises e ON e.id=s.exercise_id JOIN learning_units l ON l.id=e.unit_id JOIN learning_modules m ON m.id=l.module_id WHERE s.id=?',[positiveId(req.params.id)]);
    if(!row) fail('Submission not found.',404);
    if(row.user_id!==req.user.id) await requireStaff(req.user,row.course_id); else await access(pool,req.user,row.course_id);
    res.json(decode(row));
  });
  app.post('/api/practice/submissions/:id/review', async (req,res) => {
    const id=positiveId(req.params.id);
    const result=await transaction(async conn=>{
      const [[row]]=await conn.query('SELECT s.*,m.course_id FROM coding_submissions s JOIN coding_exercises e ON e.id=s.exercise_id JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE s.id=? FOR UPDATE',[id]);
      if(!row) fail('Submission not found.',404); await requireStaff(req.user,row.course_id,conn);
      if(row.user_id===req.user.id) fail('You cannot mark your own submission.',403);
      if(row.status==='reviewed') fail('This submission has already been marked. Review a new submission to preserve the marking history.',409);
      const snapshot=parse(row.snapshot); const code=parse(row.files);
      if(!Array.isArray(req.body.marks)||req.body.marks.length!==snapshot.rubric.length) fail('Mark each rubric criterion.');
      const marks=req.body.marks.map((mark,index)=>integer(mark,'Marks',0,snapshot.rubric[index].points));
      const feedback=txt(req.body.feedback,'overall feedback',10000);
      if(!Array.isArray(req.body.annotations)||req.body.annotations.length>100) fail('Use up to 100 code comments.');
      const annotations=req.body.annotations.map(item=>{
        if(!Object.hasOwn(code,item.file)) fail('Choose a submitted file.');
        return {file:item.file,line:integer(item.line,'Line number',1,code[item.file].split('\n').length),message:txt(item.message,'code feedback',2000),kind:['mistake','suggestion','strength'].includes(item.kind)?item.kind:'suggestion'};
      });
      const score=Math.round(marks.reduce((a,b)=>a+b,0)/snapshot.rubric.reduce((sum,item)=>sum+item.points,0)*10000)/100;
      const passed=score>=snapshot.pass_mark;
      await conn.query("UPDATE coding_submissions SET status='reviewed',score=?,passed=?,feedback=?,marks=?,annotations=?,reviewer_id=?,reviewed_at=NOW() WHERE id=?",[score,passed?1:0,feedback,JSON.stringify(marks),JSON.stringify(annotations),req.user.id,id]);
      await audit(conn,req.user,'mark','practical',id); return {score,passed};
    }); res.json(result);
  });

  // Shared classroom and private help threads; authorization is checked on every poll.
  async function thread(req) {
    const courseId=positiveId(req.params.id); const trainer=await staff(req.user,courseId);
    if(!trainer) await access(pool,req.user,courseId);
    const studentId=req.query.student ? positiveId(req.query.student):null;
    if(studentId) {
      if(!trainer && studentId!==req.user.id) fail('This help thread is private.',403);
      const [[enrolled]]=await pool.query("SELECT id FROM enrollments WHERE course_id=? AND user_id=? AND status IN ('approved','completed') LIMIT 1",[courseId,studentId]);
      if(!enrolled) fail('The student is not enrolled in this course.',403);
    }
    return {courseId,studentId,trainer};
  }
  app.get('/api/practice/courses/:id/chat',async(req,res)=>{
    const {courseId,studentId,trainer}=await thread(req);
    const before=req.query.before?positiveId(req.query.before):2147483647;
    const [messages]=await pool.query(`SELECT m.id,m.sender_id,m.created_at,m.reply_to,m.deleted_at,IF(m.deleted_at IS NULL,m.body,'Message removed') AS body,u.name, (r.admin_access=1 OR EXISTS(SELECT 1 FROM course_trainers t WHERE t.course_id=m.course_id AND t.user_id=m.sender_id)) AS trainer FROM classroom_messages m JOIN users u ON u.id=m.sender_id JOIN roles r ON r.name=u.role WHERE m.course_id=? AND m.student_id <=> ? AND m.id<? ORDER BY m.id DESC LIMIT 60`,[courseId,studentId,before]);
    const [students]=trainer?await pool.query("SELECT DISTINCT u.id,u.name FROM users u JOIN enrollments e ON e.user_id=u.id WHERE e.course_id=? AND e.status IN ('approved','completed') ORDER BY u.name",[courseId]):[[]];
    const [[course]]=await pool.query('SELECT title FROM courses WHERE id=?',[courseId]);
    res.json({messages:messages.reverse(),students,trainer,user_id:req.user.id,course_title:course?.title});
  });
  app.post('/api/practice/courses/:id/chat',async(req,res)=>{
    const {courseId,studentId}=await thread(req);const body=txt(req.body.body,'message',4000);
    const reply=req.body.reply_to?positiveId(req.body.reply_to):null;
    const id=await transaction(async conn=>{
      await conn.query('SELECT id FROM users WHERE id=? FOR UPDATE',[req.user.id]);
      const [[count]]=await conn.query('SELECT COUNT(*) AS total FROM classroom_messages WHERE sender_id=? AND created_at>DATE_SUB(NOW(),INTERVAL 1 MINUTE)',[req.user.id]);
      if(count.total>=30) fail('Please wait a moment before sending more messages.',429);
      if(reply){const [[target]]=await conn.query('SELECT id FROM classroom_messages WHERE id=? AND course_id=? AND student_id <=> ? AND deleted_at IS NULL',[reply,courseId,studentId]);if(!target)fail('Reply to a message in this conversation.');}
      const [result]=await conn.query('INSERT INTO classroom_messages(course_id,student_id,sender_id,body,reply_to) VALUES(?,?,?,?,?)',[courseId,studentId,req.user.id,body,reply]);return result.insertId;
    });res.status(201).json({id});
  });
  app.delete('/api/practice/courses/:id/chat/:message',async(req,res)=>{
    const {courseId,studentId,trainer}=await thread(req);
    const [[row]]=await pool.query('SELECT sender_id FROM classroom_messages WHERE id=? AND course_id=? AND student_id <=> ?',[positiveId(req.params.message),courseId,studentId]);
    if(!row)fail('Message not found.',404);if(!trainer&&row.sender_id!==req.user.id)fail('You can only remove your own messages.',403);
    await pool.query("UPDATE classroom_messages SET deleted_at=NOW(),body='' WHERE id=?",[req.params.message]);res.json({message:'Message removed.'});
  });
}
module.exports={registerPractice,staff,files,exerciseBody};
