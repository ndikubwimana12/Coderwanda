const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { authenticate, issueSession } = require('./auth');
const { fail, positiveId } = require('./validation');
const { audit, save } = require('./management');
const { invite, hashToken, deliverNotifications } = require('./learning-accounts');
const parse = value => typeof value === 'string' ? JSON.parse(value) : value;
const cleanQuestions = questions => questions.map(({ prompt, options, points }) => ({ prompt, options, points }));
const integer = (value, name, min = 0, max = 10000) => { const n = Number(value); if (!Number.isInteger(n) || n < min || n > max) fail(`${name} must be between ${min} and ${max}.`); return n; };
const text = (value, name, max = 200, required = true) => { if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`Enter a valid ${name}.`); return value.trim(); };
const media = value => { if (!value) return ''; if (typeof value !== 'string' || !/^(https?:\/\/[^\s]+|\/learning-media\/[a-f0-9-]+\.(mp4|webm|png|jpg|webp)|\/uploads\/[a-f0-9-]+\.(png|jpg|webp))$/i.test(value)) fail('Use an uploaded media file or HTTP(S) URL.'); return value; };

async function access(conn, user, courseId) {
  if (user.admin_access) return;
  const [rows] = await conn.query("SELECT id FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('approved','completed') LIMIT 1", [user.id, courseId]);
  if (!rows.length) fail('An approved enrollment is required for this course.', 403);
}
async function outline(conn, userId, courseId) {
  const [modules] = await conn.query('SELECT m.*, sm.enrolled_at FROM learning_modules m LEFT JOIN student_modules sm ON sm.module_id=m.id AND sm.user_id=? WHERE m.course_id=? AND m.published=1 ORDER BY m.position,m.id', [userId, courseId]);
  const [units] = await conn.query(`SELECT u.id,u.module_id,u.title,u.position,u.duration_minutes,s.read_at,s.completed_at,a.id AS assessment_id,a.pass_mark,a.time_limit_minutes FROM learning_units u JOIN learning_modules m ON m.id=u.module_id LEFT JOIN student_units s ON s.unit_id=u.id AND s.user_id=? LEFT JOIN learning_assessments a ON a.unit_id=u.id AND a.published=1 WHERE m.course_id=? AND m.published=1 AND u.published=1 ORDER BY m.position,m.id,u.position,u.id`, [userId, courseId]);
  const [practicals] = await conn.query('SELECT e.id,e.unit_id,EXISTS(SELECT 1 FROM coding_submissions s WHERE s.exercise_id=e.id AND s.user_id=? AND s.passed=1) AS passed FROM coding_exercises e JOIN learning_units u ON u.id=e.unit_id JOIN learning_modules m ON m.id=u.module_id WHERE m.course_id=? AND e.published=1 AND e.required=1', [userId, courseId]);
  for (const unit of units) { const tasks = practicals.filter(task => task.unit_id === unit.id); unit.practicals_total = tasks.length; unit.practicals_pending = tasks.filter(task => !task.passed).length; if (unit.practicals_pending) unit.completed_at = null; else if (!unit.assessment_id && tasks.length && unit.read_at) unit.completed_at = unit.read_at; }
  for (const module of modules) module.units = units.filter(unit => unit.module_id === module.id);
  return { modules, units, completed: units.filter(unit => unit.completed_at).length, total: units.length, ready: modules.length > 0 && modules.every(module => module.units.length > 0 && module.units.every(unit => unit.completed_at)) };
}
async function unitAccess(conn, user, unitId) {
  const [rows] = await conn.query('SELECT u.*, m.course_id, m.published AS module_published FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE u.id=?', [positiveId(unitId)]);
  if (!rows.length) fail('Unit not found.', 404);
  const unit = rows[0]; await access(conn, user, unit.course_id);
  if (user.admin_access) return unit;
  if (!unit.published || !unit.module_published) fail('This unit is not published.', 403);
  const progress = await outline(conn, user.id, unit.course_id);
  const module = progress.modules.find(module => module.id === unit.module_id);
  if (!module?.enrolled_at) fail('Join this module before opening a unit.', 403);
  const position = module.units.findIndex(item => item.id === unit.id);
  if (module.units.slice(0, position).some(item => !item.completed_at)) fail('Complete the preceding units first.', 403);
  return unit;
}
async function assessmentAccess(conn, user, assessment) {
  await access(conn, user, assessment.course_id);
  if (!assessment.published) fail('This assessment is not published.', 403);
  if (assessment.kind === 'unit') {
    await unitAccess(conn, user, assessment.unit_id);
    const [read] = await conn.query('SELECT read_at FROM student_units WHERE user_id=? AND unit_id=?', [user.id, assessment.unit_id]);
    if (!read[0]?.read_at) fail('Mark the unit content as studied before starting its assessment.', 403);
  } else if (!(await outline(conn, user.id, assessment.course_id)).ready) fail('Complete the unit assessments and required practicals before the final exam.', 403);
}
async function certificate(conn, user, courseId, score) {
  const progress = await outline(conn, user.id, courseId);
  if (!progress.ready) return null;
  const [[course]] = await conn.query('SELECT title FROM courses WHERE id=?', [courseId]);
  await conn.query('INSERT IGNORE INTO learning_certificates (code,user_id,course_id,student_name,course_title,score) VALUES (?,?,?,?,?,?)', [crypto.randomUUID(), user.id, courseId, user.name, course.title, score]);
  const [[result]] = await conn.query('SELECT code FROM learning_certificates WHERE user_id=? AND course_id=? AND revoked_at IS NULL', [user.id, courseId]);
  return result?.code || null;
}

function validateAssessment(body) {
  const questions = body.questions;
  if (!Array.isArray(questions) || !questions.length || questions.length > 100) fail('Add between 1 and 100 questions.');
  return questions.map(question => {
    const prompt = text(question.prompt, 'question', 2000);
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) fail('Each question needs 2 to 6 options.');
    const options = question.options.map(option => text(option, 'answer option', 1000));
    if (new Set(options).size !== options.length) fail('Answer options must be different.');
    return { prompt, options, correct: integer(question.correct, 'Correct option', 0, options.length - 1), points: integer(question.points ?? 1, 'Points', 1, 100), explanation: text(question.explanation || '', 'explanation', 2000, false) };
  });
}

function registerLearning(app) {
  app.post('/api/auth/activate', async (req, res) => {
    const { token, password } = req.body || {};
    if (typeof token !== 'string' || !/^[\w-]{43}$/.test(token)) fail('This activation link is invalid.');
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) fail('Use at least 8 characters and at most 72 bytes for your password.');
    const conn = await pool.getConnection(); let user;
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query('SELECT a.user_id FROM account_activations a JOIN users u ON u.id=a.user_id WHERE a.token_hash=? AND a.expires_at>NOW() AND u.account_active=0 FOR UPDATE', [hashToken(token)]);
      if (!rows.length) fail('This link has expired or was already used. Ask the training team for a new one.');
      await conn.query('UPDATE users SET password=?, account_active=1 WHERE id=?', [await bcrypt.hash(password, 12), rows[0].user_id]);
      await conn.query('DELETE FROM account_activations WHERE user_id=?', [rows[0].user_id]);
      await conn.query('DELETE FROM sessions WHERE user_id=?', [rows[0].user_id]);
      [[user]] = await conn.query('SELECT u.id,u.name,u.email,u.phone,u.role,r.admin_access FROM users u JOIN roles r ON r.name=u.role WHERE u.id=?', [rows[0].user_id]);
      await conn.commit();
    } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
    res.json({ user: { ...user, is_student: true }, token: await issueSession(user.id) });
  });
  app.get('/api/certificates/:code', async (req, res) => {
    const [rows] = await pool.query('SELECT code,student_name,course_title,score,issued_at,revoked_at FROM learning_certificates WHERE code=?', [req.params.code]);
    if (!rows.length) fail('Certificate not found.', 404);
    res.json(rows[0]);
  });
  app.use('/api/learning', authenticate);
  app.get('/api/learning/dashboard', async (req, res) => {
    const [courses] = await pool.query("SELECT DISTINCT c.*,e.status FROM courses c JOIN enrollments e ON e.course_id=c.id WHERE e.user_id=? AND e.status IN ('approved','completed') ORDER BY c.id DESC", [req.user.id]);
    for (const course of courses) { const progress = await outline(pool, req.user.id, course.id); course.progress = { completed: progress.completed, total: progress.total, percent: progress.total ? Math.round(progress.completed / progress.total * 100) : 0 }; }
    const [applications] = await pool.query("SELECT e.id,e.status,c.title AS course_title,e.enrolled_at FROM enrollments e LEFT JOIN courses c ON c.id=e.course_id WHERE e.user_id=? OR e.email=? ORDER BY e.id DESC", [req.user.id, req.user.email]);
    const [attempts] = await pool.query('SELECT t.id,t.assessment_id,t.score,t.passed,t.submitted_at,a.title,a.kind,a.course_id FROM learning_attempts t JOIN learning_assessments a ON a.id=t.assessment_id WHERE t.user_id=? AND t.submitted_at IS NOT NULL ORDER BY t.id DESC LIMIT 100', [req.user.id]);
    const [certificates] = await pool.query('SELECT code,course_title,issued_at,revoked_at,score FROM learning_certificates WHERE user_id=? ORDER BY id DESC', [req.user.id]);
    res.json({ user: req.user, courses, applications, attempts, certificates });
  });
  app.get('/api/learning/courses/:id', async (req, res) => {
    const id = positiveId(req.params.id); await access(pool, req.user, id);
    const [[course]] = await pool.query('SELECT * FROM courses WHERE id=?', [id]); if (!course) fail('Course not found.', 404);
    const progress = await outline(pool, req.user.id, id);
    const [exam] = await pool.query("SELECT id,title,pass_mark,time_limit_minutes,max_attempts FROM learning_assessments WHERE course_id=? AND kind='exam' AND published=1", [id]);
    const [certs] = await pool.query('SELECT code FROM learning_certificates WHERE user_id=? AND course_id=? AND revoked_at IS NULL', [req.user.id, id]);
    res.json({ course, ...progress, exam: exam[0] || null, certificate: certs[0]?.code || null });
  });
  app.post('/api/learning/modules/:id/enroll', async (req, res) => {
    const [[module]] = await pool.query('SELECT * FROM learning_modules WHERE id=? AND published=1', [positiveId(req.params.id)]); if (!module) fail('Module not found.', 404);
    await access(pool, req.user, module.course_id);
    await pool.query('INSERT IGNORE INTO student_modules (user_id,module_id) VALUES (?,?)', [req.user.id, module.id]);
    res.json({ message: 'Module added to your learning plan.' });
  });
  app.get('/api/learning/units/:id', async (req, res) => {
    const unit = await unitAccess(pool, req.user, req.params.id);
    const signed = require('./learning-media').signed;
    for (const field of ['video_url', 'image_url']) if (unit[field]?.startsWith('/learning-media/')) unit[field] = signed(unit[field], req.user.id, unit.id);
    res.json(unit);
  });
  app.post('/api/learning/units/:id/studied', async (req, res) => {
    const unit = await unitAccess(pool, req.user, req.params.id);
    await pool.query('INSERT INTO student_units (user_id,unit_id,read_at) VALUES (?,?,NOW()) ON DUPLICATE KEY UPDATE read_at=COALESCE(read_at,NOW())', [req.user.id, unit.id]);
    res.json({ message: 'Content studied. You can now take the unit assessment.' });
  });
  app.get('/api/learning/assessments/:id', async (req, res) => {
    const [[assessment]] = await pool.query('SELECT * FROM learning_assessments WHERE id=?', [positiveId(req.params.id)]); if (!assessment) fail('Assessment not found.', 404);
    await assessmentAccess(pool, req.user, assessment);
    const [attempts] = await pool.query('SELECT id,score,passed,started_at,expires_at,submitted_at FROM learning_attempts WHERE user_id=? AND assessment_id=? AND version=? ORDER BY id DESC', [req.user.id, assessment.id, assessment.version]);
    const [[allowance]] = await pool.query('SELECT extra_attempts FROM learning_allowances WHERE user_id=? AND assessment_id=?', [req.user.id, assessment.id]);
    res.json({ id: assessment.id, title: assessment.title, kind: assessment.kind, course_id: assessment.course_id, pass_mark: assessment.pass_mark, time_limit_minutes: assessment.time_limit_minutes, max_attempts: assessment.max_attempts + (allowance?.extra_attempts || 0), questions_count: parse(assessment.questions).length, attempts, server_time: new Date().toISOString() });
  });
  app.post('/api/learning/assessments/:id/start', async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[assessment]] = await conn.query('SELECT * FROM learning_assessments WHERE id=? FOR UPDATE', [positiveId(req.params.id)]); if (!assessment) fail('Assessment not found.', 404);
      await assessmentAccess(conn, req.user, assessment);
      const [attempts] = await conn.query('SELECT * FROM learning_attempts WHERE user_id=? AND assessment_id=? AND version=? ORDER BY id DESC', [req.user.id, assessment.id, assessment.version]);
      let attempt = attempts.find(item => !item.submitted_at && new Date(item.expires_at).getTime() > Date.now());
      if (!attempt) {
        const [[allowance]] = await conn.query('SELECT extra_attempts FROM learning_allowances WHERE user_id=? AND assessment_id=?', [req.user.id, assessment.id]);
        if (attempts.length >= assessment.max_attempts + (allowance?.extra_attempts || 0)) fail('All attempts are used. Contact your instructor for another attempt.', 403);
        const snapshot = JSON.stringify({ questions: parse(assessment.questions), pass_mark: assessment.pass_mark, kind: assessment.kind, unit_id: assessment.unit_id, course_id: assessment.course_id });
        const [result] = await conn.query('INSERT INTO learning_attempts (user_id,assessment_id,version,started_at,expires_at,snapshot) VALUES (?,?,?,NOW(),DATE_ADD(NOW(), INTERVAL ? MINUTE),?)', [req.user.id, assessment.id, assessment.version, assessment.time_limit_minutes, snapshot]);
        [[attempt]] = await conn.query('SELECT * FROM learning_attempts WHERE id=?', [result.insertId]);
      }
      await conn.commit();
      res.json({ id: attempt.id, expires_at: attempt.expires_at, server_time: new Date().toISOString(), questions: cleanQuestions(parse(attempt.snapshot).questions) });
    } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
  });
  app.post('/api/learning/attempts/:id/submit', async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[attempt]] = await conn.query('SELECT * FROM learning_attempts WHERE id=? AND user_id=? FOR UPDATE', [positiveId(req.params.id), req.user.id]); if (!attempt) fail('Attempt not found.', 404);
      const snapshot = parse(attempt.snapshot); await access(conn, req.user, snapshot.course_id);
      if (attempt.submitted_at) { await conn.commit(); return res.json({ score: Number(attempt.score), passed: Boolean(attempt.passed), message: 'This attempt was already submitted.' }); }
      const answers = req.body.answers;
      if (!Array.isArray(answers) || answers.length !== snapshot.questions.length || answers.some((answer, index) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= snapshot.questions[index].options.length))) fail('Submit one answer per question; unanswered questions can be null.');
      const expired = new Date(attempt.expires_at).getTime() < Date.now();
      const possible = snapshot.questions.reduce((sum, question) => sum + question.points, 0);
      const earned = snapshot.questions.reduce((sum, question, index) => sum + (question.correct === answers[index] ? question.points : 0), 0);
      const score = expired ? 0 : Math.round(earned / possible * 10000) / 100;
      const passed = !expired && score >= snapshot.pass_mark;
      await conn.query('UPDATE learning_attempts SET submitted_at=NOW(),answers=?,score=?,passed=? WHERE id=?', [JSON.stringify(answers), score, passed ? 1 : 0, attempt.id]);
      if (passed && snapshot.kind === 'unit') await conn.query('INSERT INTO student_units (user_id,unit_id,read_at,completed_at) VALUES (?,?,NOW(),NOW()) ON DUPLICATE KEY UPDATE completed_at=NOW()', [req.user.id, snapshot.unit_id]);
      const code = passed && snapshot.kind === 'exam' ? await certificate(conn, req.user, snapshot.course_id, score) : null;
      await conn.commit();
      res.json({ score, passed, expired, earned: expired ? 0 : earned, possible, certificate: code, feedback: snapshot.questions.map((question, index) => ({ prompt: question.prompt, correct: !expired && question.correct === answers[index], explanation: passed ? question.explanation : '' })) });
    } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
  });

  app.get('/api/admin/learning/courses/:id', async (req, res) => {
    const id = positiveId(req.params.id);
    const [[course]] = await pool.query('SELECT * FROM courses WHERE id=?', [id]); if (!course) fail('Course not found.', 404);
    const [modules] = await pool.query('SELECT * FROM learning_modules WHERE course_id=? ORDER BY position,id', [id]);
    const [units] = await pool.query('SELECT u.* FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE m.course_id=? ORDER BY u.position,u.id', [id]);
    const [assessments] = await pool.query('SELECT * FROM learning_assessments WHERE course_id=? ORDER BY id', [id]);
    res.json({ course, modules, units, assessments: assessments.map(a => ({ ...a, questions: parse(a.questions) })) });
  });
  for (const resource of ['modules', 'units', 'assessments']) {
    const write = async (req, res) => {
      const body = req.body || {}; const id = req.params.id ? positiveId(req.params.id) : null;
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        let data = { title: text(body.title, 'title'), published: integer(body.published ?? 0, 'Publication state', 0, 1) };
        if (resource === 'modules') data = { ...data, course_id: positiveId(body.course_id), description: text(body.description || '', 'description', 10000, false), position: integer(body.position ?? 1, 'Position', 1) };
        if (resource === 'units') data = { ...data, module_id: positiveId(body.module_id), content: text(body.content || '', 'unit content', 200000, false), video_url: media(body.video_url), image_url: media(body.image_url), duration_minutes: integer(body.duration_minutes ?? 10, 'Duration', 1, 1440), position: integer(body.position ?? 1, 'Position', 1) };
        if (resource === 'units' && !data.content && !data.video_url && !data.image_url) fail('Add text, video or an image to the unit.');
        if (resource === 'assessments') {
          if (!['unit','exam'].includes(body.kind)) fail('Choose a unit assessment or final exam.');
          data = { ...data, course_id: positiveId(body.course_id), unit_id: body.kind === 'unit' ? positiveId(body.unit_id) : null, kind: body.kind, pass_mark: integer(body.pass_mark ?? 70, 'Pass mark', 1, 100), time_limit_minutes: integer(body.time_limit_minutes ?? 30, 'Time limit', 1, 240), max_attempts: integer(body.max_attempts ?? 3, 'Attempts', 1, 20), questions: JSON.stringify(validateAssessment(body)) };
          await conn.query('SELECT id FROM courses WHERE id=? FOR UPDATE', [data.course_id]);
          if (data.unit_id) { const [[unit]] = await conn.query('SELECT m.course_id FROM learning_units u JOIN learning_modules m ON m.id=u.module_id WHERE u.id=?', [data.unit_id]); if (unit?.course_id !== data.course_id) fail('The unit must belong to this course.'); }
          else { const [existing] = await conn.query("SELECT id FROM learning_assessments WHERE course_id=? AND kind='exam' AND id<>?", [data.course_id, id || 0]); if (existing.length) fail('This course already has a final exam. Edit that exam.'); }
        }
        const keys = Object.keys(data); let recordId = id;
        if (id) {
          const [existing] = await conn.query(`SELECT * FROM learning_${resource} WHERE id=? FOR UPDATE`, [id]); if (!existing.length) fail('Record not found.', 404);
          if (resource === 'assessments') { if (existing[0].course_id !== data.course_id || existing[0].kind !== data.kind || existing[0].unit_id !== data.unit_id) fail('An existing assessment cannot be moved to another course or unit.'); }
          await conn.query(`UPDATE learning_${resource} SET ${keys.map(key => `\`${key}\`=?`).join(',')}${resource === 'assessments' ? ',version=version+1' : ''} WHERE id=?`, [...Object.values(data), id]);
        } else { const [result] = await conn.query(`INSERT INTO learning_${resource} (${keys.map(key => `\`${key}\``).join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(data)); recordId = result.insertId; }
        await audit(conn, req.user, id ? 'update' : 'create', 'learning_' + resource, recordId);
        await conn.commit(); res.status(id ? 200 : 201).json({ id: recordId });
      } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
    };
    app.post(`/api/admin/learning/${resource}`, write);
    app.put(`/api/admin/learning/${resource}/:id`, write);
    app.delete(`/api/admin/learning/${resource}/:id`, async (req, res) => { const id = positiveId(req.params.id); await pool.query(`DELETE FROM learning_${resource} WHERE id=?`, [id]); await audit(pool, req.user, 'delete', 'learning_' + resource, id); res.json({ message: 'Content deleted.' }); });
  }
  app.get('/api/admin/learning/students', async (_req, res) => {
    const [enrollments] = await pool.query('SELECT e.*,u.account_active,c.title AS course_title FROM enrollments e LEFT JOIN users u ON u.id=e.user_id LEFT JOIN courses c ON c.id=e.course_id ORDER BY e.id DESC');
    for (const enrollment of enrollments) { const p = enrollment.user_id ? await outline(pool, enrollment.user_id, enrollment.course_id) : { total: 0, completed: 0 }; enrollment.progress = { completed: p.completed, total: p.total }; }
    const [attempts] = await pool.query('SELECT t.id,t.user_id,u.name,a.title,a.course_id,t.score,t.passed,t.submitted_at,t.expires_at,t.assessment_id FROM learning_attempts t JOIN users u ON u.id=t.user_id JOIN learning_assessments a ON a.id=t.assessment_id ORDER BY t.id DESC LIMIT 500');
    const [certificates] = await pool.query('SELECT * FROM learning_certificates ORDER BY id DESC');
    const [[notifications]] = await pool.query('SELECT COUNT(*) AS pending FROM learning_notifications WHERE sent_at IS NULL');
    res.json({ enrollments, attempts, certificates, email_configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM), notifications });
  });
  app.post('/api/admin/learning/enrollments/:id/approve', async (req, res) => {
    const [[enrollment]] = await pool.query('SELECT * FROM enrollments WHERE id=?', [positiveId(req.params.id)]); if (!enrollment) fail('Enrollment not found.', 404);
    await save('enrollments', { ...enrollment, status: 'approved' }, enrollment.id, req.user);
    const [[user]] = await pool.query('SELECT id,name,email,account_active FROM users WHERE email=?', [enrollment.email]);
    const [messages] = await pool.query('SELECT body FROM learning_notifications WHERE user_id=? AND sent_at IS NULL ORDER BY id DESC LIMIT 1', [user.id]);
    const activation_url = !user.account_active ? messages[0]?.body.match(/https?:\/\/\S+\/activate-account#[\w-]+/)?.[0] : null;
    res.json({ message: user.account_active ? 'Approved. The student can use their existing account.' : 'Approved. A student account and activation link are ready.', activation_url, email_configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM) });
    deliverNotifications().catch(() => {});
  });
  app.post('/api/admin/learning/enrollments/:id/invite', async (req, res) => {
    const [[user]] = await pool.query("SELECT u.id,u.name,u.email,u.account_active FROM users u JOIN enrollments e ON e.user_id=u.id WHERE e.id=? AND e.status IN ('approved','completed')", [positiveId(req.params.id)]);
    if (!user) fail('Approve this enrollment first.'); if (user.account_active) fail('This account is already active. The student should use their existing login.');
    const activation_url = await invite(pool, user); res.json({ activation_url, message: 'New activation link created. Previous links have expired.' }); deliverNotifications().catch(() => {});
  });
  app.post('/api/admin/learning/notifications/retry', async (_req, res) => res.json(await deliverNotifications()));
  app.post('/api/admin/learning/attempts/allow', async (req, res) => {
    const userId = positiveId(req.body.user_id); const assessmentId = positiveId(req.body.assessment_id);
    await pool.query('INSERT INTO learning_allowances (user_id,assessment_id,extra_attempts) VALUES (?,?,1) ON DUPLICATE KEY UPDATE extra_attempts=extra_attempts+1', [userId, assessmentId]);
    await audit(pool, req.user, 'allow_attempt', 'assessments', assessmentId); res.json({ message: 'One extra attempt granted.' });
  });
  app.patch('/api/admin/learning/certificates/:id', async (req, res) => {
    if (typeof req.body.revoked !== 'boolean') fail('Specify whether to revoke the certificate.');
    await pool.query('UPDATE learning_certificates SET revoked_at=? WHERE id=?', [req.body.revoked ? new Date() : null, positiveId(req.params.id)]);
    await audit(pool, req.user, req.body.revoked ? 'revoke' : 'restore', 'certificates', req.params.id); res.json({ message: 'Certificate updated.' });
  });
}
module.exports = { registerLearning, access, unitAccess, outline, validateAssessment };
