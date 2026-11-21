const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

test('Co-op retains its own binding and disabled or invalid settings cannot load Messenger',()=>{
  const context={window:{},Object};
  vm.runInNewContext(fs.readFileSync('co-op/messenger-config.js','utf8'),context);
  const binding=context.window.CoOpMessenger;
  assert.equal(binding.enabled,false);
  assert.equal(binding.deploymentId,'5553b3be-9c02-4666-b4a8-98c1e53c3884');
  assert.equal(context.window.ClaimsServiceMessenger,undefined);
  for(const config of [undefined,{...binding,enabled:false},{enabled:true,region:'eu-west-1',deploymentId:'invalid'},{enabled:true,region:'eu-west-2',deploymentId:'00000000-0000-4000-8000-000000000000'}]){
    let scriptCount=0;
    const button={disabled:true,addEventListener(){throw Error('Unverified binding must not add a live launcher');}};
    const status={textContent:'Messaging is currently unavailable.'};
    const document={getElementById:id=>id==='start-chat'?button:status,createElement:()=>({}),head:{appendChild(){scriptCount++;}}};
    const window={CoOpMessenger:config};
    vm.runInNewContext(fs.readFileSync('co-op/messenger.js','utf8'),{window,document,Date,setTimeout,clearTimeout});
    assert.equal(scriptCount,0);
    assert.equal(window.Genesys,undefined);
    assert.equal(button.disabled,true);
  }
});

test('enabled Co-op binding waits for a deliberate click and loads only its selected deployment',()=>{
  const context={window:{},Object};
  vm.runInNewContext(fs.readFileSync('co-op/messenger-config.js','utf8'),context);
  let click;
  const scripts=[];
  const button={disabled:true,addEventListener(event,handler){assert.equal(event,'click');click=handler;}};
  const status={textContent:''};
  const document={getElementById:id=>id==='start-chat'?button:status,createElement:()=>({}),head:{appendChild(script){scripts.push(script);}}};
  const window={CoOpMessenger:{...context.window.CoOpMessenger,enabled:true}};
  vm.runInNewContext(fs.readFileSync('co-op/messenger.js','utf8'),{window,document,Date,setTimeout:()=>1,clearTimeout(){}});
  assert.equal(button.disabled,false);
  assert.equal(scripts.length,0);
  assert.equal(window.Genesys,undefined);
  click();
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].src,'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js');
  assert.equal(window.Genesys.c.deploymentId,'5553b3be-9c02-4666-b4a8-98c1e53c3884');
  assert.equal(window.Genesys.c.environment,'prod-euw1');
  click();
  assert.equal(scripts.length,1);
});
