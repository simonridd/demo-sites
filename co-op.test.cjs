const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

test('Co-op has its own inactive binding and cannot load another demo’s Messenger',()=>{
  const context={window:{},Object};
  vm.runInNewContext(fs.readFileSync('co-op/messenger-config.js','utf8'),context);
  const binding=context.window.CoOpMessenger;
  assert.equal(binding.enabled,false);
  assert.equal(binding.deploymentId,'');
  assert.equal(context.window.ClaimsServiceMessenger,undefined);
  for(const config of [undefined,binding,{enabled:true,region:'eu-west-1',deploymentId:'invalid'},{enabled:true,region:'eu-west-2',deploymentId:'00000000-0000-4000-8000-000000000000'}]){
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
