const html=document.documentElement,params=new URL(location.href).searchParams;
const unit=document.querySelector('[data-unit]'),sizing=document.querySelector('[data-sizing]');
unit.value=['vh','svh','dvh'].includes(params.get('unit'))?params.get('unit'):'dvh';
sizing.value=params.get('sizing')==='min'?'min':'fixed';
function measure(){
 const values=[...document.querySelectorAll('.probes i')].map(el=>Math.round(el.getBoundingClientRect().height));
 document.querySelector('[data-metrics]').textContent=`innerHeight ${innerHeight}px · visual viewport ${Math.round(visualViewport?.height||innerHeight)}px · vh/svh/dvh ${values.join('/')}px`;
}
function sync(){html.dataset.unit=unit.value;html.dataset.sizing=sizing.value;measure();}
unit.addEventListener('change',sync);sizing.addEventListener('change',sync);
window.addEventListener('resize',measure);visualViewport?.addEventListener('resize',measure);
document.querySelector('[data-start]').addEventListener('click',()=>{document.querySelector('[data-outcome]').textContent='Example action selected. Nothing was submitted.';});
sync();
