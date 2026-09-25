// Learner code never executes in the application origin or on the API server.
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
export function runnerDocument(files, tests, language, token) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const worker = `
    const send = self.postMessage.bind(self); let logs = [];
    const printable = value => { try { return typeof value === 'string' ? value : JSON.stringify(value); } catch { return String(value); } };
    console.log = console.info = console.warn = console.error = (...values) => { if(logs.length<100) logs.push(values.map(printable).join(' ').slice(0,2000)); };
    self.onmessage = async event => {
      const {code,tests} = event.data;
      try {
        const names = [...new Set(tests.map(test=>test.functionName))];
        const exported = new Function(code + '\\n;return {' + names.map(name=>JSON.stringify(name)+': typeof '+name+'=== "function" ? '+name+' : null').join(',') + '};')();
        const canonical = value => JSON.stringify(value, (_key,item)=>item && typeof item==='object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])) : item);
        const results = [];
        for(const test of tests) {
          try { if(!exported[test.functionName]) throw Error('Define function '+test.functionName); const actual = await exported[test.functionName](...test.args); results.push({label:test.label,passed:canonical(actual)===canonical(test.expected),actual:printable(actual)?.slice(0,2000) || String(actual),expected:printable(test.expected)}); }
          catch(error){results.push({label:test.label,passed:false,error:String(error.message).slice(0,2000)});}
        }
        send({logs,results});
      }catch(error){send({logs,results:[],error:String(error.message).slice(0,2000)});}
    };
  `;
  const payload = { files, tests, language, token };
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval'; worker-src blob:; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>body{font:16px system-ui;margin:20px;color:#0f172a}*{box-sizing:border-box}</style></head><body><main id="preview"></main><script nonce="${nonce}">
    const payload=${json(payload)};const report=data=>parent.postMessage({type:'coderwanda-run',token:payload.token,...data},'*');
    const preview=document.getElementById('preview');const domResults=[];
    if(payload.language==='web'){
      const template=document.createElement('template');template.innerHTML=payload.files['index.html'];
      template.content.querySelectorAll('script,iframe,object,embed,meta,link,base').forEach(node=>node.remove());
      template.content.querySelectorAll('*').forEach(node=>Array.from(node.attributes).forEach(attr=>{if(attr.name.startsWith('on')||['href','srcdoc','action','formaction'].includes(attr.name))node.removeAttribute(attr.name);}));
      preview.append(template.content);const style=document.createElement('style');style.textContent=payload.files['style.css'];document.head.append(style);
      document.addEventListener('click',event=>event.preventDefault());document.addEventListener('submit',event=>event.preventDefault());
      for(const test of payload.tests){try{const node=preview.querySelector(test.selector);domResults.push({label:test.label,passed:!!node&&(!test.expectedText||node.textContent.includes(test.expectedText)),actual:node?node.textContent.slice(0,2000):'Element not found',expected:test.expectedText||'Element exists'});}catch(error){domResults.push({label:test.label,passed:false,error:error.message});}}
    }else{preview.textContent='JavaScript runs in an isolated worker. See the console and self-tests below.';}
    let worker;let timer;
    try{
      const url=URL.createObjectURL(new Blob([${json(worker)}],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);
      timer=setTimeout(()=>{worker.terminate();report({logs:[],results:domResults,error:'Execution stopped after 3 seconds. Check for an infinite loop or unresolved promise.'});},3000);
      worker.onmessage=event=>{clearTimeout(timer);worker.terminate();report({...event.data,results:[...domResults,...(event.data.results||[])]});};
      worker.onerror=()=>{clearTimeout(timer);worker.terminate();report({logs:[],results:domResults,error:'JavaScript could not run in this browser.'});};
      worker.postMessage({code:payload.files['main.js'],tests:payload.language==='javascript'?payload.tests:[]});
    }catch(error){clearTimeout(timer);report({logs:[],results:domResults,error:error.message});}
  </script></body></html>`;
}
