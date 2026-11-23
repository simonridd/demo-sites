// Actual browser entries, never a manufactured optimisation score.
(() => {
 const metrics={lcp:null,cls:null,resources:[],supported:PerformanceObserver.supportedEntryTypes};
 window.motionDeliveryMetrics=metrics;
 function render(){
  metrics.resources=performance.getEntriesByType('resource').filter(x=>x.initiatorType==='img').map(x=>({name:x.name.split('/').pop(),startMs:Math.round(x.startTime),durationMs:Math.round(x.duration),transferBytes:x.transferSize}));
  const output=document.querySelector('[data-delivery-metrics]');
  if(output)output.textContent=JSON.stringify(metrics,null,2);
 }
 if(metrics.supported.includes('largest-contentful-paint'))new PerformanceObserver(list=>{
  const entry=list.getEntries().at(-1);metrics.lcp={ms:Math.round(entry.startTime),element:entry.element?.id||entry.element?.tagName||null,url:entry.url?.split('/').pop()||null};render();
 }).observe({type:'largest-contentful-paint',buffered:true});
 if(metrics.supported.includes('layout-shift')){
  metrics.cls=0;
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)metrics.cls+=e.value;render();}).observe({type:'layout-shift',buffered:true});
 }
 document.querySelectorAll('img').forEach(img=>img.addEventListener('load',render));
 window.addEventListener('load',render,{once:true});render();
})();
