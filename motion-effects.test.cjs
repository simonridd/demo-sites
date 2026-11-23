const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'kits/shorts-lab/effects');
test('original eighty study identities remain stable through the portable extension',async()=>{
 const {effects}=await import('./kits/shorts-lab/effects-data.mjs');
 const baseline=require('./tools/fixtures/motion-atlas-original-ids.json');
 assert.deepEqual(effects.slice(0,80).map(({id,title,preview})=>({id,title,preview})),baseline);
 assert.deepEqual(effects.slice(80).map(e=>[e.id,e.preview]),[[81,'comparison'],[82,'aurora-text']]);
});
test('portable registry resolves to real original examples and shipped assets without runtime packages',async()=>{
 const registry=JSON.parse(fs.readFileSync(path.join(dir,'registry.json')));
 const {renderStudy}=await import('./kits/shorts-lab/effects/studies.mjs');
 const {mountEffect,mountEffects}=await import('./kits/shorts-lab/effects/atlas.mjs');
 assert.deepEqual(registry.runtimeDependencies,[]);
 assert.equal(typeof mountEffect,'function');assert.equal(typeof mountEffects,'function');
 for(const item of registry.effects){
  const html=renderStudy(item.key,'test-'+item.key);
  assert.ok(html.includes('data-atlas="'+item.key+'"'),item.key);
  assert.ok(!html.includes('undefined'));
  for(const file of [registry.entry,registry.stylesheet,registry.examples,registry.guide])assert.ok(fs.statSync(path.join(dir,file)).isFile());
 }
 const assets=['before.svg','after.svg','wave-sprite.svg'];
 for(const file of assets)assert.match(fs.readFileSync(path.join(dir,'assets',file),'utf8'),/^<svg/);
 assert.match(fs.readFileSync(path.join(dir,'DICE-LICENSE.txt'),'utf8'),/MIT|Permission is hereby granted/);
 assert.equal(renderStudy('unknown',1),null);
});
test('original Co-op customer implementation has no dependency on the Atlas effects',()=>{
 const files=['co-op/index.html','co-op/motion.js','co-op/motion.css','demos.json'];
 for(const file of files)assert.doesNotMatch(fs.readFileSync(path.join(__dirname,file),'utf8'),/shorts-lab\/effects|atlas\.mjs/);
});
