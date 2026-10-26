/* CWI v1.7 · semifinal quality fixes: source completeness, map period controls, metadata and safety.
   No climate estimates or econometric findings are fabricated by this module. */
(()=>{
'use strict';
const $=q=>document.querySelector(q);
const english=()=>document.documentElement.lang==='en'||window.CWI_I18N?.getLanguage?.()==='en';
const t=(vi,en)=>english()?en:vi;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lastNASA={total:0,expected:0,complete:false};
// Determine completeness month by month. A daily count < days in the month never becomes a monthly total.
function secureClimateSummary(){
  if(typeof S==='undefined'||!Array.isArray(S.months))return;
  const year=Number(S.raw?.year??S.year);
  let observedRain=0,observedTemp=0,totalDays=0;
  for(const m of S.months){
    const expected=new Date(Date.UTC(year,m.month,0)).getUTCDate();
    m.expectedDays=expected;
    if(!Object.prototype.hasOwnProperty.call(m,'_rainObserved')) m._rainObserved=m.rain;
    if(!Object.prototype.hasOwnProperty.call(m,'_tempObserved')) m._tempObserved=m.temp;
    observedRain+=m.rn||0;
    observedTemp+=m.tn||0;
    totalDays+=expected;
    m.rain=m.rn===expected?m._rainObserved:null;
    m.temp=m.tn===expected?m._tempObserved:null;
  }
  const parameter=S.parameter==='rain'?'rain':'temp';
  const present=parameter==='rain'?observedRain:observedTemp;
  const complete=present===totalDays;
  lastNASA={total:present,expected:totalDays,complete,year,parameter};
  if(!complete){
    const label=t('Thiếu dữ liệu ngày','Daily data incomplete');
    const annual=$('#annual-value'),unit=$('#annual-unit'),summary=$('#summary-label');
    if(annual)annual.textContent='—';
    if(unit)unit.textContent='';
    if(summary)summary.textContent=`${label}: ${present}/${totalDays} · ${year}. `+t('Không tính tổng hoặc trung bình năm.','Annual totals and means withheld.');
    const chart=$('#chart');
    if(chart&&!S.months.some(m=>Number.isFinite(m[parameter]))) chart.innerHTML='<p class="qa-incomplete-note">'+t('Chưa đủ dữ liệu một tháng hoàn chỉnh để vẽ biểu đồ.','No complete monthly observations to chart.')+'</p>';
    const status=$('#query-status');
    if(status&&status.classList.contains('success')){
      status.textContent=t(`NASA POWER đã phản hồi, nhưng chỉ có ${present}/${totalDays} ngày hợp lệ.`, `NASA POWER responded, but only ${present}/${totalDays} valid daily observations were available.`);
      status.dataset.qa='partial';
    }
  }
}
// Keep the original chart renderer and its calculations for fully complete datasets.
const originalRender=window.renderClimate;
if(typeof originalRender==='function'){
  window.renderClimate=function(){
    if(!S.months)return originalRender();
    // Ensure incomplete individual months appear as missing, not zero or complete monthly totals.
    secureClimateSummary();
    originalRender();
    if(!lastNASA.complete)secureClimateSummary();
  };
}
const WMS_LAYER={monthly:['fews_chirps_global_month_data','chirps_global_month_data'],anomaly:['fews_chirps_global_month_anom','chirps_global_month_anom']};
function chosenService(){const v=$('#wms-variable')?.value||'monthly';const a=WMS_LAYER[v]||WMS_LAYER.monthly;return {service:a[0],layer:a[0]+':'+a[1]};}
function updateWMSLinks(){
  const area=$('#qa-wms-links');if(!area)return;
  const {service,layer}=chosenService(),base='https://dmsdata.cr.usgs.gov/geoserver/'+service+'/ows';
  const cap=base+'?service=WMS&version=1.3.0&request=GetCapabilities';
  const legend=base+'?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image%2Fpng&layer='+encodeURIComponent(layer);
  area.innerHTML='<a target="_blank" rel="noopener noreferrer" href="'+cap+'">'+t('Thông tin lớp WMS','WMS metadata')+'</a><a target="_blank" rel="noopener noreferrer" href="'+legend+'">'+t('Chú giải từ USGS (nếu có)','USGS legend (if available)')+'</a>';
  const warning=$('#qa-wms-disclosure');
  if(warning)warning.textContent=$('#wms-variable')?.value==='anomaly'
    ? t('Chưa xác nhận kỳ chuẩn, đơn vị và phiên bản CHIRPS của lớp dị thường USGS; không diễn giải màu thành mức hạn.', 'USGS anomaly baseline, units, and CHIRPS version have not been verified; do not interpret colors as drought severity.')
    : t('Lớp ảnh WMS chưa được xác nhận là CHIRPS v3. Muốn đọc giá trị mm, cần chú giải và dữ liệu gốc tại nguồn.', 'This WMS image is not independently verified as CHIRPS v3. Numerical rainfall values require source metadata and data.');
}
function updatePeriods(){
  const year=$('#wms-year'),month=$('#wms-month');if(!year||!month)return;
  const today=new Date();
  const currentStart=Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1);
  for(const op of year.options){
    const y=Number(op.value);op.disabled=Date.UTC(y,0,1)>=currentStart;
  }
  for(const op of month.options){
    op.disabled=Date.UTC(Number(year.value),Number(op.value)-1,1)>=currentStart;
  }
  if(month.selectedOptions[0]?.disabled){
    const opts=[...month.options].filter(o=>!o.disabled);
    if(opts.length)month.value=opts.at(-1).value;
  }
  const show=$('#wms-show');
  if(show&&month.selectedOptions[0]?.disabled)show.disabled=true;
  else if(show&&show.dataset.qaDisabled==='true'){show.disabled=false;delete show.dataset.qaDisabled;}
}
function syncStatus(){
  const status=$('#wms-status');if(!status)return;
  const str=status.textContent.trim();
  if((str==='Đã tải lớp mưa từ USGS.'||str==='USGS map layer loaded.')&&status.dataset.qa!=='verified'){
    status.textContent=t('Đã nhận ảnh WMS từ USGS; phiên bản và giá trị mưa chưa được đối chiếu.','USGS WMS image received; data version and rainfall values are not verified.');
    status.dataset.qa='verified';
  }
}
function installCSVGuard(){
  const original=window.downloadPolicy;
  if(typeof original!=='function')return;
  window.downloadPolicy=function(){
    const out=original();
    // Prevent spreadsheet formula injection through scenario names imported from JSON.
    const data=JSON.parse(out.json);
    const header=['Kịch bản','N (hộ)','Phí giả định (VND/hộ/năm)','Tham gia giả định (%)','Chi biến đổi (VND/hộ/năm)','Chi cố định (VND/năm)','Đầu tư T0 (VND)','Số năm','Chiết khấu (%)','Thu/năm (VND)','Chi/năm (VND)','NPV (VND)','Tham gia hòa vốn vận hành (%)','Tham gia hòa vốn NPV (%)'];
    const csvCell=v=>{
      let str=String(v??'');
      if(typeof v==='string'&&/^[\s\x00-\x1F]*[=+@\-]/.test(str))str="'"+str;
      return '"'+str.replace(/"/g,'""')+'"';
    };
    out.csv='\ufeff'+[header.join(','),...data.parameters.map((p,i)=>{const r=data.results[i];return [p.name,p.N,p.fee,p.uptake,p.cost,p.fixed,p.capex,p.years,p.discount,r.revenue,r.operatingCost,r.npv,r.breakEvenOperating??'',r.breakEvenNpv??''].map(csvCell).join(',')})].join('\r\n');
    return out;
  };
}
function maybeStoredBadge(){
  const host=$('.pstudio-head');if(!host||$('#qa-stored-message'))return;
  try{
    const raw=localStorage.getItem('cwi.policy.scenarios.v12');
    if(!raw)return;
    const a=JSON.parse(raw);
    if(!Array.isArray(a)||a.length!==3)return;
    const msg=document.createElement('small');msg.id='qa-stored-message';msg.setAttribute('role','status');msg.textContent=t('Đã khôi phục phương án lưu trên trình duyệt.','Restored locally saved scenarios.');host.appendChild(msg);
  }catch(_e){}
}
function init(){
  // Initial HTML is intentionally self-contained. No external script is needed for these guards.
  for(const a of document.querySelectorAll('a[href*="github.com/water-evidence-project/coffee-water-evidence"]')){
    a.href='https://github.com/water-evidence-project/coffee-water-intelligence-v17';
  }
  const panel=$('#wms-climate');
  if(panel&&!$('#qa-wms-links')){
    const wrap=document.createElement('div');wrap.id='qa-wms-links';wrap.className='qa-wms-links';
    const note=document.createElement('p');note.id='qa-wms-disclosure';note.className='qa-wms-disclosure';
    const source=$('#wms-source-link');if(source){source.insertAdjacentElement('afterend',wrap);wrap.insertAdjacentElement('afterend',note)}else panel.append(wrap,note);
  }
  updatePeriods();updateWMSLinks();installCSVGuard();
  document.addEventListener('change',e=>{
    if(e.target?.id==='wms-year'||e.target?.id==='wms-month')updatePeriods();
    if(e.target?.id==='wms-variable')updateWMSLinks();
  },true); // Adjust invalid period before the original WMS change listener.
  $('#wms-show')?.addEventListener('click',e=>{
    updatePeriods();
    if($('#wms-month')?.selectedOptions[0]?.disabled){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  const st=$('#wms-status');
  if(st)new MutationObserver(syncStatus).observe(st,{childList:true,characterData:true,subtree:true});
  document.addEventListener('cwi-language-changed',()=>{updateWMSLinks();syncStatus();const b=$('#qa-stored-message');if(b)b.textContent=t('Đã khôi phục phương án lưu trên trình duyệt.','Restored locally saved scenarios.');});
  maybeStoredBadge();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
