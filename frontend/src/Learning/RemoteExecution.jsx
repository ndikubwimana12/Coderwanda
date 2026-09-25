import { useEffect, useRef, useState } from 'react';
import api from '../Utils/api';
export default function RemoteExecution({exerciseId,languageId,source}){
  const [stdin,setStdin]=useState('');const[state,setState]=useState(null);const[error,setError]=useState('');const[busy,setBusy]=useState(false);const generation=useRef(0);
  useEffect(()=>()=>{generation.current++;},[]);
  async function run(){const current=++generation.current;setBusy(true);setError('');setState(null);try{
    const response=await api.post(exerciseId?`/practice/exercises/${exerciseId}/run`:'/practice/playground/run',{source,stdin,language_id:languageId});
    for(let attempt=0;attempt<80;attempt++){
      if(generation.current!==current)return;
      await new Promise(resolve=>setTimeout(resolve,1500));
      const result=await api.get(`/practice/runs/${response.data.id}`);
      if(generation.current!==current)return;setState(result.data);
      if(result.data.status!=='running'){if(result.data.error)setError(result.data.error);return;}
    }
    setError('The runner is taking longer than expected. Try again later.');
  }catch(error){if(generation.current===current)setError(error.response?.data?.error||'Unable to run code.');}finally{if(generation.current===current)setBusy(false);}}
  return <section className="practice-card"><h2>Run your program</h2><label className="practice-field">Standard input (stdin)<textarea aria-label="Program input" rows="3" maxLength="10000" value={stdin} onChange={event=>setStdin(event.target.value)} placeholder="Input your program reads from the console"/></label>{exerciseId&&<p className="practice-muted mb-3">If this task has self-tests, their inputs replace the input above.</p>}<button className="practice-button" disabled={busy||!source.trim()||(!exerciseId&&!languageId)} onClick={run}>{busy?'Compiling / running…':'Run program & tests'}</button>{busy&&<button className="practice-button secondary ml-3" onClick={()=>{generation.current++;setBusy(false);setError('Stopped waiting. The isolated run still has its server-enforced time limit.');}}>Stop waiting</button>}{error&&<p role="alert" className="practice-notice practice-error mt-4">{error}</p>}{state?.results.map((item,index)=><div key={index} className={`practice-test ${item.status_id>2?item.passed?'pass':'fail':''}`}><strong>{item.label} · {item.status}</strong><pre className="practice-console mt-3">{item.compile_output||item.stderr||item.actual||'No output'}</pre>{item.expected!==undefined&&<p className="practice-muted mt-2">Expected output: <code className="whitespace-pre-wrap">{item.expected}</code></p>}<p className="practice-muted mt-2">{item.time??'—'} seconds · {item.memory??'—'} KB memory</p></div>)}</section>;
}
