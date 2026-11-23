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
  const portable=renderStudy(item.key,'portable',{assetBase:'./assets/'});
  assert.ok(portable.includes('href="./README.md#'+item.key+'"'),item.key+' portable guidance link');
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

test('delivery fixtures keep the hero discoverable and defer only offscreen gallery images',()=>{
 const selective=fs.readFileSync(path.join(dir,'image-delivery.html'),'utf8');
 const baseline=fs.readFileSync(path.join(dir,'image-delivery-eager.html'),'utf8');
 const images=html=>[...html.matchAll(/<img\b[^>]*>/g)].map(x=>x[0]);
 const selected=images(selective),eager=images(baseline);
 assert.equal(selected.length,5);assert.equal(eager.length,5);
 assert.match(selected[0],/loading="eager"/);assert.match(selected[0],/fetchpriority="high"/);
 assert.ok(selected.slice(1).every(tag=>tag.includes('loading="lazy"')&&!tag.includes('fetchpriority="high"')));
 assert.ok(eager.every(tag=>tag.includes('loading="eager"')&&!tag.includes('fetchpriority="high"')));
 assert.deepEqual(selected.map(tag=>tag.match(/src="([^"]+)"/)[1]),eager.map(tag=>tag.match(/src="([^"]+)"/)[1]));
 for(const tag of selected)assert.match(tag,/width="1200" height="800"/);
 for(const width of [600,1200])for(const ext of ['avif','webp','jpg'])assert.ok(fs.statSync(path.join(dir,'assets',`delivery-${width}.${ext}`)).size>0);
});
