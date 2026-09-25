const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.SMTP_HOST = ''; // Tests must never send real email.
const mysql = require('mysql2/promise');

test('complete learning lifecycle and authorization', async t => {
  const database = `coderwanda_test_${crypto.randomBytes(6).toString('hex')}`;
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' });
  let created = false, pool, server; const uploaded = [];
  try {
    await connection.query(`CREATE DATABASE \`${database}\``); created = true; process.env.DB_NAME = database;
    pool = require('./db'); await require('./migrate')(); await require('./migrate')();
    server = require('./app').listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    async function request(route, method='GET', body, token) {
      const response = await fetch(origin + '/api' + route, { method, headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}) }, body:body?JSON.stringify(body):undefined });
      const data = await response.json(); return { status:response.status,data };
    }
    const post = (route,body,token) => request(route,'POST',body,token);
    async function create(route,body,token) { const response=await post(route,body,token);assert.equal(response.status,201,JSON.stringify(response.data));return response.data.id; }
    const account={name:'Learning Admin',email:'admin@example.test',phone:'0780000000',password:'admin-password-123'};
    const registered=await post('/auth/register',account);await pool.query("UPDATE users SET role='admin' WHERE id=?",[registered.data.user.id]);
    const admin=(await post('/auth/login',account)).data.token;
    const outsider=(await post('/auth/register',{...account,email:'outsider@example.test'})).data.token;
    const courseId=await create('/admin/courses',{title:'Learning Course',slug:'learning-course',category:'Software',level:'Beginner',duration:'2 Weeks',price:10000,description:'Practical learning'},admin);
    const moduleId=await create('/admin/learning/modules',{course_id:courseId,title:'Foundations',description:'Start here',position:1,published:1},admin);
    let imagePath;
    await t.test('admin-only content management and private media uploads',async()=>{
      assert.equal((await post('/admin/learning/modules',{course_id:courseId,title:'Unauthorized'},outsider)).status,403);
      const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1cAAAAASUVORK5CYII=','base64');
      const response=await fetch(origin+'/api/admin/learning/media',{method:'POST',headers:{Authorization:'Bearer '+admin,'Content-Type':'image/png'},body:bytes});assert.equal(response.status,201);const media=await response.json();imagePath=media.path;uploaded.push(imagePath);
      assert.equal((await fetch(origin+media.preview)).status,200);
      assert.equal((await fetch(origin+'/api/learning/media/'+imagePath.split('/').pop())).status,403);
      const invalid=await fetch(origin+'/api/admin/learning/media',{method:'POST',headers:{Authorization:'Bearer '+admin,'Content-Type':'image/png'},body:'<script>invalid</script>'});assert.equal(invalid.status,400);
    });
    const unit1=await create('/admin/learning/units',{module_id:moduleId,title:'First unit',content:'Learn the first concept.',image_url:imagePath,position:1,published:1},admin);
    const unit2=await create('/admin/learning/units',{module_id:moduleId,title:'Second unit',content:'Practice the second concept.',position:2,published:1},admin);
    const questions=[{prompt:'What is 2 + 2?',options:['3','4'],correct:1,points:2,explanation:'Two plus two is four.'}];
    const quiz1=await create('/admin/learning/assessments',{course_id:courseId,unit_id:unit1,title:'First check',kind:'unit',questions,max_attempts:2,published:1},admin);
    const quiz2=await create('/admin/learning/assessments',{course_id:courseId,unit_id:unit2,title:'Second check',kind:'unit',questions,published:1},admin);
    const exam=await create('/admin/learning/assessments',{course_id:courseId,title:'Final exam',kind:'exam',questions,published:1},admin);
    let enrollmentId,student,studentId,activation;
    await t.test('enrollment approval creates a pending account with single-use activation',async()=>{
      const application=await post('/enrollments',{course_id:courseId,full_name:'Test Learner',email:'learner@example.test',phone:'0780000001'});assert.equal(application.status,201);enrollmentId=application.data.enrollmentId;
      assert.equal((await request('/learning/courses/'+courseId,'GET',null,outsider)).status,403);
      const approval=await post(`/admin/learning/enrollments/${enrollmentId}/approve`,{},admin);assert.equal(approval.status,200);assert.ok(approval.data.activation_url);activation=approval.data.activation_url.split('#')[1];
      const [[user]]=await pool.query("SELECT * FROM users WHERE email='learner@example.test'");assert.equal(user.account_active,0);assert.equal(user.role,'user');studentId=user.id;
      assert.equal((await post('/auth/login',{email:user.email,password:'anything'})).status,401);
      const activated=await post('/auth/activate',{token:activation,password:'learner-password-123'});assert.equal(activated.status,200);student=activated.data.token;assert.equal(activated.data.user.id,studentId);
      assert.equal((await post('/auth/activate',{token:activation,password:'another-password'})).status,400);
      const second=await post(`/admin/learning/enrollments/${enrollmentId}/approve`,{},admin);assert.equal(second.status,200);assert.equal(second.data.activation_url,null);
      const [[count]]=await pool.query("SELECT COUNT(*) AS total FROM users WHERE email='learner@example.test'");assert.equal(count.total,1);
      const login=await post('/auth/login',{email:'learner@example.test',password:'learner-password-123'});assert.equal(login.data.user.is_student,true);
    });
    await t.test('module membership, sequential units, quiz prerequisites and answer secrecy',async()=>{
      assert.equal((await request(`/learning/units/${unit1}`,'GET',null,student)).status,403);
      assert.equal((await post(`/learning/modules/${moduleId}/enroll`,{},student)).status,200);
      assert.equal((await request(`/learning/units/${unit2}`,'GET',null,student)).status,403);
      const lesson=await request(`/learning/units/${unit1}`,'GET',null,student);assert.equal(lesson.status,200);assert.ok(lesson.data.image_url.includes('?access='));assert.equal((await fetch(origin+lesson.data.image_url)).status,200);
      assert.equal((await post(`/learning/assessments/${quiz1}/start`,{},student)).status,403);
      assert.equal((await post(`/learning/assessments/${exam}/start`,{},student)).status,403);
      assert.equal((await post(`/learning/units/${unit1}/studied`,{},student)).status,200);
      const started=await post(`/learning/assessments/${quiz1}/start`,{},student);assert.equal(started.status,200);assert.equal(started.data.questions[0].correct,undefined);assert.equal(started.data.questions[0].explanation,undefined);
      const resumed=await post(`/learning/assessments/${quiz1}/start`,{},student);assert.equal(resumed.data.id,started.data.id);
      assert.equal((await post(`/learning/attempts/${started.data.id}/submit`,{answers:[1]},outsider)).status,404);
      const failed=await post(`/learning/attempts/${started.data.id}/submit`,{answers:[0],score:100,passed:true},student);assert.equal(failed.data.score,0);assert.equal(failed.data.passed,false);
      const repeated=await post(`/learning/attempts/${started.data.id}/submit`,{answers:[1]},student);assert.equal(repeated.data.score,0);
    });
    await t.test('expired attempts cannot pass and admins can grant another attempt',async()=>{
      const started=await post(`/learning/assessments/${quiz1}/start`,{},student);assert.equal(started.status,200);
      await pool.query('UPDATE learning_attempts SET expires_at=DATE_SUB(NOW(), INTERVAL 1 MINUTE) WHERE id=?',[started.data.id]);
      const expired=await post(`/learning/attempts/${started.data.id}/submit`,{answers:[1]},student);assert.equal(expired.data.score,0);assert.equal(expired.data.expired,true);
      assert.equal((await post(`/learning/assessments/${quiz1}/start`,{},student)).status,403);
      assert.equal((await post('/admin/learning/attempts/allow',{user_id:studentId,assessment_id:quiz1},admin)).status,200);
      const allowed=await post(`/learning/assessments/${quiz1}/start`,{},student);assert.equal(allowed.status,200);
      const passed=await post(`/learning/attempts/${allowed.data.id}/submit`,{answers:[1]},student);assert.equal(passed.data.score,100);assert.equal(passed.data.passed,true);assert.equal(passed.data.certificate,null);
      const course=await request('/learning/courses/'+courseId,'GET',null,student);assert.equal(course.data.completed,1);assert.equal(course.data.ready,false);
    });
    let certificateCode;
    await t.test('all units plus final exam issue a verifiable certificate',async()=>{
      assert.equal((await request(`/learning/units/${unit2}`,'GET',null,student)).status,200);
      await post(`/learning/units/${unit2}/studied`,{},student);
      const second=await post(`/learning/assessments/${quiz2}/start`,{},student);assert.equal(second.status,200);
      assert.equal((await post(`/learning/attempts/${second.data.id}/submit`,{answers:[1]},student)).data.passed,true);
      const startExam=await post(`/learning/assessments/${exam}/start`,{},student);assert.equal(startExam.status,200);
      const final=await post(`/learning/attempts/${startExam.data.id}/submit`,{answers:[1]},student);assert.equal(final.data.passed,true);assert.ok(final.data.certificate);certificateCode=final.data.certificate;
      const cert=await request('/certificates/'+certificateCode);assert.equal(cert.data.student_name,'Test Learner');assert.equal(cert.data.course_title,'Learning Course');
      const dashboard=await request('/learning/dashboard','GET',null,student);assert.equal(dashboard.data.courses[0].progress.percent,100);assert.equal(dashboard.data.certificates.length,1);
      const report=await request('/admin/learning/students','GET',null,admin);assert.equal(report.data.enrollments[0].progress.completed,2);assert.ok(report.data.attempts.length>=5);
      const id=report.data.certificates[0].id;
      assert.equal((await request('/admin/learning/certificates/'+id,'PATCH',{revoked:true},student)).status,403);
      assert.equal((await request('/admin/learning/certificates/'+id,'PATCH',{revoked:true},admin)).status,200);
      assert.ok((await request('/certificates/'+certificateCode)).data.revoked_at);
      await request('/admin/learning/certificates/'+id,'PATCH',{revoked:false},admin);
    });
    await t.test('revoking course access blocks learning and previously signed media',async()=>{
      const lesson=await request(`/learning/units/${unit1}`,'GET',null,student);
      await request('/admin/enrollments/'+enrollmentId+'/status','PATCH',{status:'rejected'},admin);
      assert.equal((await request('/learning/courses/'+courseId,'GET',null,student)).status,403);
      assert.equal((await fetch(origin+lesson.data.image_url)).status,403);
      assert.equal((await request('/certificates/'+certificateCode)).status,200);
    });
    await t.test('approval reuses existing accounts without changing their password or role',async()=>{
      const application=await post('/enrollments',{course_id:courseId,full_name:'Existing User',email:'outsider@example.test',phone:'0780000000'});
      const approved=await request(`/admin/enrollments/${application.data.enrollmentId}/status`,'PATCH',{status:'approved'},admin);assert.equal(approved.status,200);
      const login=await post('/auth/login',{email:'outsider@example.test',password:account.password});assert.equal(login.status,200);assert.equal(login.data.user.role,'user');assert.equal(login.data.user.is_student,true);
      const [[count]]=await pool.query("SELECT COUNT(*) AS total FROM users WHERE email='outsider@example.test'");assert.equal(count.total,1);
    });
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));if(pool)await pool.end();
    for(const file of uploaded)if(/^\/learning-media\/[a-f0-9-]+\.(png|mp4|webm)$/.test(file))await fs.unlink(path.join(__dirname,file.slice(1))).catch(()=>{});
    if(created&&/^coderwanda_test_[a-f0-9]{12}$/.test(database))await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
});
