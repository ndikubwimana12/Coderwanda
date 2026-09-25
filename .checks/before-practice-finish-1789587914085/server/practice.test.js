const test=require('node:test');const assert=require('node:assert/strict');const crypto=require('node:crypto');const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'.env')});process.env.SMTP_HOST='';
const mysql=require('mysql2/promise');
test('practical learning, marking and classroom privacy',async t=>{
  const database='coderwanda_test_'+crypto.randomBytes(6).toString('hex');const connection=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||''});let pool,server,created=false;
  try{
    await connection.query(`CREATE DATABASE \`${database}\``);created=true;process.env.DB_NAME=database;pool=require('./db');await require('./migrate')();await require('./migrate')();server=require('./app').listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const origin='http://127.0.0.1:'+server.address().port;
    async function request(route,method='GET',body,token){const response=await fetch(origin+'/api'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return{status:response.status,data:await response.json()};}
    const post=(route,body,token)=>request(route,'POST',body,token);async function create(route,body,token){const result=await post(route,body,token);assert.equal(result.status,201,JSON.stringify(result.data));return result.data.id;}
    async function user(name){const result=await post('/auth/register',{name,email:name+'@example.test',phone:'0780000000',password:'practice-test-password'});assert.equal(result.status,201);return result.data;}
    const administrator=await user('Admin');await pool.query("UPDATE users SET role='admin' WHERE id=?",[administrator.user.id]);const admin=administrator.token;const trainer=await user('Trainer');const student=await user('Student');const outsider=await user('Outsider');
    const course=await create('/admin/courses',{title:'Practical course',slug:'practical-course',category:'Software',level:'Beginner',duration:'2 Weeks',price:0,description:'Learn by doing'},admin);
    const moduleId=await create('/admin/learning/modules',{course_id:course,title:'Module',position:1,published:1},admin);
    const unit=await create('/admin/learning/units',{module_id:moduleId,title:'First unit',content:'Learn functions',position:1,published:1},admin);
    const next=await create('/admin/learning/units',{module_id:moduleId,title:'Next unit',content:'Learn arrays',position:2,published:1},admin);
    await create('/admin/enrollments',{course_id:course,full_name:'Student',email:student.user.email,phone:'0780000000',status:'approved'},admin);
    await post(`/learning/modules/${moduleId}/enroll`,{},student.token);
    const task={unit_id:unit,title:'Add two numbers',instructions:'Return the sum and explain your tests.',language:'javascript',starter:{'main.js':'function add(a,b){return 0;}'},tests:[{label:'Positive numbers',functionName:'add',args:[2,3],expected:5}],rubric:[{label:'Correctness',points:70},{label:'Clarity',points:30}],pass_mark:70,required:1,published:1};let exercise,submission;
    await t.test('only admins assign trainers; course trainers do not gain dashboard rights',async()=>{
      assert.equal((await request(`/practice/courses/${course}/trainers`,'PUT',{user_ids:[trainer.user.id]},student.token)).status,403);
      assert.equal((await request(`/practice/courses/${course}/trainers`,'PUT',{user_ids:[trainer.user.id]},admin)).status,200);
      assert.equal((await request('/admin/users','GET',null,trainer.token)).status,403);
      assert.equal((await request('/auth/me','GET',null,trainer.token)).data.is_trainer,1);
      assert.equal((await request(`/practice/courses/${course}/studio`,'GET',null,outsider.token)).status,403);
      exercise=await create('/practice/exercises',task,trainer.token);
      assert.equal((await post('/practice/exercises',task,student.token)).status,403);
    });
    await t.test('drafts persist, reject stale writes and remain private',async()=>{
      const files={'main.js':'function add(a,b){return a-b;}'};
      assert.equal((await request(`/practice/exercises/${exercise}/draft`,'PUT',{files,revision:0},student.token)).status,200);
      assert.equal((await request(`/practice/exercises/${exercise}/draft`,'PUT',{files,revision:0},student.token)).status,409);
      assert.equal((await request(`/practice/exercises/${exercise}/draft`,'PUT',{files,revision:1},student.token)).data.revision,2);
      assert.equal((await request(`/practice/exercises/${exercise}`,'GET',null,student.token)).data.draft.files['main.js'],files['main.js']);
      assert.equal((await request(`/practice/exercises/${exercise}`,'GET',null,outsider.token)).status,403);
      submission=await create(`/practice/exercises/${exercise}/submit`,{files,version:1,reflection:'I tested positive numbers',score:100,passed:true},student.token);
      assert.equal((await post(`/practice/exercises/${exercise}/submit`,{files,version:1,reflection:''},student.token)).status,409);
      assert.equal((await request(`/practice/submissions/${submission}`,'GET',null,student.token)).data.score,null);
      assert.equal((await request(`/practice/submissions/${submission}`,'GET',null,outsider.token)).status,403);
    });
    await t.test('marking uses original rubric and validates feedback against submitted lines',async()=>{
      await request(`/practice/exercises/${exercise}`,'PUT',{...task,rubric:[{label:'New rubric',points:100}]},trainer.token);
      const review={marks:[20,20],feedback:'Use addition rather than subtraction.',annotations:[{file:'main.js',line:1,kind:'mistake',message:'The subtraction operator produces a difference; use + for this task.'}]};
      assert.equal((await post(`/practice/submissions/${submission}/review`,review,student.token)).status,403);
      assert.equal((await post(`/practice/submissions/${submission}/review`,{...review,marks:[100,100]},trainer.token)).status,400);
      assert.equal((await post(`/practice/submissions/${submission}/review`,{...review,annotations:[{...review.annotations[0],line:99}]},trainer.token)).status,400);
      const result=await post(`/practice/submissions/${submission}/review`,review,trainer.token);assert.equal(result.status,200);assert.equal(result.data.score,40);assert.equal(result.data.passed,false);
      assert.equal((await post(`/practice/submissions/${submission}/review`,review,trainer.token)).status,409);
      const record=(await request(`/practice/submissions/${submission}`,'GET',null,student.token)).data;assert.equal(record.snapshot.rubric.length,2);assert.equal(record.annotations[0].line,1);
    });
    await t.test('required practical gates unit progress until an improved submission passes',async()=>{
      await pool.query('INSERT INTO student_units(user_id,unit_id,read_at,completed_at) VALUES(?,?,NOW(),NOW())',[student.user.id,unit]);
      const before=(await request(`/learning/courses/${course}`,'GET',null,student.token)).data;assert.equal(before.completed,0);assert.equal(before.units[0].practicals_pending,1);
      assert.equal((await request(`/learning/units/${next}`,'GET',null,student.token)).status,403);
      const corrected=await create(`/practice/exercises/${exercise}/submit`,{files:{'main.js':'function add(a,b){return a+b;}'},version:2,reflection:'Changed - to + and tested again.'},student.token);
      const result=await post(`/practice/submissions/${corrected}/review`,{marks:[90],feedback:'Correct solution. Add a zero-input case next.',annotations:[]},trainer.token);assert.equal(result.data.passed,true);
      assert.equal((await request(`/learning/courses/${course}`,'GET',null,student.token)).data.completed,1);
      assert.equal((await request(`/learning/units/${next}`,'GET',null,student.token)).status,200);
      const history=(await request(`/practice/exercises/${exercise}`,'GET',null,student.token)).data.submissions;assert.equal(history.length,2);assert.equal(history[1].files['main.js'],'function add(a,b){return a-b;}');
    });
    await t.test('classroom and private help enforce thread membership and moderation',async()=>{
      const chat=`/practice/courses/${course}/chat`;const help=chat+'?student='+student.user.id;
      const shared=await create(chat,{body:'How can I test zero?'},student.token);
      const secret=await create(help,{body:'Private question about my feedback.'},student.token);
      assert.equal((await request(chat,'GET',null,trainer.token)).data.messages.length,1);
      assert.equal((await request(help,'GET',null,trainer.token)).data.messages[0].id,secret);
      assert.equal((await request(help,'GET',null,outsider.token)).status,403);
      assert.equal((await post(chat,{body:'Leaked reply',reply_to:secret},trainer.token)).status,400);
      assert.equal((await post(help,{body:'Try add(0,0).',reply_to:secret},trainer.token)).status,201);
      assert.equal((await request(chat+'/'+shared,'DELETE',null,trainer.token)).status,200);
      assert.equal((await request(chat,'GET',null,student.token)).data.messages[0].body,'Message removed');
      await request(`/practice/courses/${course}/trainers`,'PUT',{user_ids:[]},admin);
      assert.equal((await request(help,'GET',null,trainer.token)).status,403);
    });
  }finally{if(server)await new Promise(resolve=>server.close(resolve));if(pool)await pool.end();if(created&&/^coderwanda_test_[a-f0-9]{12}$/.test(database))await connection.query(`DROP DATABASE \`${database}\``);await connection.end();}
});
