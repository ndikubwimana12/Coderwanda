const path=require('node:path');require('../server/node_modules/dotenv').config({path:path.join(__dirname,'../server/.env')});
async function main(){
  if(process.env.LOCAL_RUNNER_ENABLED!=='true')throw Error('Runner is not enabled. Complete runner/README.md first.');
  const port=Number(process.env.LOCAL_RUNNER_PORT||2358);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
  const headers={'Content-Type':'application/json','X-Auth-Token':process.env.LOCAL_RUNNER_TOKEN||''};const base=`http://127.0.0.1:${port}`;
  async function request(route,body){const response=await fetch(base+route,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000),redirect:'error'});if(!response.ok)throw Error('Runner HTTP '+response.status);return response.json();}
  const languages=await request('/languages');const python=languages.find(item=>/^Python \(3/.test(item.name));if(!python)throw Error('Python 3 is not available in this runner.');
  const queued=await request('/submissions?base64_encoded=true',{language_id:python.id,source_code:Buffer.from('print("CodeRwanda runner ready")').toString('base64'),cpu_time_limit:3,wall_time_limit:10,memory_limit:256000,enable_network:false});
  for(let attempt=0;attempt<40;attempt++){await new Promise(resolve=>setTimeout(resolve,1500));const result=await request('/submissions/'+encodeURIComponent(queued.token)+'?base64_encoded=true');if(result.status.id<=2)continue;if(result.status.id!==3||Buffer.from(result.stdout||'','base64').toString().trim()!=='CodeRwanda runner ready')throw Error('Live execution failed: '+result.status.description);console.log(`Live runner verified. ${languages.length} language runtimes reported; Python sample passed.`);return;}
  throw Error('Runner execution timed out.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
