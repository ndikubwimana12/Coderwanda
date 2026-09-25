// Student code is sent only to a loopback Judge0 service, never an arbitrary URL.
const pool = require('./db');
const { fail, positiveId } = require('./validation');
let cache;
const enabled = () => process.env.LOCAL_RUNNER_ENABLED === 'true';
async function provider(route, method='GET', body) {
  if(!enabled()) fail('The local code runner is not connected yet. Ask your administrator to complete runner setup.',503);
  const port=Number(process.env.LOCAL_RUNNER_PORT || 2358);
  if(!Number.isInteger(port)||port<1024||port>65535)fail('Invalid local runner port.',503);
  const headers={'Content-Type':'application/json'};
  if(process.env.LOCAL_RUNNER_TOKEN)headers['X-Auth-Token']=process.env.LOCAL_RUNNER_TOKEN;
  try {
    const response=await fetch(`http://127.0.0.1:${port}`+route,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000),redirect:'error'});
    if(!response.ok)fail('The local code runner returned '+response.status+'. Please check the service.',503);
    const raw=await response.text();if(raw.length>2000000)fail('Runner output limit exceeded.',502);return JSON.parse(raw);
  }catch(error){if(error.status)throw error;fail('The local code runner is unavailable. Your saved code is safe.',503);}
}
async function languages(){
  if(!enabled())return[];
  if(cache?.port===process.env.LOCAL_RUNNER_PORT&&cache.until>Date.now())return cache.rows;
  const rows=await provider('/languages');if(!Array.isArray(rows))fail('Invalid runner language catalog.',502);
  const available=rows.filter(row=>Number.isInteger(row.id)&&row.id>0&&!/multi.file/i.test(row.name)).map(row=>({id:row.id,name:String(row.name).slice(0,160)}));
  cache={port:process.env.LOCAL_RUNNER_PORT,until:Date.now()+300000,rows:available};return available;
}
async function resolveLanguage(id){const row=(await languages()).find(item=>item.id===Number(id));if(!row)fail('Select an available programming language.');return row;}
const encode=value=>Buffer.from(value||'','utf8').toString('base64');
const decode=value=>value?Buffer.from(value,'base64').toString('utf8').slice(0,24000):'';
async function start(user,languageId,source,cases,exerciseId=null){
  const language=await resolveLanguage(languageId);if(typeof source!=='string'||!source.trim()||source.length>60000)fail('Enter source code up to 60,000 characters.');
  const conn=await pool.getConnection();let id;
  try{
    await conn.beginTransaction();await conn.query('SELECT id FROM users WHERE id=? FOR UPDATE',[user.id]);
    const[[count]]=await conn.query('SELECT COUNT(*) AS total FROM coding_runs WHERE user_id=? AND created_at>DATE_SUB(NOW(),INTERVAL 1 HOUR)',[user.id]);if(count.total>=60)fail('Hourly run limit reached. Please try again later.',429);
    const[[active]]=await conn.query("SELECT COUNT(*) AS total FROM coding_runs WHERE user_id=? AND status='running' AND created_at>DATE_SUB(NOW(),INTERVAL 2 MINUTE)",[user.id]);if(active.total>=2)fail('Wait for your current code runs to finish.',429);
    const[result]=await conn.query("INSERT INTO coding_runs(user_id,exercise_id,tokens,status) VALUES(?,?,?,'running')",[user.id,exerciseId,'[]']);id=result.insertId;await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  try{
    const submissions=cases.map(item=>({language_id:language.id,source_code:encode(source),stdin:encode(item.stdin),...(item.expected_output===undefined?{}:{expected_output:encode(item.expected_output)}),cpu_time_limit:3,wall_time_limit:10,memory_limit:256000,max_file_size:512,enable_network:false}));
    const response=await provider('/submissions/batch?base64_encoded=true','POST',{submissions});
    if(!Array.isArray(response)||response.length!==cases.length||response.some(item=>typeof item.token!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(item.token)))fail('The runner could not queue all tests.',502);
    const tokens=response.map((item,index)=>({token:item.token,label:cases[index].label,expected:cases[index].expected_output}));await pool.query('UPDATE coding_runs SET tokens=? WHERE id=?',[JSON.stringify(tokens),id]);return{id,language:language.name,status:'running'};
  }catch(error){await pool.query("UPDATE coding_runs SET status='failed' WHERE id=?",[id]);throw error;}
}
function registerExecution(app,getExercise){
  app.get('/api/practice/languages',async(_req,res)=>res.json({configured:enabled(),languages:await languages()}));
  app.post('/api/practice/exercises/:id/run',async(req,res)=>{
    const exercise=await getExercise(req.params.id,req.user);if(!/^judge0:\d+$/.test(exercise.language))fail('This exercise uses the browser runner.');
    const cases=exercise.tests.length?exercise.tests.map(item=>({label:item.label,stdin:item.stdin,expected_output:item.expected_output})):[{label:'Program output',stdin:typeof req.body.stdin==='string'?req.body.stdin.slice(0,10000):''}];res.status(202).json(await start(req.user,exercise.language.split(':')[1],req.body.source,cases,exercise.id));
  });
  app.post('/api/practice/playground/run',async(req,res)=>{
    if(!req.user.admin_access&&!req.user.is_trainer){const[[row]]=await pool.query("SELECT id FROM enrollments WHERE user_id=? AND status IN ('approved','completed') LIMIT 1",[req.user.id]);if(!row)fail('Approved enrollment is required.',403);}
    if(typeof req.body.stdin!=='string'||req.body.stdin.length>10000)fail('Standard input must be text up to 10,000 characters.');res.status(202).json(await start(req.user,positiveId(req.body.language_id),req.body.source,[{label:'Program output',stdin:req.body.stdin}]));
  });
  app.get('/api/practice/runs/:id',async(req,res)=>{
    const[[row]]=await pool.query('SELECT * FROM coding_runs WHERE id=? AND user_id=?',[positiveId(req.params.id),req.user.id]);if(!row)fail('Run not found.',404);if(row.exercise_id)await getExercise(row.exercise_id,req.user);
    if(row.status==='complete')return res.json({status:row.status,results:JSON.parse(row.results)});if(row.status==='failed')return res.json({status:'failed',results:[],error:'Run could not complete. Start a new run.'});
    const tokens=JSON.parse(row.tokens);if(!tokens.length)return res.json({status:'running',results:[]});
    const response=await provider('/submissions/batch?tokens='+tokens.map(item=>item.token).join(',')+'&base64_encoded=true&fields=token,status,stdout,stderr,compile_output,time,memory');if(!Array.isArray(response.submissions)||response.submissions.length!==tokens.length)fail('Invalid runner response.',502);
    const results=tokens.map(item=>{const run=response.submissions.find(result=>result.token===item.token);if(!run?.status)fail('Incomplete runner response.',502);return{label:item.label,status:run.status.description,status_id:run.status.id,passed:run.status.id===3,actual:decode(run.stdout),expected:item.expected,stderr:decode(run.stderr),compile_output:decode(run.compile_output),time:run.time,memory:run.memory};});
    const complete=results.every(item=>item.status_id>2);if(complete)await pool.query("UPDATE coding_runs SET status='complete',results=? WHERE id=?",[JSON.stringify(results),row.id]);else if(Date.now()-new Date(row.created_at).getTime()>120000){await pool.query("UPDATE coding_runs SET status='failed' WHERE id=?",[row.id]);return res.json({status:'failed',results,error:'Runner queue timed out. Try again later.'});}res.json({status:complete?'complete':'running',results});
  });
}
module.exports={registerExecution,resolveLanguage};
