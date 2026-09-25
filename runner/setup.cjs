const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const target=path.join(__dirname,'judge0.conf');
if(fs.existsSync(target)){console.log('Runner configuration already exists; no credentials were changed.');process.exit(0);}
const token=crypto.randomBytes(32).toString('hex');const password=()=>crypto.randomBytes(32).toString('hex');
const values={JUDGE0_TELEMETRY_ENABLE:'false',REDIS_HOST:'redis',REDIS_PASSWORD:password(),POSTGRES_HOST:'db',POSTGRES_DB:'judge0',POSTGRES_USER:'judge0',POSTGRES_PASSWORD:password(),AUTHN_HEADER:'X-Auth-Token',AUTHN_TOKEN:token,ENABLE_NETWORK:'false',ALLOW_ENABLE_NETWORK:'false',ENABLE_CALLBACKS:'false',ENABLE_ADDITIONAL_FILES:'false',ENABLE_COMPILER_OPTIONS:'false',ENABLE_COMMAND_LINE_ARGUMENTS:'false',ENABLE_BATCHED_SUBMISSIONS:'true',MAX_SUBMISSION_BATCH_SIZE:10,COUNT:2,MAX_QUEUE_SIZE:100,CPU_TIME_LIMIT:3,MAX_CPU_TIME_LIMIT:3,WALL_TIME_LIMIT:10,MAX_WALL_TIME_LIMIT:10,MEMORY_LIMIT:256000,MAX_MEMORY_LIMIT:256000,MAX_FILE_SIZE:512,MAX_MAX_FILE_SIZE:512,SECRET_KEY_BASE:password()+password()};
fs.writeFileSync(target,Object.entries(values).map(([key,value])=>`${key}=${value}`).join('\n')+'\n',{mode:0o600,flag:'wx'});
fs.writeFileSync(path.join(__dirname,'application.env'),`LOCAL_RUNNER_ENABLED=true\nLOCAL_RUNNER_PORT=2358\nLOCAL_RUNNER_TOKEN=${token}\n`,{mode:0o600,flag:'wx'});
console.log('Created private runner configuration and application.env. See runner/README.md for startup instructions.');
