"use strict";
/* CWI 2.0 research workstation enhancements.
 * Reads only audited CHIRPS v3 data already verified by index.html;
 * never maps household regression coefficients onto CHIRPS cells.
 */
const CWI2=(function(){
 const E=id=>document.getElementById(id);
 const vi=n=>Number.isFinite(n)?n.toLocaleString("vi-VN",{maximumFractionDigits:1}):"—";
 const cash=n=>Number.isFinite(n)?Math.round(n).toLocaleString("vi-VN")+" ₫":"—";
 const signed=n=>Number.isFinite(n)?((n>0?"+":"")+vi(n)):"—";
 const state={list:[],window:2,integrity:false};
 const safe=(s)=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 function loaded(){return !!(climate&&audit&&audit.status==="PASS"&&window.CWI2_SHA_VERIFIED===true)}
 function ensure(){return loaded()&&climate.grid&&climate.periods.length===12}
 function cellPoint(i){
   const g=climate.grid;
   return {lon:g.west+(i%g.width+.5)*g.dx,lat:g.north+(Math.floor(i/g.width)+.5)*g.dy};
 }
 function stats(i,m){
   if(!ensure()||m<1||m>12)return null;
   const r=climate.periods[m-1].values[i],b=climate.baseline.months[m-1].values[i];
   const std=climate.baseline.months[m-1].std[i];
   if(!Number.isFinite(r)||!Number.isFinite(b))return null;
   return {rain:r,normal:b,delta:r-b,relative:b>0?(r-b)/b*100:null,z:Number.isFinite(std)&&std>0?(r-b)/std:null};
 }
 function screen(month,windowSize){
   if(!ensure()||month<windowSize)return [];
   const out=[],g=climate.grid;
   for(let i=0;i<g.width*g.height;i++){
     let deficits=0,negative=0,valid=true;
     for(let t=month-windowSize+1;t<=month;t++){
       const x=stats(i,t);
       if(!x){valid=false;break}
       if(x.delta<0){negative++;deficits-=x.delta}
     }
     if(valid&&negative===windowSize)out.push({index:i,deficitMm:deficits,point:cellPoint(i),consecutive:negative});
   }
   out.sort((a,b)=>b.deficitMm-a.deficitMm);
   return out;
 }
 function trend(){
   const box=E("cwi2-trend");
   if(!box)return;
   if(!ensure()){box.textContent="Chưa có chuỗi tháng đã xác minh.";return}
   const obs=[],norm=[];
   for(let m=1;m<=12;m++){const x=stats(selected,m);obs.push(x?x.rain:null);norm.push(x?x.normal:null)}
   const vals=obs.concat(norm).filter(Number.isFinite);
   if(!vals.length){box.textContent="Ô được chọn không có dữ liệu hợp lệ.";return}
   const hi=Math.max(20,...vals)*1.12, w=680,h=198,pad=32;
   const poly=arr=>arr.map((v,i)=>Number.isFinite(v)?(pad+i*(w-2*pad)/11).toFixed(1)+","+(h-pad-v/hi*(h-2*pad)).toFixed(1):null).filter(Boolean).join(" ");
   const ticks=[0,3,6,9,11].map(i=>'<text x="'+(pad+i*(w-2*pad)/11).toFixed(1)+'" y="190">'+(i+1)+'</text>').join("");
   box.innerHTML='<svg viewBox="0 0 680 198" role="img" aria-label="Lượng mưa theo tháng năm 2025 và chuẩn 1991 đến 2020"><line x1="32" y1="166" x2="650" y2="166" stroke="#405660"/><line x1="32" y1="32" x2="650" y2="32" stroke="#253d49" stroke-dasharray="3 5"/><polyline fill="none" stroke="#57ccb9" stroke-width="3.5" points="'+poly(obs)+'"/><polyline fill="none" stroke="#f2b978" stroke-width="2.5" stroke-dasharray="6 5" points="'+poly(norm)+'"/><g fill="#90a7b5" font-size="13" text-anchor="middle">'+ticks+'</g><text x="8" y="23" fill="#91afbe" font-size="12">mm</text></svg>';
   const x=stats(selected,Number(E("month").value));
   const coord=cellPoint(selected);
   E("cwi2-cell-label").textContent="Ô "+(Math.floor(selected/climate.grid.width)+1)+","+(selected%climate.grid.width+1)+" · "+coord.lat.toFixed(3)+"°N, "+coord.lon.toFixed(3)+"°E";
   E("cwi2-z").textContent=x&&x.z!==null?signed(x.z)+" σ":"Không xác định";
   E("cwi2-z").title="Độ lệch so với trung bình chia cho độ lệch chuẩn lịch sử của cùng tháng; không phải SPI";
 }
 function paintScreen(){
   const count=E("cwi2-count"),list=E("cwi2-list"),meta=E("cwi2-screen-meta");
   if(!count||!list)return;
   if(!ensure()){count.textContent="—";list.textContent="Chỉ hiển thị khi kiểm chứng dữ liệu thành công.";return}
   const month=Number(E("month").value),n=Number(E("cwi2-window").value);
   state.window=n;
   if(month<n){state.list=[];count.textContent="—";list.textContent="Chọn tháng "+n+" đến tháng 12 để kiểm tra chuỗi "+n+" tháng.";meta.textContent="Chưa đủ số tháng.";return}
   const out=screen(month,n);state.list=out;
   count.textContent=out.length.toLocaleString("vi-VN")+" ô";
   meta.textContent="Quy tắc: lượng mưa < chuẩn cùng tháng trong "+n+" tháng liên tiếp, kết thúc tháng "+month+"/2025. Xếp theo tổng phần chênh hụt mưa (mm).";
   const candidates=out.slice(0,8);
   list.innerHTML=candidates.length?candidates.map((x,k)=>'<button type="button" class="cwi2-cell" data-cell="'+x.index+'"><span class="cwi2-rank">'+String(k+1).padStart(2,"0")+'</span><span>'+x.point.lat.toFixed(3)+'°N · '+x.point.lon.toFixed(3)+'°E</span><strong>'+vi(x.deficitMm)+' mm</strong></button>').join(""):'<p class="small muted">Không có ô lưới đáp ứng bộ lọc đã chọn.</p>';
   list.querySelectorAll("button[data-cell]").forEach(btn=>btn.addEventListener("click",()=>{
     selected=Number(btn.dataset.cell);renderMap();trend();paintScreen();document.getElementById("map").scrollIntoView({behavior:"smooth",block:"center"});
   }));
 }
 function sensitivity(){
   const target=E("cwi2-sensitivity");if(!target)return;
   if(!scn){target.textContent="Các thông số phương án chưa hợp lệ.";return}
   const v=scn.assumptions, fees=[.8,1,1.2].map(m=>Math.round(v.fee*m));
   const steps=[Math.max(0,v.uptake-20),Math.max(0,v.uptake-10),v.uptake,Math.min(100,v.uptake+10),Math.min(100,v.uptake+20)].map(x=>Math.round(x*10)/10);
   const uniq=[...new Set(steps)];
   let html='<table class="cwi2-table"><thead><tr><th>Tỷ lệ tham gia</th>'+fees.map(x=>'<th>'+Math.round(x).toLocaleString("vi-VN")+' ₫/hộ</th>').join("")+'</tr></thead><tbody>';
   for(const up of uniq){
     html+='<tr><th>'+vi(up)+'%</th>';
     for(const fee of fees){let value=null;try{value=calculate({...v,fee:fee,uptake:up}).npv}catch{}
       html+='<td><button type="button" class="cwi2-npv '+(value===null?"":value>=0?"cwi2-plus":"cwi2-minus")+'" data-fee="'+fee+'" data-up="'+up+'" '+(value===null?"disabled":"")+'>'+ (value===null?"—":(value>=0?"+":"−")+Math.abs(value/1e6).toLocaleString("vi-VN",{maximumFractionDigits:1})+" tr")+'</button></td>';
     }
     html+='</tr>';
   }
   target.innerHTML=html+'</tbody></table>';
   target.querySelectorAll("button[data-fee]").forEach(b=>b.addEventListener("click",()=>{
     E("fee").value=b.dataset.fee;E("uptake").value=b.dataset.up;refreshScenario();sensitivity();
   }));
 }
 function refresh(){
   trend();paintScreen();sensitivity();report();
 }
 function report(){
   const x=E("cwi2-dossier");if(!x)return;
   const cell=ensure()?stats(selected,Number(E("month").value)):null;
   const position=ensure()?cellPoint(selected):null;
   const a=scn?scn.assumptions:null, r=scn?scn.outputs:null;
   let lines=[];
   lines.push('<div class="cwi2-report-row"><b>KHÍ HẬU · Dữ liệu quan sát</b><p>'+(cell?'Vị trí ô lưới '+position.lat.toFixed(3)+'°N, '+position.lon.toFixed(3)+'°E, tháng '+E("month").value+'/2025: '+vi(cell.rain)+' mm; chuẩn '+vi(cell.normal)+' mm; chênh lệch '+signed(cell.delta)+' mm.':'Chưa có dữ liệu đã xác minh.')+'</p></div>');
   lines.push('<div class="cwi2-report-row"><b>NGHIÊN CỨU · Bằng chứng từ mẫu hộ</b><p>COST N=217; WTP N=217 (trung vị 262.619 đ/hộ/năm); LAND N=218. Không có tọa độ hộ để liên kết với ô CHIRPS. Các kết quả là mối liên hệ thống kê, không phải nhân quả.</p></div>');
   lines.push('<div class="cwi2-report-row"><b>KỊCH BẢN · Giả định do người sử dụng</b><p>'+(a&&r?'Quy mô '+a.households.toLocaleString("vi-VN")+' hộ; đóng góp '+cash(a.fee)+'/hộ/năm; tỷ lệ tham gia '+vi(a.uptake)+'%; NPV '+cash(r.npv)+'.':'Thông số chưa hợp lệ.')+'</p></div>');
   lines.push('<div class="cwi2-report-row"><b>ĐIỀU KIỆN CẦN XÁC MINH</b><p>Khả năng cấp nước thực tế; nhu cầu tưới; tính đại diện của số liệu địa phương; chi phí triển khai; tỷ lệ tham gia được khảo sát thực tế.</p></div>');
   x.innerHTML=lines.join("");
 }
 function exportScreen(){
   if(!ensure()){alert("Chưa có dữ liệu CHIRPS được xác minh.");return}
   const m=Number(E("month").value),n=Number(E("cwi2-window").value);
   const rows=["cell_index,latitude,longitude,month_end,window_months,cumulative_rain_deficit_mm,screening_rule"];
   for(const x of screen(m,n))rows.push([x.index,x.point.lat.toFixed(5),x.point.lon.toFixed(5),m,n,x.deficitMm.toFixed(4),"below_monthly_normal_consecutive"].join(","));
   download("CWI2_rainfall_screening_2025.csv","\ufeff"+rows.join("\n")+"\n","text/csv;charset=utf-8");
 }
 function decorateDossier(){
   const old=dossier;
   dossier=function(){
     const data=old();
     data.schema="CWI-Decision-Dossier-v2.0-integrated";
     data.climateIntegrity={auditStatus:audit?.status??null,sha256BrowserVerified:window.CWI2_SHA_VERIFIED===true,baseline:"1991–2020",target:"2025",spatialBoundary:"rectangular viewport; NOT Dak Lak province polygon"};
     data.screening=ensure()?{windowMonths:state.window,monthEnd:Number(E("month").value),matchingCells:state.list.length,rule:"consecutive months below same-month 1991–2020 baseline; NOT drought diagnosis"}:null;
     data.interpretation="Climate screening and household econometric results are juxtaposed, not quantitatively linked or causally identified.";
     return data;
   };
 }
 function install(){
   decorateDossier();
   E("cwi2-window").addEventListener("change",refresh);
   E("cwi2-screen-export").addEventListener("click",exportScreen);
   ["month","field"].forEach(id=>E(id).addEventListener("change",refresh));
   E("map").addEventListener("click",refresh);
   for(const id of inputs)E(id).addEventListener("input",refresh);
   E("case60").addEventListener("click",refresh);
   E("cwi2-save").addEventListener("click",()=>{if(!scn){alert("Thông số chưa hợp lệ.");return}download("CWI2_scenario.json",JSON.stringify({schema:"CWI2-Scenario-v1",assumptions:scn.assumptions},null,2),"application/json;charset=utf-8")});
   E("cwi2-import").addEventListener("change",async e=>{
      const file=e.target.files?.[0];e.target.value="";if(!file)return;
      if(file.size>30000){alert("Tệp phương án vượt giới hạn kích thước.");return}
      try{
       const obj=JSON.parse(await file.text());if(obj.schema!=="CWI2-Scenario-v1"||!obj.assumptions)throw Error("Định dạng tệp không hợp lệ");
       const v=obj.assumptions;const mandatory=inputs;
       if(Object.keys(v).length!==mandatory.length||mandatory.some(k=>typeof v[k]!=="number"||!Number.isFinite(v[k])))throw Error("Thiếu tham số hoặc giá trị không hợp lệ");
       calculate(v);
       for(const k of mandatory)E(k).value=v[k];
       refreshScenario();refresh();
      }catch(err){alert("Không thể nhập phương án: "+err.message)}
   });
   refresh();
 }
 return {install,refresh,stats,screen,getState:()=>({...state})};
})();
window.CWI2=CWI2;
CWI2.install();
