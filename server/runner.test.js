// Contract tests use a local fake Judge0 API; they do not claim compiler verification.
const test=require('node:test');const assert=require('node:assert/strict');const http=require('node:http');const crypto=require('node:crypto');const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'.env')});process.env.SMTP_HOST='';
const mysql=require('mysql2/promise');
test('local-only language runner contract and authorization',async t=>{
  const database='coderwanda_test_'+crypto.randomBytes(6).toString('hex');const connection=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||''});let created=false,pool,server,runner;const queued=new Map();let received=[];
  try{
    runner=http.createServer(async(req,res)=>{
      res.setHeader('Content-Type','application/json');assert.equal(req.headers['x-auth-token'],'test-runner-secret');
      if(req.url==='/languages')return res.end(JSON.stringify([{id:71,name:'Python (test runtime)'},{id:62,name:'Java (test runtime)'},{id:89,name:'Multi-file program'}]));
      if(req.method==='POST'){let raw='';for await(const part of req)raw+=part;const body=JSON.parse(raw);received=body.submissions;const tokens=body.submissions.map((item,index)=>{const token=crypto.randomUUID();queued.set(token,{...item,index});return{token};});return res.end(JSON.stringify(tokens));}
      const tokens=new URL(req.url,'http://127.0.0.1').searchParams.get('tokens').split(',');return res.end(JSON.stringify({submissions:tokens.map(token=>({token,status:{id:3,description:'Accepted'},stdout:queued.get(token).expected_output||Buffer.from('hello\n').toString('base64'),stderr:null,compile_output:null,time:'0.01',memory:4000}))}));
    }).listen(0,'127.0.0.1');await new Promise(resolve=>runner.once('listening',resolve));process.env.LOCAL_RUNNER_ENABLED='true';process.env.LOCAL_RUNNER_PORT=String(runner.address().port);process.env.LOCAL_RUNNER_TOKEN='test-runner-secret';
    await connection.query(`CREATE DATABASE \`${database}\``);created=true;process.env.DB_NAME=database;pool=require('./db');await require('./migrate')();server=require('./app').listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const origin='http://127.0.0.1:'+server.address().port;
    async function request(route,method='GET',body,token){const response=await fetch(origin+'/api'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return{status:response.status,data:await response.json()};}
    const signup=await request('/auth/register','POST',{name:'Admin',email:'runner@example.test',phone:'0780000000',password:'runner-password'});const admin=signup.data.token;await pool.query("UPDATE users SET role='admin' WHERE id=?",[signup.data.user.id]);
    const outsider=(await request('/auth/register','POST',{name:'Other',email:'other@example.test',phone:'0780000000',password:'runner-password'})).data.token;
    async function create(route,body){const result=await request(route,'POST',body,admin);assert.equal(result.status,201,JSON.stringify(result.data));return result.data.id;}
    const course=await create('/admin/courses',{title:'Runner Course',slug:'runner-course',category:'Programming',level:'Beginner',duration:'1 Week',price:0,description:'Practice code'});const moduleId=await create('/admin/learning/modules',{course_id:course,title:'Module',published:1});const unit=await create('/admin/learning/units',{module_id:moduleId,title:'Unit',content:'Learn',published:1});let exercise,run;
    await t.test('runtime catalog is discovered and unavailable languages rejected',async()=>{
      assert.equal((await request('/practice/languages')).status,401);const catalog=await request('/practice/languages','GET',null,admin);assert.deepEqual(catalog.data.languages.map(item=>item.id),[71,62]);assert.equal(JSON.stringify(catalog.data).includes('test-runner-secret'),false);
      const task={unit_id:unit,title:'Python sum',instructions:'Read two numbers and print their sum.',language:'judge0:71',starter:{main:'a,b=map(int,input().split())\nprint(a+b)'},tests:[{label:'Sum',stdin:'2 3\n',expected_output:'5\n'}],rubric:[{label:'Correctness',points:100}],pass_mark:70,published:1};exercise=await create('/practice/exercises',task);
      assert.equal((await request('/practice/exercises','POST',{...task,language:'judge0:999'},admin)).status,400);
    });
    await t.test('server selects tests, limits and language; no user-supplied execution options',async()=>{
      const result=await request(`/practice/exercises/${exercise}/run`,'POST',{source:'print(5)',stdin:'forged',language_id:62,enable_network:true,cpu_time_limit:999,expected_output:'fake'},admin);assert.equal(result.status,202);run=result.data.id;
      assert.equal(received[0].language_id,71);assert.equal(received[0].enable_network,false);assert.equal(received[0].cpu_time_limit,3);assert.equal(Buffer.from(received[0].stdin,'base64').toString(),'2 3\n');assert.equal(Buffer.from(received[0].expected_output,'base64').toString(),'5\n');
      assert.equal((await request(`/practice/runs/${run}`,'GET',null,outsider)).status,404);const resultRun=await request(`/practice/runs/${run}`,'GET',null,admin);assert.equal(resultRun.data.status,'complete');assert.equal(resultRun.data.results[0].actual,'5\n');assert.equal(JSON.stringify(resultRun.data).includes('token'),false);
    });
    await t.test('playground requires enrollment or teaching rights and handles disconnected service',async()=>{
      assert.equal((await request('/practice/playground/run','POST',{source:'print(1)',stdin:'',language_id:71},outsider)).status,403);
      const result=await request('/practice/playground/run','POST',{source:'class Main {}',stdin:'',language_id:62},admin);assert.equal(result.status,202);assert.equal(received[0].language_id,62);await request('/practice/runs/'+result.data.id,'GET',null,admin);
      process.env.LOCAL_RUNNER_ENABLED='false';assert.equal((await request('/practice/languages','GET',null,admin)).data.configured,false);assert.equal((await request('/practice/playground/run','POST',{source:'print(1)',stdin:'',language_id:71},admin)).status,400);
    });
  }finally{if(server)await new Promise(resolve=>server.close(resolve));if(runner)await new Promise(resolve=>runner.close(resolve));if(pool)await pool.end();if(created&&/^coderwanda_test_[a-f0-9]{12}$/.test(database))await connection.query(`DROP DATABASE \`${database}\``);await connection.end();}
});
