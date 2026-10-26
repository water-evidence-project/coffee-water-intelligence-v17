/* CWI v1.7: clarify prerequisites for CSV exports, without generating placeholder data. */
(() => {
  'use strict';
  const $ = sel => document.querySelector(sel);
  const tr=(vi,en)=>window.CWI_I18N?.getLanguage?.()==='en'?en:vi;
  const cases=[
    ['download-csv','Chọn vị trí rồi tải dữ liệu NASA POWER để xuất CSV.','Select a location and load NASA POWER data before exporting CSV.'],
    ['raster-export','Chỉ xuất CSV khi có dữ liệu lưới khí hậu hợp lệ.','A valid climate grid must be loaded before exporting CSV.'],
    ['season-export','Chỉ xuất CSV khi có đủ các tháng cần thiết.','All required months must be available before exporting CSV.']
  ];
  function helpFor(id,vi,en){
    const button=document.getElementById(id);
    if(!button)return;
    const key=id+'-help';
    let hint=document.getElementById(key);
    if(!hint){hint=document.createElement('small');hint.id=key;hint.className='csv-export-help';hint.setAttribute('role','status');
      const host=button.closest('.bottom-tools')||button.closest('.raster-actions')||button.parentElement;
      if(host?.classList.contains('bottom-tools'))host.appendChild(hint);
      else host?.insertAdjacentElement('afterend',hint);
      button.setAttribute('aria-describedby',key);
    }
    const update=()=>{
      const inactive=button.disabled;
      hint.dataset.ready=String(!inactive);
      hint.textContent=inactive?tr(vi,en):'';
      button.title=inactive?tr(vi,en):tr('Tải bảng CSV','Download CSV');
    };
    new MutationObserver(update).observe(button,{attributes:true,attributeFilter:['disabled']});
    document.addEventListener('cwi-language-changed',update);
    update();
  }
  function init(){
    for(const row of cases)helpFor(...row);
    const policy=$('#pstudio-export');
    if(policy){
      const update=()=>policy.title=tr('Tải bảng kết quả ba phương án','Download the three scenario results');
      document.addEventListener('cwi-language-changed',update);update();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();