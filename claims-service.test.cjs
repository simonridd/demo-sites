const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('claims-service/messenger.js','utf8');
const valid={enabled:true,region:'eu-west-1',deploymentId:'00000000-0000-4000-8000-000000000000'};
function harness(config){
 const handlers={},scripts=[],timers=[];
 const button={disabled:true,addEventListener:(name,fn)=>handlers[name]=fn};
 const status={textContent:'unavailable'};
 const document={getElementById:id=>id==='start-chat'?button:status,createElement:()=>({}),head:{appendChild:script=>scripts.push(script)}};
 const window={ClaimsServiceMessenger:config};
 vm.runInNewContext(source,{window,document,Date,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{}});
 return {window,button,status,scripts,timers,click:()=>handlers.click?.()};
}
test('Claims page without a verified enabled binding creates no provider script or session',()=>{
 for(const config of [undefined,{...valid,enabled:false},{...valid,region:'eu-west-2'},{...valid,deploymentId:'https://untrusted.invalid/x'}]){
  const h=harness(config);h.click();assert.equal(h.button.disabled,true);assert.equal(h.scripts.length,0);assert.equal(h.window.Genesys,undefined);
 }
 const shipped={window:{},Object};vm.runInNewContext(fs.readFileSync('claims-service/messenger-config.js','utf8'),shipped);
 assert.equal(shipped.window.ClaimsServiceMessenger.enabled,false);assert.equal(shipped.window.ClaimsServiceMessenger.deploymentId,null);
});
test('Messenger waits for deliberate start and ready; repeated clicks cannot duplicate bootstrap',()=>{
 const h=harness(valid);assert.equal(h.scripts.length,0);assert.equal(h.button.disabled,false);
 h.click();h.click();assert.equal(h.scripts.length,1);assert.equal(h.scripts[0].src,'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js');
 const ready=h.window.Genesys.q.find(args=>args[0]==='subscribe'&&args[1]==='Messenger.ready')[2];
 assert.equal(h.window.Genesys.q.filter(args=>args[0]==='command').length,0);
 ready();assert.equal(h.button.disabled,false);assert.equal(h.window.Genesys.q.filter(args=>args[1]==='Messenger.open').length,1);
 assert.equal(h.window.Genesys.c.deploymentId,valid.deploymentId);
 h.click();assert.equal(h.scripts.length,1);assert.equal(h.window.Genesys.q.filter(args=>args[1]==='Messenger.open').length,2);
});
test('SDK errors/timeouts show unavailable and late readiness cannot open a conversation',()=>{
 for(const fail of [h=>h.scripts[0].onerror(),h=>h.timers[0]()]){
  const h=harness(valid);h.click();fail(h);assert.equal(h.button.disabled,true);assert.match(h.status.textContent,/currently unavailable/);
  const ready=h.window.Genesys.q.find(args=>args[1]==='Messenger.ready')[2];ready();
  assert.equal(h.window.Genesys.q.filter(args=>args[0]==='command').length,0);
 }
});
