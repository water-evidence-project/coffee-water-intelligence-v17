/* CWI 2.0 · Native integration with existing CWI 1.7 shell and Policy Studio.
   Uses original GitHub Pages CHIRPS JSON and CWI_POLICY calculator. No iframe or second app.
   Only audited observational rainfall is shown; never derives household outcomes by pixel. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const state={opened:false,loading:false,data:null,audit:null,error:null,selected:null,month:12,span:3,metric:"delta",scenario:0,ranked:[],verified:false};
const vnum=n=>Number.isFinite(n)?n.toLocaleString("vi-VN",{maximumFractionDigits:1}):"—";
const amt=n=>Number.isFinite(n)?Math.round(n).toLocaleString("vi-VN")+" ₫":"—";
const safe=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const LANG={
vi:{nav:"Phân tích tích hợp",back:"Quay lại bản đồ",headline:"Phân tích tổng hợp nước và kinh tế",sub:"Tín hiệu lượng mưa · Bằng chứng nghiên cứu · Mô phỏng tài chính · Hồ sơ phân tích",
a:"01 / DỮ LIỆU KHÔNG GIAN",mapTitle:"Lượng mưa CHIRPS theo ô lưới",month:"Tháng",metric:"Lớp hiển thị",delta:"Sai lệch (mm)",rain:"Lượng mưa (mm)",normal:"Chuẩn 1991–2020 (mm)",z:"Độ lệch chuẩn hóa",observed:"Mưa quan sát",baseline:"Mưa chuẩn",diff:"Chênh lệch",b:"02 / SÀNG LỌC LƯỢNG MƯA",screenTitle:"Nhận diện tín hiệu mưa thấp kéo dài",window:"Chuỗi liên tiếp",two:"2 tháng",three:"3 tháng",four:"4 tháng",hits:"Ô phù hợp",noteScreen:"Bộ lọc chọn các ô có mưa dưới trung bình của từng tháng liên tiếp; không phải bản đồ hạn hán hoặc lượng nước tưới.",c:"03 / BẰNG CHỨNG KINH TẾ",economic:"Ba kết quả kinh tế trong cùng khảo sát",cost:"Chi phí tưới",costNote:"Tưới phun hoặc nhỏ giọt so với tưới dí · không đo hiệu quả dùng nước",wtp:"Sẵn lòng chi trả",wtpNote:"Trung vị đồng/hộ/năm · không phải mức phí áp dụng",land:"Giá trị đất",landNote:"Giá trị tự ước tính, liên hệ với thiếu nước · không phải tác động nhân quả",d:"04 / MÔ PHỎNG TÀI CHÍNH",policy:"Kiểm tra độ nhạy các phương án có sẵn",scenario:"Phương án",edit:"Mở Policy Studio",npv:"NPV hiện tại",breakeven:"Tham gia hòa vốn",heat:"Ma trận NPV khi giả định mức đóng góp và tham gia thay đổi",uptake:"Tham gia",e:"05 / HỒ SƠ PHÂN TÍCH",dossier:"Tổng hợp bằng chứng và giả định",downloadJson:"Xuất hồ sơ JSON",downloadCsv:"Xuất bảng sàng lọc CSV",print:"In / Lưu PDF",method:"Nguồn và giới hạn dữ liệu",sourceLine:"CHIRPS v3 monthly final · Chuẩn khí hậu 1991–2020 · Năm quan sát 2025",unavailable:"Không có dữ liệu đã kiểm chứng",loading:"Đang kiểm tra nguồn CHIRPS và chữ ký SHA-256…",noRows:"Không có ô đáp ứng điều kiện ở thời điểm này.",lastMonth:"Cần chọn tháng kết thúc phù hợp với độ dài chuỗi.",cell:"Ô lưới",consecutive:"tháng liên tiếp",case:"Chương trình giả định",status:"Bản đồ mưa là tín hiệu khí hậu. Không tự suy ra thiếu nước tưới hay thiệt hại hộ.",save:"Lưu phiên phân tích"},
en:{nav:"Integrated analysis",back:"Back to map",headline:"Integrated water–economic analysis",sub:"Rainfall signal · Research evidence · Financial scenarios · Decision dossier",a:"01 / SPATIAL DATA",mapTitle:"CHIRPS rainfall grid",month:"Month",metric:"Layer",delta:"Anomaly (mm)",rain:"Precipitation (mm)",normal:"1991–2020 normal (mm)",z:"Standardized departure",observed:"Observed rain",baseline:"Climate normal",diff:"Difference",b:"02 / RAINFALL SCREENING",screenTitle:"Consecutive below-normal rainfall",window:"Consecutive period",two:"2 months",three:"3 months",four:"4 months",hits:"Matching cells",noteScreen:"Cells below their respective monthly normal consecutively; not a drought or irrigation availability map.",c:"03 / ECONOMIC EVIDENCE",economic:"Three distinct household economic outcomes",cost:"Irrigation cost",costNote:"Sprinkler/drip versus basin; not direct water efficiency",wtp:"Willingness to pay",wtpNote:"Median VND/household/year; not a proposed fee",land:"Land value",landNote:"Self-assessed value associated with shortage; not causal",d:"04 / FINANCIAL SCENARIOS",policy:"Sensitivity of existing scenarios",scenario:"Scenario",edit:"Open Policy Studio",npv:"Current NPV",breakeven:"Break-even participation",heat:"NPV matrix by contribution and participation assumptions",uptake:"Uptake",e:"05 / EVIDENCE DOSSIER",dossier:"Evidence and scenario record",downloadJson:"Download JSON dossier",downloadCsv:"Download screening CSV",print:"Print / Save PDF",method:"Source and data limitations",sourceLine:"CHIRPS v3 monthly final · 1991–2020 reference · Observed year 2025",unavailable:"No verified data",loading:"Verifying CHIRPS source and SHA-256 signature…",noRows:"No matching grid cells.",lastMonth:"Select a later endpoint for this period.",cell:"Grid cell",consecutive:"consecutive months",case:"Assumed programme",status:"Rainfall is a climate signal, not irrigation supply or household loss.",save:"Save current analysis"}};
function L(){return document.getElementById("lang-en")?.classList.contains("active")?"en":"vi"}
function tr(k){return LANG[L()][k]||k}
function nfmt(v){return Number.isFinite(v)?v.toLocaleString(L()==="vi"?"vi-VN":"en-US",{maximumFractionDigits:1}):"—"}
function shaHex(buffer){return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,"0")).join("")}
function grid(){return state.data?.grid}
function cell(i,m=state.month){
 const d=state.data,g=d?.grid;
 if(!d||!g||i===null||i<0||i>=g.width*g.height||m<1||m>12)return null;
 const p=d.periods[m-1],b=d.baseline.months[m-1];if(!p||!b)return null;
 const rain=p.values[i],normal=b.values[i],std=b.std?.[i];
 if(!Number.isFinite(rain)||!Number.isFinite(normal))return null;
 return {index:i,month:m,lat:g.north+(Math.floor(i/g.width)+.5)*g.dy,lon:g.west+((i%g.width)+.5)*g.dx,rain,normal,delta:rain-normal,z:Number.isFinite(std)&&std>0?(rain-normal)/std:null};
}
function sourceValid(a,d){
 if(a?.status!=="PASS"||a.dataset!=="CHIRPS v3.0 monthly final"||a.officialPublisherFilesChecked!==372||a.referenceSourceCount!==360||a.targetSourceCount!==12||a.referencePeriod!=="1991-2020")return false;
 if(d?.dataset!==a.dataset||d.grid?.width!==50||d.grid?.height!==41||d.periods?.length!==12||d.baseline?.sourceCount!==360||d.baseline?.months?.length!==12||d.baseline?.startYear!==1991||d.baseline?.endYear!==2020)return false;
 return d.periods.every((p,i)=>p.year===2025&&p.month===i+1&&p.values?.length===2050&&d.baseline.months[i]?.values?.length===2050&&d.baseline.months[i]?.std?.length===2050);
}
async function load(){
 if(state.data||state.loading)return;
 state.loading=true;state.error=null;status();
 try{
  if(!window.crypto?.subtle)throw Error("SHA-256 browser API unavailable");
  const [ar,dr]=await Promise.all([fetch("./data/chirps-v3-cog-audit.json",{cache:"no-store"}),fetch("./data/chirps-v3-daklak.json",{cache:"no-store"})]);
  if(!ar.ok||!dr.ok)throw Error("CHIRPS source unavailable");
  const audit=await ar.json(),raw=await dr.text();
  const digest=shaHex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw)));
  if(digest!==audit.outputSha256)throw Error("CHIRPS SHA-256 verification failed");
  const data=JSON.parse(raw);if(!sourceValid(audit,data))throw Error("Dataset schema / source audit mismatch");
  state.data=data;state.audit=audit;state.verified=true;
  const mid=Math.floor(data.grid.height/2)*data.grid.width+Math.floor(data.grid.width/2);
  state.selected=cellFromCandidate(data,mid);
 }catch(e){state.error=String(e.message||e);state.verified=false;state.data=null;state.audit=null}
 finally{state.loading=false;status();render()}
}
function cellFromCandidate(d,mid){const n=d.grid.width*d.grid.height,base=d.baseline.months[state.month-1].values,arr=d.periods[state.month-1].values;let chosen=null,dist=Infinity;for(let i=0;i<n;i++){if(Number.isFinite(arr[i])&&Number.isFinite(base[i])){const r=Math.floor(i/d.grid.width),c=i%d.grid.width,mr=Math.floor(mid/d.grid.width),mc=mid%d.grid.width,k=(r-mr)**2+(c-mc)**2;if(k<dist){chosen=i;dist=k}}}return chosen}
function color(v,metric){
 if(!Number.isFinite(v))return "#091a24";
 if(metric==="rain"||metric==="normal"){const x=Math.min(1,v/500);return "hsl("+(213-x*165)+" 65% "+(26+x*34)+"%)"}
 const x=Math.max(-1,Math.min(1,v/(metric==="z"?2.6:160)));
 if(x<0)return "hsl("+(28+x*6)+" 70% "+(54+8*x)+"%)";
 return "hsl("+(190+x*19)+" 57% "+(45-9*x)+"%)";
}
function drawMap(){
 const cv=$("cwi2-map"),d=state.data;if(!cv||!d)return;
 const g=d.grid,ctx=cv.getContext("2d");cv.width=g.width*15;cv.height=g.height*15;
 const m=state.month,p=d.periods[m-1].values,b=d.baseline.months[m-1];
 for(let i=0;i<g.width*g.height;i++){
  const v=state.metric==="rain"?p[i]:state.metric==="normal"?b.values[i]:state.metric==="z"?(Number.isFinite(b.std[i])&&b.std[i]>0?(p[i]-b.values[i])/b.std[i]:null):(p[i]-b.values[i]);
  ctx.fillStyle=color(v,state.metric);ctx.fillRect(i%g.width*15,Math.floor(i/g.width)*15,15,15);
 }
 if(state.selected!==null){ctx.strokeStyle="#fff";ctx.lineWidth=2.4;ctx.strokeRect(state.selected%g.width*15+1,Math.floor(state.selected/g.width)*15+1,13,13)}
}
function chart(){
 const cv=$("cwi2-chart"),ctx=cv?.getContext("2d");if(!ctx||!state.data)return;
 const dpr=window.devicePixelRatio||1;const width=Math.max(300,cv.getBoundingClientRect().width*dpr||580),height=200*dpr;
 cv.width=width;cv.height=height;ctx.scale(dpr,dpr);
 const w=width/dpr,h=height/dpr,pts=Array.from({length:12},(_,i)=>cell(state.selected,i+1));
 const vals=pts.flatMap(x=>x?[x.rain,x.normal]:[]);const mx=Math.max(25,...vals)*1.12;
 ctx.clearRect(0,0,w,h);ctx.font="11px system-ui";ctx.fillStyle="#91b4bf";ctx.textAlign="center";
 const x=i=>35+i*(w-50)/11,y=v=>h-30-v/mx*(h-58);
 ctx.strokeStyle="#3a515d";ctx.beginPath();ctx.moveTo(35,h-30);ctx.lineTo(w-15,h-30);ctx.stroke();
 [1,4,7,10,12].forEach(m=>ctx.fillText(String(m),x(m-1),h-10));
 for(const [key,stroke] of [["normal","#efbd79"],["rain","#70d4c1"]]){
  ctx.strokeStyle=stroke;ctx.lineWidth=key==="rain"?2.8:2;ctx.setLineDash(key==="normal"?[6,4]:[]);
  ctx.beginPath();let ready=false;pts.forEach((v,i)=>{if(!v){ready=false;return}if(!ready)ctx.moveTo(x(i),y(v[key]));else ctx.lineTo(x(i),y(v[key]));ready=true});ctx.stroke();
 }
 ctx.setLineDash([]);
}
function ranking(){
 if(!state.data||state.span>state.month){state.ranked=[];return}
 const size=state.data.grid.width*state.data.grid.height,out=[];
 for(let i=0;i<size;i++){
  let deficit=0,eligible=true;
  for(let month=state.month-state.span+1;month<=state.month;month++){
   const c=cell(i,month);
   if(!c||c.delta>=0){eligible=false;break}
   deficit-=c.delta;
  }
  if(eligible){const a=cell(i,state.month);out.push({index:i,lat:a.lat,lon:a.lon,deficit})}
 }
 out.sort((x,y)=>y.deficit-x.deficit);state.ranked=out;
}
function policy(){
 const list=window.CWI_POLICY?.getScenarios?.()||[];
 state.scenario=Math.max(0,Math.min(state.scenario,list.length-1));
 const v=list[state.scenario];let actual=null;
 if(v)try{actual=window.CWI_POLICY.calculate(v)}catch(_){}
 return {list,v,actual}
}
function renderPolicy(){
 const {list,v,actual}=policy(),selector=$("cwi2-case");
 if(!selector)return;
 selector.innerHTML=list.map((x,i)=>'<option value="'+i+'">'+safe(x.name||("Scenario "+(i+1)))+'</option>').join("");
 selector.value=String(state.scenario);
 $("cwi2-current-npv").textContent=actual?amt(actual.npv):"—";
 $("cwi2-break").textContent=actual&&Number.isFinite(actual.breakEvenNpv)?nfmt(actual.breakEvenNpv)+"%":"—";
 const tab=$("cwi2-matrix");if(!tab)return;
 if(!v){tab.textContent=tr("unavailable");return}
 const fees=[.8,1,1.2].map(s=>Math.round(v.fee*s)),ups=[Math.max(0,v.uptake-20),Math.max(0,v.uptake-10),v.uptake,Math.min(100,v.uptake+10),Math.min(100,v.uptake+20)];
 let html="<thead><tr><th>"+tr("uptake")+"</th>"+fees.map(f=>"<th>"+Math.round(f).toLocaleString("vi-VN")+" ₫</th>").join("")+"</tr></thead><tbody>";
 for(const u of [...new Set(ups)]){html+="<tr><th>"+nfmt(u)+"%</th>";for(const fee of fees){let z=null;try{z=window.CWI_POLICY.calculate({...v,uptake:u,fee}).npv}catch(_){}
 html+="<td class='"+(z===null?"":z>=0?"cwi2-up":"cwi2-down")+"'>"+(z===null?"—":(z<0?"−":"+")+nfmt(Math.abs(z)/1e6)+" tr")+"</td>";
 }html+="</tr>"}
 tab.innerHTML=html+"</tbody>";
}
function present(){
 const c=cell(state.selected);
 for(const [id,val] of [["cwi2-observed",c?vnum(c.rain)+" mm":"—"],["cwi2-base",c?vnum(c.normal)+" mm":"—"],["cwi2-diff",c?(c.delta>0?"+":"")+vnum(c.delta)+" mm":"—"],["cwi2-zscore",c&&c.z!==null?nfmt(c.z)+" σ":"—"],["cwi2-loc",c?c.lat.toFixed(3)+"°N · "+c.lon.toFixed(3)+"°E":"—"]]){
  if($(id))$(id).textContent=val
 }
 if(!state.data)return;
 drawMap();chart();ranking();
 $("cwi2-hits").textContent=state.span>state.month?"—":state.ranked.length.toLocaleString("vi-VN");
 $("cwi2-screenlist").innerHTML=state.span>state.month?"<div class='cwi2-muted'>"+tr("lastMonth")+"</div>":state.ranked.length?state.ranked.slice(0,8).map((p,i)=>'<button type="button" class="cwi2-place" data-select="'+p.index+'"><span>'+String(i+1).padStart(2,"0")+' · '+p.lat.toFixed(3)+'°N, '+p.lon.toFixed(3)+'°E</span><b>'+nfmt(p.deficit)+' mm</b></button>').join(""):"<div class='cwi2-muted'>"+tr("noRows")+"</div>";
}
function status(){
 const box=$("cwi2-status");if(!box)return;
 box.textContent=state.loading?tr("loading"):state.error?tr("unavailable")+" · "+state.error:state.verified?"CHIRPS v3 · SHA-256 VERIFIED · 372 source files":tr("unavailable");box.dataset.state=state.error?"error":state.verified?"good":"loading";
}
function report(){
 const c=cell(state.selected),p=policy();return {schema:"CWI-integrated-analysis-v2",generatedAt:new Date().toISOString(),source:{dataset:state.data?.dataset||null,auditStatus:state.audit?.status||null,sha256Verified:state.verified,sourceSha256:state.audit?.outputSha256||null,reference:"1991–2020",year:2025,boundary:"rectangular viewport including places outside Dak Lak"},rainfall:c,screening:state.verified&&state.span<=state.month?{endMonth:state.month,windowMonths:state.span,matchingGridCells:state.ranked.length,method:"below same-month baseline on all consecutive months; not irrigation shortage"}:null,research:{study:"TNMT2026-085",sample:{COST:217,WTP:217,LAND:218},costRelativePct:39.7,wtpMedianVndYear:262619,landShortageAssociationPct:-21.4,limitation:"Household data not geocoded; cross-sectional noncausal associations"},scenario:p.v?{name:p.v.name,assumptions:p.v,financials:p.actual,source:"CWI v1.7 Policy Studio"}:null,checks:["Verify local water availability","Check costs and actual participation","Validate with field survey","Pilot and evaluate before scaling"],interpretation:"Climate rainfall screening and econometric household results are juxtaposed, not statistically linked."}}
function download(filename,content,mime){
 const blob=new Blob([content],{type:mime}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)
}
function exportCSV(){
 if(!state.verified||state.span>state.month){alert(tr("unavailable"));return}
 const rows=["cell_index,latitude,longitude,month_end,consecutive_months,below_normal_total_mm"];
 state.ranked.forEach(x=>rows.push([x.index,x.lat.toFixed(5),x.lon.toFixed(5),state.month,state.span,x.deficit.toFixed(4)].join(",")));
 download("CWI_rainfall_screening_2025.csv","\ufeff"+rows.join("\n")+"\n","text/csv;charset=utf-8")
}
function exportSeries(){
 if(!state.verified||state.selected===null){alert(tr("unavailable"));return}
 const rows=["month,year,latitude,longitude,observed_mm,normal_1991_2020_mm,anomaly_mm,standardized_departure"];
 for(let i=1;i<=12;i++){const p=cell(state.selected,i);if(p)rows.push([i,2025,p.lat.toFixed(5),p.lon.toFixed(5),p.rain.toFixed(4),p.normal.toFixed(4),p.delta.toFixed(4),p.z===null?"":p.z.toFixed(6)].join(","))}
 download("CWI_chirps_selected_cell_monthly.csv","\ufeff"+rows.join("\n")+"\n","text/csv;charset=utf-8");
}
function exportJSON(){download("CWI_integrated_evidence_dossier.json",JSON.stringify(report(),null,2),"application/json;charset=utf-8")}
function dossier(){
 const root=$("cwi2-report");if(!root)return;
 const r=report(),c=r.rainfall,p=r.scenario;
 root.innerHTML="<article><h3>"+(L()==="vi"?"Quan sát khí hậu":"Climate observation")+"</h3><p>"+(c?(c.lat.toFixed(3)+"°N, "+c.lon.toFixed(3)+"°E · "+nfmt(c.rain)+" mm · Δ "+nfmt(c.delta)+" mm"):tr("unavailable"))+"</p></article>"+
 "<article><h3>"+(L()==="vi"?"Bằng chứng nghiên cứu":"Research evidence")+"</h3><p>COST +39,7% · WTP 262.619 ₫ · LAND −21,4% · N = 217/218</p></article>"+
 "<article><h3>"+(L()==="vi"?"Giả định tài chính":"Financial assumptions")+"</h3><p>"+(p?("NPV "+amt(p.financials.npv)+" · "+nfmt(p.assumptions.uptake)+"% "+tr("uptake")):"—")+"</p></article>";
}
function render(){
 if(!$("cwi2-integrated-view"))return;
 $("cwi2-month").value=String(state.month);$("cwi2-metric").value=state.metric;$("cwi2-span").value=String(state.span);
 status();present();renderPolicy();dossier();
}
function markup(){
 const root=$("cwi2-integrated-view"),T=tr;
 root.innerHTML='<div class="cwi2-container"><div class="cwi2-top"><div><div class="cwi2-label">COFFEE WATER INTELLIGENCE · INTEGRATED WORKSPACE</div><h1>'+T("headline")+'</h1><div class="cwi2-muted">'+T("sub")+'</div></div><div class="cwi2-top-actions"><button id="cwi2-close">'+T("back")+'</button></div></div><div id="cwi2-status" class="cwi2-busy" role="status"></div>'+
 '<div class="cwi2-layout"><section class="cwi2-panel"><div class="cwi2-label">'+T("a")+'</div><div class="cwi2-panelhead"><h2>'+T("mapTitle")+'</h2><div class="cwi2-controls"><label for="cwi2-month">'+T("month")+'</label><select id="cwi2-month">'+Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'">'+String(i+1).padStart(2,"0")+'/2025</option>').join("")+'</select><label for="cwi2-metric">'+T("metric")+'</label><select id="cwi2-metric">'+["delta","rain","normal","z"].map(x=>'<option value="'+x+'">'+T(x)+'</option>').join("")+'</select></div></div><div class="cwi2-map"><canvas id="cwi2-map" width="750" height="615" aria-label="CHIRPS rainfall raster" tabindex="0"></canvas></div>'+
 '<div class="cwi2-cards"><div class="cwi2-card"><small>'+T("observed")+'</small><strong id="cwi2-observed">—</strong></div><div class="cwi2-card"><small>'+T("baseline")+'</small><strong id="cwi2-base">—</strong></div><div class="cwi2-card"><small>'+T("diff")+'</small><strong id="cwi2-diff">—</strong></div></div><div class="cwi2-foot"><span id="cwi2-loc">—</span> · '+T("sourceLine")+'</div></section>'+
 '<section class="cwi2-panel"><div class="cwi2-label">'+T("b")+'</div><h2>'+T("screenTitle")+'</h2><div class="cwi2-controls"><label for="cwi2-span">'+T("window")+'</label><select id="cwi2-span"><option value="2">'+T("two")+'</option><option value="3">'+T("three")+'</option><option value="4">'+T("four")+'</option></select></div><div class="cwi2-cards"><div class="cwi2-card"><small>'+T("hits")+'</small><strong id="cwi2-hits">—</strong></div><div class="cwi2-card"><small>'+T("z")+'</small><strong id="cwi2-zscore">—</strong></div><div class="cwi2-card"><small>'+T("month")+'</small><strong>'+state.month+'/2025</strong></div></div><div class="cwi2-chart"><canvas id="cwi2-chart" width="580" height="200" aria-label="Monthly rainfall trend"></canvas></div><div class="cwi2-foot" style="margin:6px 0">● '+T("observed")+' · ◌ '+T("baseline")+'</div><div id="cwi2-screenlist" class="cwi2-list"></div><div class="cwi2-notice">'+T("noteScreen")+'</div></section>'+
 '<section class="cwi2-panel"><div class="cwi2-label">'+T("c")+'</div><h2>'+T("economic")+'</h2><div class="cwi2-econ"><article><small>'+T("cost")+'</small><b>+39,7%</b><small>'+T("costNote")+'</small></article><article><small>'+T("wtp")+'</small><b>262.619 ₫</b><small>'+T("wtpNote")+'</small></article><article><small>'+T("land")+'</small><b>−21,4%</b><small>'+T("landNote")+'</small></article></div><div class="cwi2-foot">'+T("status")+'</div></section>'+
 '<section class="cwi2-panel"><div class="cwi2-label">'+T("d")+'</div><div class="cwi2-panelhead"><h2>'+T("policy")+'</h2><div class="cwi2-controls"><label for="cwi2-case">'+T("scenario")+'</label><select id="cwi2-case"></select><button id="cwi2-go-policy">'+T("edit")+'</button></div></div><div class="cwi2-cards" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="cwi2-card"><small>'+T("npv")+'</small><strong id="cwi2-current-npv">—</strong></div><div class="cwi2-card"><small>'+T("breakeven")+'</small><strong id="cwi2-break">—</strong></div></div><div class="cwi2-foot">'+T("heat")+'</div><div class="cwi2-tablewrap"><table id="cwi2-matrix"></table></div></section>'+
 '<section class="cwi2-panel cwi2-wide"><div class="cwi2-label">'+T("e")+'</div><h2>'+T("dossier")+'</h2><div id="cwi2-report" class="cwi2-report"></div><div class="cwi2-line"></div><div class="cwi2-export"><button id="cwi2-export-json">'+T("downloadJson")+'</button><button id="cwi2-export-csv">'+T("downloadCsv")+'</button><button id="cwi2-print">'+T("print")+'</button></div><p class="cwi2-foot">'+T("method")+': '+T("status")+'</p></section></div></div>';
}
function open(){
 state.opened=true;document.body.classList.add("cwi2-open");
 const header=document.querySelector("header.globalbar");if(header)$("cwi2-integrated-view").style.top=Math.max(0,header.getBoundingClientRect().bottom)+"px";
 document.querySelectorAll(".global-tabs .gtab").forEach(x=>x.classList.remove("active"));$("nav-integrated")?.classList.add("active");
 render();if(!state.data&&!state.loading)load();
}
function close(){state.opened=false;document.body.classList.remove("cwi2-open");$("nav-integrated")?.classList.remove("active")}
function init(){
 const tabs=document.querySelector(".global-tabs");if(!tabs||$("nav-integrated"))return;
 const btn=document.createElement("button");btn.type="button";btn.className="gtab";btn.id="nav-integrated";btn.textContent=tr("nav");btn.setAttribute("aria-controls","cwi2-integrated-view");btn.setAttribute("aria-expanded","false");
 tabs.insertBefore(btn,$("nav-official-chirps")||tabs.lastElementChild);
 const root=document.createElement("section");root.id="cwi2-integrated-view";root.setAttribute("aria-label","CWI integrated climate economic decision workspace");document.body.appendChild(root);markup();
 btn.addEventListener("click",()=>{if(state.opened){close();$("nav-overview")?.click()}else{open()};btn.setAttribute("aria-expanded",String(state.opened))});
 root.addEventListener("click",e=>{
  if(e.target.closest("#cwi2-close")){close();$("nav-overview")?.click();return}
  if(e.target.closest("#cwi2-go-policy")){close();$("nav-policy")?.click();return}
  if(e.target.closest("#cwi2-export-json")){exportJSON();return}
  if(e.target.closest("#cwi2-export-csv")){exportCSV();return}
  if(e.target.closest("#cwi2-export-series")){exportSeries();return}
  if(e.target.closest("#cwi2-print")){window.print();return}
  const loc=e.target.closest("[data-select]");if(loc){state.selected=Number(loc.dataset.select);render();return}
 });
 root.addEventListener("change",e=>{
  switch(e.target.id){case"cwi2-month":state.month=Number(e.target.value);break;case"cwi2-metric":state.metric=e.target.value;break;case"cwi2-span":state.span=Number(e.target.value);break;case"cwi2-case":state.scenario=Number(e.target.value);break;default:return}
  render();
 });
 root.addEventListener("click",e=>{if(e.target.id!=="cwi2-map")return;if(!state.data)return;const box=e.currentTarget.getBoundingClientRect(),g=grid(),c=Math.max(0,Math.min(g.width-1,Math.floor((e.clientX-box.left)/box.width*g.width))),r=Math.max(0,Math.min(g.height-1,Math.floor((e.clientY-box.top)/box.height*g.height)));state.selected=r*g.width+c;render()});
 root.addEventListener("keydown",e=>{if(e.target.id!=="cwi2-map")return;if(!state.data||!["ArrowRight","ArrowLeft","ArrowUp","ArrowDown"].includes(e.key))return;e.preventDefault();const g=grid(),delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:g.width,ArrowUp:-g.width}[e.key];state.selected=Math.max(0,Math.min(g.width*g.height-1,(state.selected||0)+delta));render()});
 document.addEventListener("click",e=>{if(!state.opened)return;const x=e.target.closest(".global-tabs .gtab");if(x&&x.id!=="nav-integrated"){close();btn.setAttribute("aria-expanded","false")} },true);
 window.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.opened){close();$("nav-overview")?.click()}});
 document.addEventListener("cwi-language-changed",()=>{btn.textContent=tr("nav");markup();render()});
 window.addEventListener("resize",()=>{if(state.opened){const header=document.querySelector("header.globalbar");if(header)root.style.top=Math.max(0,header.getBoundingClientRect().bottom)+"px";chart()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.CWI_INTEGRATED={getState:()=>({opened:state.opened,verified:state.verified,month:state.month,screenedCells:state.ranked.length}),getDossier:report};
})();