import { PHP, loadPHPRuntime, setPhpIniEntries } from '@php-wasm/universal';
import { getPHPLoaderModule } from '@php-wasm/web-8-4';

// This is the browser build: no host filesystem, process launcher or networking adapter.
self.onmessage = async event => {
  const { source, stdin, tests } = event.data;
  try {
    const php = new PHP(await loadPHPRuntime(await getPHPLoaderModule()));
    await setPhpIniEntries(php, { memory_limit:'64M', max_execution_time:3, allow_url_fopen:'0', allow_url_include:'0', display_errors:'0', log_errors:'1', disable_functions:'exec,shell_exec,system,passthru,popen,proc_open,pcntl_exec,dl,putenv,mail,fsockopen,pfsockopen,stream_socket_client,curl_exec,curl_multi_exec' });
    php.mkdir('/workspace');
    self.postMessage({type:'ready'});
    const cases=tests.length?tests:[{label:'Program output',stdin,expected_output:undefined}];
    const results=[];
    for(const item of cases){
      php.writeFile('/workspace/stdin.txt',item.stdin||'');
      const prefix='<?php if (!defined("STDIN")) define("STDIN", fopen("/workspace/stdin.txt", "r")); ?>';
      const response=await php.run({code:prefix+source,method:'POST',body:item.stdin||''});
      const actual=response.text.slice(0,64000);const error=response.errors.slice(0,8000);
      const normalize=value=>value.replace(/\r\n/g,'\n').trimEnd();
      results.push({label:item.label,actual,expected:item.expected_output,passed:response.exitCode===0&&!error&&(item.expected_output===undefined||normalize(actual)===normalize(item.expected_output)),error,exitCode:response.exitCode});
    }
    php.exit();self.postMessage({type:'result',results});
  }catch(error){self.postMessage({type:'error',error:String(error.message||error).slice(0,8000)});}
};
