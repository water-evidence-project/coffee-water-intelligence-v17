/* CWI Decision Intelligence · tightly integrated with CWI 1.7.
 * Climatic observations trigger investigation, NEVER predict household damages.
 * Robust financial bounds reuse window.CWI_POLICY.calculate.
 */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={open:false,busy:false,data:null,audit:null,error:null,verified:false,selected:null,month:12,span:3,scenario:0,lo:20,hi:70,shock:20,field:false,survey:false,ranked:[],lang:"vi"};
const lang=()=>document.getElementById("lang-en")?.classList.contains("active")?"en":"vi";
const V={
vi:{nav:"Phân tích quyết định",title:"Từ tín hiệu khí hậu đến điều kiện khả thi",subtitle:"Một tình huống phân tích · Nguồn dữ liệu có kiểm chứng · Kết luận theo giả định",back:"Về bản đồ",source:"Nguồn dữ liệu",loaded:"CHIRPS v3 đã kiểm chứng SHA-256",loading:"Đang kiểm tra tính toàn vẹn dữ liệu CHIRPS…",error:"Không thể sử dụng dữ liệu khí hậu",scenario:"Phương án",month:"Tháng",span:"Tháng dưới chuẩn liên tiếp",low:"Tỷ lệ tham gia thấp nhất",high:"Tỷ lệ tham gia cao nhất",shock:"Mức tăng chi phí cần dự phòng",finance:"Điều kiện tài chính",base:"NPV theo phương án gốc",threshold:"Tỷ lệ tham gia hòa vốn",stress:"Hòa vốn khi chi phí tăng",best:"NPV ở điều kiện thuận lợi",worst:"NPV ở điều kiện bất lợi",diagram:"Ranh giới khả thi theo tỷ lệ tham gia",field:"Đã kiểm tra thực địa về nguồn nước (người dùng tự xác nhận)",survey:"Đã khảo sát tỷ lệ tham gia thực tế (người dùng tự xác nhận)",save:"Xuất hồ sơ phân tích",export:"Xuất chuỗi mưa CSV",method:"Phương pháp và giới hạn",cost:"Chi phí tưới",wtp:"Sẵn lòng chi trả",land:"Giá trị đất",go:"Mở Policy Studio",unavailable:"Chưa có dữ liệu",screen:"Ô lưới cần xem xét",signal:"Tín hiệu khí hậu",decision:"Kết quả kiểm tra điều kiện",need:"Cần xác minh tiếp",note:"Không suy ra tác động kinh tế theo tọa độ. Những hệ số nghiên cứu là kết quả của mẫu hộ, không phải mô hình không gian.",no_signal:"Không xuất hiện chuỗi mưa thấp theo bộ lọc",yes_signal:"Xuất hiện mưa dưới chuẩn liên tiếp",no_data:"Ô lưới không có dữ liệu hợp lệ",months:"tháng",ready:"Đã khai báo kiểm tra; cần thẩm định bằng chứng",not_ready:"Chưa có xác nhận về điều kiện thực địa và hành vi tham gia",fully:"NPV không âm trong toàn bộ khoảng giả định",never:"NPV âm trong toàn bộ khoảng giả định",depends:"Kết luận NPV phụ thuộc vào giả định",invalid:"Một giá trị vượt giới hạn cho phép của mô hình gốc",next:"Ưu tiên khảo sát",uptake:"Tỷ lệ tham gia",coststress:"Biến động chi phí",rain:"Mưa năm 2025",normal:"Chuẩn 1991–2020",delta:"Sai lệch lượng mưa",year:"CHIRPS v3 · 2025",verified:"Dữ liệu xác minh",assumed:"Giả định người dùng",empirical:"Kết quả nghiên cứu",grid:"Khung ô lưới, không phải ranh giới Đắk Lắk",nopoint:"Chọn ô trên bản đồ",baseline:"Kỳ chuẩn",review:"Đang xem xét",calc:"Mô hình NPV gốc",status:"Đánh giá có điều kiện",summary:"Hồ sơ quyết định"},
en:{nav:"Decision intelligence",title:"From climate signals to decision conditions",subtitle:"One analysis case · Audited data · Conditional conclusions",back:"Back to map",source:"Data source",loaded:"CHIRPS v3 SHA-256 verified",loading:"Verifying CHIRPS source integrity…",error:"Climate data unavailable",scenario:"Scenario",month:"Month",span:"Consecutive below-normal months",low:"Minimum participation",high:"Maximum participation",shock:"Cost stress allowance",finance:"Financial conditions",base:"Original scenario NPV",threshold:"Break-even participation",stress:"Break-even with stressed costs",best:"NPV under favorable bounds",worst:"NPV under adverse bounds",diagram:"Participation–NPV decision frontier",field:"Field water availability checked (user declaration)",survey:"Actual participation surveyed (user declaration)",save:"Export decision dossier",export:"Export rainfall CSV",method:"Methods and limitations",cost:"Irrigation cost",wtp:"Willingness to pay",land:"Land value",go:"Open Policy Studio",unavailable:"Data unavailable",screen:"Grid cells for screening",signal:"Climate signal",decision:"Conditional assessment",need:"Needs verification",note:"No household economic effects are inferred by pixel. Regression coefficients refer to survey observations.",no_signal:"No consecutive below-normal rainfall under the chosen rule",yes_signal:"Consecutive below-normal rainfall observed",no_data:"Selected cell lacks valid observations",months:"months",ready:"User-declared checks; evidence still needs review",not_ready:"Field conditions and real participation not verified",fully:"NPV nonnegative across the specified bounds",never:"NPV negative across the specified bounds",depends:"NPV changes sign within the specified bounds",invalid:"One parameter exceeds original model limits",next:"Prioritize validation of",uptake:"Participation",coststress:"Cost uncertainty",rain:"2025 rainfall",normal:"1991–2020 normal",delta:"Rainfall anomaly",year:"CHIRPS v3 · 2025",verified:"Verified data",assumed:"User assumptions",empirical:"Research result",grid:"Rectangular grid, not provincial boundary",nopoint:"Select a map cell",baseline:"Reference period",review:"Under review",calc:"Original NPV model",status:"Conditional assessment",summary:"Decision dossier"}
};
const t=k=>V[S.lang][k]||k;
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString(S.lang==="vi"?"vi-VN":"en-US",{maximumFractionDigits:d}):"—";
const money=n=>Number.isFinite(n)?Math.round(n).toLocaleString(S.lang==="vi"?"vi-VN":"en-US")+" ₫":"—";
const htmlEscape=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const hex=arr=>Array.from(new Uint8Array(arr),x=>x.toString(16).padStart(2,"0")).join("");
function originalScenarios(){try{return window.CWI_POLICY?.getScenarios?.()||[]}catch{return []}}
function originalCalc(v){return window.CWI_POLICY.calculate(v)}
function scenario(){const a=originalScenarios();S.scenario=Math.min(Math.max(0,S.scenario),Math.max(a.length-1,0));return a[S.scenario]||null}
function climateCell(i,m){const d=S.data;if(!d||i===null||m<1||m>12)return null;const g=d.grid,base=d.baseline.months[m-1],obs=d.periods[m-1];if(i<0||i>=g.width*g.height)return null;const x=obs.values[i],b=base.values[i],sd=base.std[i];if(!Number.isFinite(x)||!Number.isFinite(b))return null;return {i,m,r:x,normal:b,delta:x-b,z:Number.isFinite(sd)&&sd>0?(x-b)/sd:null,lat:g.north+(Math.floor(i/g.width)+.5)*g.dy,lon:g.west+(i%g.width+.5)*g.dx}}
function chooseValid(){const d=S.data;if(!d)return null;const mid=Math.floor(d.grid.height/2)*d.grid.width+Math.floor(d.grid.width/2);if(climateCell(mid,S.month))return mid;for(let i=0;i<d.grid.width*d.grid.height;i++){if(climateCell(i,S.month))return i}return null}
function climateScreen(i){if(!S.data||i===null||S.span>S.month)return null;let total=0;for(let m=S.month-S.span+1;m<=S.month;m++){const c=climateCell(i,m);if(!c)return null;if(c.delta>=0)return {flag:false,total:0};total-=c.delta}return {flag:true,total}}
function rank(){if(!S.data)return [];const a=[];for(let i=0;i<S.data.grid.width*S.data.grid.height;i++){const v=climateScreen(i);if(v?.flag)a.push({i,total:v.total,c:climateCell(i,S.month)})}a.sort((x,y)=>y.total-x.total);return a}
function annuity(v){const r=v.discount/100;return r===0?v.years:(1-Math.pow(1+r,-v.years))/r}
function stressScenario(v){return {...v,uptake:S.lo,cost:Math.round(v.cost*(1+S.shock/100)),fixed:Math.round(v.fixed*(1+S.shock/100)),capex:Math.round(v.capex*(1+S.shock/100))}}
function finance(){
 const v=scenario();if(!v)return {error:"No saved Policy Studio scenarios"};
 try{
  const base=originalCalc(v),lo=originalCalc(stressScenario(v)),hi=originalCalc({...v,uptake:S.hi});
  const upperAtLow=originalCalc({...v,uptake:S.lo}),spread=Math.abs(hi.npv-upperAtLow.npv),costUncertainty=Math.abs(upperAtLow.npv-lo.npv);
  const stressed=originalCalc({...stressScenario(v),uptake:S.hi});
  const label=lo.npv>=0?"fully":hi.npv<0?"never":"depends";
  return {v,base,lo,hi,stressed,spread,costUncertainty,label,priority:spread>=costUncertainty?"uptake":"coststress"};
 }catch(err){return {error:String(err?.message||err)}}
}
function setIntegrity(text,state){const el=$("di-status");if(!el)return;el.textContent=text;el.dataset.state=state}
async function load(){
 if(S.busy||S.data)return;S.busy=true;setIntegrity(t("loading"),"loading");
 try{
  if(!window.crypto?.subtle)throw Error("SHA-256 requires a secure browser context");
  const [a,d]=await Promise.all([fetch("./data/chirps-v3-cog-audit.json",{cache:"no-store"}),fetch("./data/chirps-v3-daklak.json",{cache:"no-store"})]);
  if(!a.ok||!d.ok)throw Error("CHIRPS source fetch failed");
  const audit=await a.json(),raw=await d.text();if(hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw)))!==audit.outputSha256)throw Error("CHIRPS dataset SHA-256 mismatch");
  const data=JSON.parse(raw),g=data.grid;
  if(audit.status!=="PASS"||audit.officialPublisherFilesChecked!==372||audit.referenceSourceCount!==360||audit.targetSourceCount!==12||audit.referencePeriod!=="1991-2020"||audit.dataset!=="CHIRPS v3.0 monthly final"||data.dataset!==audit.dataset||data.baseline?.sourceCount!==360||data.baseline?.startYear!==1991||data.baseline?.endYear!==2020||data.periods?.length!==12||g?.width!==50||g?.height!==41)throw Error("CHIRPS metadata or audit mismatch");
  if(!data.periods.every((x,i)=>x.year===2025&&x.month===i+1&&x.values.length===2050&&data.baseline.months[i].values.length===2050&&data.baseline.months[i].std.length===2050))throw Error("Incomplete climate grid");
  S.data=data;S.audit=audit;S.verified=true;S.selected=chooseValid();S.error=null;setIntegrity(t("loaded"),"ok");
 }catch(err){S.data=null;S.audit=null;S.verified=false;S.error=String(err?.message||err);setIntegrity(t("error")+" · "+S.error,"error")}
 finally{S.busy=false;render()}
}
function mapColor(n){if(!Number.isFinite(n))return "#15202a";const s=Math.max(-1,Math.min(1,n/170));if(s<0)return "hsl(32 63% "+(58+s*16)+"%)";return "hsl("+(183+s*23)+" 58% "+(45-s*10)+"%)"}
function mapDraw(){
 const cv=$("di-map");if(!cv||!S.data)return;const g=S.data.grid,ctx=cv.getContext("2d");cv.width=g.width*15;cv.height=g.height*15;
 for(let i=0;i<g.width*g.height;i++){const x=climateCell(i,S.month);ctx.fillStyle=mapColor(x?.delta);ctx.fillRect((i%g.width)*15,Math.floor(i/g.width)*15,15,15)}
 if(S.selected!==null){ctx.strokeStyle="#ffffff";ctx.lineWidth=3;ctx.strokeRect((S.selected%g.width)*15+1,Math.floor(S.selected/g.width)*15+1,13,13)}
}
function frontierDraw(fin){
 const cv=$("di-frontier");if(!cv)return;
 const ratio=window.devicePixelRatio||1,w=Math.max(400,cv.getBoundingClientRect().width||590),h=236;
 cv.width=Math.round(w*ratio);cv.height=Math.round(h*ratio);const ctx=cv.getContext("2d");ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
 const left=56,right=w-23,top=22,bottom=194;
 ctx.fillStyle="#94b0bd";ctx.font="11px system-ui";ctx.textAlign="center";
 if(!fin||fin.error){ctx.fillText(t("unavailable"),w/2,h/2);return}
 const v=fin.v,bounds=[];
 for(const uptake of [0,100]){for(const stressed of [false,true])try{bounds.push(originalCalc(stressed?{...stressScenario(v),uptake}:{...v,uptake}).npv)}catch{}}
 if(!bounds.length)return;
 const yMin=Math.min(-1,...bounds),yMax=Math.max(1,...bounds),range=(yMax-yMin)||1;
 const x=u=>left+(right-left)*u/100,y=value=>bottom-(value-yMin)/range*(bottom-top);
 ctx.fillStyle="#1c3840";ctx.fillRect(x(S.lo),top,x(S.hi)-x(S.lo),bottom-top);
 ctx.strokeStyle="#52626b";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y(0));ctx.lineTo(right,y(0));ctx.stroke();
 for(const tick of [0,25,50,75,100]){ctx.fillStyle="#9db5bf";ctx.fillText(tick+"%",x(tick),218)}
 ctx.textAlign="left";ctx.fillStyle="#a9c1cd";ctx.fillText("0 NPV",4,y(0)-4);
 function plot(stressed,color){
  ctx.strokeStyle=color;ctx.lineWidth=2.6;ctx.beginPath();let started=false;
  for(let u=0;u<=100;u+=2){try{const n=originalCalc(stressed?{...stressScenario(v),uptake:u}:{...v,uptake:u}).npv;if(!started){ctx.moveTo(x(u),y(n));started=true}else ctx.lineTo(x(u),y(n))}catch{}}
  ctx.stroke();
 }
 plot(false,"#70d6c8");plot(true,"#e8ad76");
 const breakeven=fin.base.breakEvenNpv;if(Number.isFinite(breakeven)&&breakeven>=0&&breakeven<=100){
  ctx.strokeStyle="#dfe8ee";ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(x(breakeven),top);ctx.lineTo(x(breakeven),bottom);ctx.stroke();ctx.setLineDash([]);
 }
}
function dossier(){
 const f=finance(),c=climateCell(S.selected,S.month),screen=climateScreen(S.selected);
 return {schema:"CWI-DecisionCase-v1",createdAt:new Date().toISOString(),app:"Coffee Water Intelligence v1.7 + Decision Intelligence",climate:{dataset:"CHIRPS v3 monthly final",period:2025,reference:"1991-2020",sha256Verified:S.verified,sha256:S.audit?.outputSha256||null,selected:c,rule:{months:S.span,flag:screen?.flag??null,deficitMm:screen?.total??null},geography:"rectangle is not precise Dak Lak boundary",notDirectWaterAvailability:true},economics:{source:"TNMT2026-085",sample:{COST:217,WTP:217,LAND:218},costComparisonPct:39.7,wtpMedianAnnualVND:262619,landShortageAssociationPct:-21.4,limitation:"Survey associations cannot be mapped onto CHIRPS pixels or read causally"},scenario:f.error?{error:f.error}:{source:"CWI_POLICY.calculate",assumptions:f.v,bounds:{uptakeMin:S.lo,uptakeMax:S.hi,costStressPct:S.shock},npvBase:f.base.npv,npvWorst:f.lo.npv,npvBest:f.hi.npv,participationThresholdPct:f.base.breakEvenNpv,participationThresholdStressPct:f.stressed.breakEvenNpv,conditionalResult:f.label,sensitivity:{participationNPVSpan:f.spread,costStressNPVSpan:f.costUncertainty}},verification:{fieldWaterCheckedByUser:S.field,participationSurveyedByUser:S.survey,notExternallyVerified:true},interpretation:"Climate signal and economics remain separate data domains; no rainfall-to-household causal model."}
}
function download(name,content,type){const b=new Blob([content],{type}),url=URL.createObjectURL(b),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function exportDossier(){download("CWI_decision_case.json",JSON.stringify(dossier(),null,2),"application/json;charset=utf-8")}
function exportRain(){
 if(!S.verified||S.selected===null){alert(t("unavailable"));return}
 const records=["year,month,lat,lon,observed_mm,normal_1991_2020_mm,anomaly_mm,standardized_departure"];
 for(let m=1;m<=12;m++){const v=climateCell(S.selected,m);if(v)records.push([2025,m,v.lat.toFixed(5),v.lon.toFixed(5),v.r.toFixed(4),v.normal.toFixed(4),v.delta.toFixed(4),v.z===null?"":v.z.toFixed(5)].join(","))}
 download("CWI_cell_chirps_2025.csv","\ufeff"+records.join("\n")+"\n","text/csv;charset=utf-8")
}
function render(){
 if(!$("di-root"))return;
 const dataReady=S.verified,cell=climateCell(S.selected,S.month),screen=climateScreen(S.selected),fin=finance();
 const text=(id,s)=>{const el=$(id);if(el)el.textContent=s};
 text("di-point",cell?cell.lat.toFixed(3)+"°N · "+cell.lon.toFixed(3)+"°E":t("nopoint"));
 text("di-observed",cell?fmt(cell.r)+" mm":"—");text("di-normal",cell?fmt(cell.normal)+" mm":"—");text("di-anomaly",cell?(cell.delta>0?"+":"")+fmt(cell.delta)+" mm":"—");
 text("di-trigger",!dataReady?t("unavailable"):screen===null?t("no_data"):screen.flag?t("yes_signal"):t("no_signal"));
 text("di-rankcount",dataReady?rank().length.toLocaleString(S.lang==="vi"?"vi-VN":"en-US"):"—");
 const nav=$("di-scenarios");if(nav){const arr=originalScenarios();nav.innerHTML=arr.map((x,i)=>'<option value="'+i+'">'+htmlEscape(x.name||("Scenario "+(i+1)))+'</option>').join("");nav.value=String(S.scenario)}
 text("di-base",fin.error?"—":money(fin.base.npv));text("di-threshold",fin.error||!Number.isFinite(fin.base.breakEvenNpv)?"—":fmt(fin.base.breakEvenNpv)+"%");
 text("di-thresholdstress",fin.error||!Number.isFinite(fin.stressed.breakEvenNpv)?"—":fmt(fin.stressed.breakEvenNpv)+"%");
 text("di-worst",fin.error?"—":money(fin.lo.npv));text("di-best",fin.error?"—":money(fin.hi.npv));
 text("di-statusmoney",fin.error?t("invalid"):t(fin.label));
 const outcome=$("di-outcome");if(outcome){outcome.dataset.result=fin.error?"error":fin.label}
 const larger=fin.error?null:fin.priority;
 text("di-priority",larger?t(larger):"—");
 const next=fin.error?t("invalid"):(screen?.flag?t("yes_signal")+". ":"")+(S.field&&S.survey?t("ready"):t("not_ready"))+". "+t("next")+": "+t(larger);
 text("di-next",next);
 text("di-verified",S.verified?t("loaded"):S.error?t("error")+" · "+S.error:t("loading"));
 if(!S.busy&&!S.data&&S.error) setIntegrity(t("error")+" · "+S.error,"error");
 const candidates=rank().slice(0,6);
 const list=$("di-list");
 if(list)list.innerHTML=candidates.length?candidates.map((x,i)=>'<button type="button" class="di-site" data-point="'+x.i+'"><span>'+String(i+1).padStart(2,"0")+"  "+x.c.lat.toFixed(3)+"°N  "+x.c.lon.toFixed(3)+'°E</span><strong>'+fmt(x.total)+" mm</strong></button>").join(""):"<p>"+t("unavailable")+"</p>";
 const near=$("di-rain-flag");if(near){near.dataset.signal=screen?.flag?"yes":"no"}
 const r=$("di-summary");if(r)r.textContent=fin.error?t("invalid"):t(fin.label)+". "+(screen?.flag?t("yes_signal"):t("no_signal"))+". "+t("note");
 $("di-month").value=String(S.month);$("di-span").value=String(S.span);$("di-low").value=String(S.lo);$("di-high").value=String(S.hi);$("di-shock").value=String(S.shock);
 text("di-low-value",fmt(S.lo,0)+"%");text("di-high-value",fmt(S.hi,0)+"%");text("di-shock-value",fmt(S.shock,0)+"%");
 $("di-field").checked=S.field;$("di-survey").checked=S.survey;
 if(dataReady)mapDraw();frontierDraw(fin)
}
function markup(){
 const root=$("di-root");const k=t,months=Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'">'+String(i+1).padStart(2,"0")+"/2025</option>").join("");
 root.innerHTML='<div class="di-wrap"><header class="di-head"><div><div class="di-kicker">CWI RESEARCH WORKSTATION / DECISION INTELLIGENCE</div><h1>'+k("title")+'</h1><p>'+k("subtitle")+'</p></div><div class="di-headtools"><span id="di-status" data-state="loading">'+k("loading")+'</span><button type="button" id="di-back">'+k("back")+'</button></div></header>'+
 '<section class="di-intro"><span>01 · '+k("signal")+'</span><span>→</span><span>02 · '+k("finance")+'</span><span>→</span><span>03 · '+k("decision")+'</span><span>→</span><span>04 · '+k("summary")+'</span></section>'+
 '<div class="di-columns"><section class="di-card di-climate"><div class="di-titleline"><div><div class="di-kicker">01 / CLIMATE EVIDENCE</div><h2>'+k("signal")+'</h2></div><div class="di-row"><label for="di-month">'+k("month")+'</label><select id="di-month">'+months+'</select><label for="di-span">'+k("span")+'</label><select id="di-span"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div></div>'+
 '<div class="di-geogrid"><div class="di-mapzone"><canvas id="di-map" width="750" height="615" role="img" aria-label="CHIRPS rainfall anomaly grid"></canvas><span class="di-mapcorner">CHIRPS v3 · 0.05° / 2025</span></div><aside class="di-geoside"><div class="di-tag">'+k("verified")+'</div><h3 id="di-rain-flag">'+k("signal")+'</h3><p id="di-trigger">—</p><div class="di-line"></div><span>'+k("grid")+'</span><strong id="di-point">—</strong><div class="di-numbers"><div><small>'+k("rain")+'</small><b id="di-observed">—</b></div><div><small>'+k("normal")+'</small><b id="di-normal">—</b></div><div><small>'+k("delta")+'</small><b id="di-anomaly">—</b></div></div><div class="di-line"></div><span>'+k("screen")+' · <b id="di-rankcount">—</b></span><div id="di-list" class="di-sitelist"></div></aside></div>'+
 '<div class="di-legend"><div class="di-spectrum"></div><div class="di-legendtext"><span>≤ −170 mm</span><span>0 mm</span><span>≥ +170 mm</span></div></div><p class="di-footnote">'+k("grid")+'. '+k("note")+'</p></section>'+
 '<section class="di-card di-finance"><div class="di-titleline"><div><div class="di-kicker">02 / POLICY ROBUSTNESS</div><h2>'+k("finance")+'</h2></div><div class="di-row"><label for="di-scenarios">'+k("scenario")+'</label><select id="di-scenarios"></select><button type="button" id="di-openpolicy">'+k("go")+'</button></div></div><div class="di-fin-grid"><div><span>'+k("base")+'</span><strong id="di-base">—</strong></div><div><span>'+k("threshold")+'</span><strong id="di-threshold">—</strong></div></div>'+
 '<div class="di-control"><label for="di-low">'+k("low")+' <output id="di-low-value"></output></label><input type="range" id="di-low" min="0" max="100" step="5"></div>'+
 '<div class="di-control"><label for="di-high">'+k("high")+' <output id="di-high-value"></output></label><input type="range" id="di-high" min="0" max="100" step="5"></div>'+
 '<div class="di-control"><label for="di-shock">'+k("shock")+' <output id="di-shock-value"></output></label><input type="range" id="di-shock" min="0" max="60" step="5"></div>'+
 '<div class="di-frontier"><div class="di-paneltitle">'+k("diagram")+'</div><canvas id="di-frontier" height="236"></canvas><div class="di-plotkey"><span class="di-key-base">Base costs</span><span class="di-key-stress">Stressed costs</span><span class="di-key-range">Uptake range</span></div></div>'+
 '<div class="di-four"><div><span>'+k("stress")+'</span><b id="di-thresholdstress">—</b></div><div><span>'+k("worst")+'</span><b id="di-worst">—</b></div><div><span>'+k("best")+'</span><b id="di-best">—</b></div></div><p class="di-footnote">'+k("assumed")+' · '+k("calc")+'. '+k("note")+'</p></section></div>'+
 '<section class="di-card di-decision"><div class="di-titleline"><div><div class="di-kicker">03 / CONDITIONAL DECISION</div><h2>'+k("decision")+'</h2></div></div>'+
 '<div class="di-decisiongrid"><div class="di-verdict" id="di-outcome"><div class="di-small">'+k("status")+'</div><strong id="di-statusmoney">—</strong><div class="di-small">'+k("next")+'</div><b id="di-priority">—</b></div><div class="di-next"><h3>'+k("need")+'</h3><p id="di-next"></p><label><input type="checkbox" id="di-field"> '+k("field")+'</label><label><input type="checkbox" id="di-survey"> '+k("survey")+'</label></div></div>'+
 '<div class="di-evidence"><span>'+k("empirical")+' · TNMT2026-085</span><div>'+k("cost")+' <b>+39,7%</b> · '+k("wtp")+' <b>262.619 ₫</b> · '+k("land")+' <b>−21,4%</b></div><p>'+k("note")+'</p></div></section>'+
 '<section class="di-card di-dossier"><div class="di-titleline"><div><div class="di-kicker">04 / DECISION DOSSIER</div><h2>'+k("summary")+'</h2></div><div class="di-row"><button id="di-export" type="button">'+k("save")+'</button><button id="di-rainexport" type="button">'+k("export")+'</button></div></div><div class="di-report" id="di-summary">—</div><details class="di-method"><summary>'+k("method")+'</summary><p>CHIRPS v3 · 2025 · 1991–2020; 372 publisher files checked. Assumption bounds are user-specified, not estimated probabilities. Results inherit the limitations of the source study and Policy Studio. Field checks are self-declared, not third-party verified.</p></details></section></div>';
}
function init(){
 if($("nav-integrated"))document.getElementById("nav-integrated").remove();
 const tabs=document.querySelector(".global-tabs");if(!tabs)return;
 const nav=document.createElement("button");nav.className="gtab";nav.type="button";nav.id="nav-integrated";nav.textContent=t("nav");tabs.insertBefore(nav,document.getElementById("nav-official-chirps")||tabs.lastElementChild);
 const root=document.createElement("section");root.id="di-root";root.setAttribute("aria-label","CWI Decision Intelligence");document.body.appendChild(root);
 markup();
 nav.addEventListener("click",()=>{S.open=!S.open;document.body.classList.toggle("di-open",S.open);nav.classList.toggle("active",S.open);nav.setAttribute("aria-expanded",String(S.open));if(S.open){render();if(!S.data&&!S.busy)load()}else document.getElementById("nav-overview")?.click()});
 root.addEventListener("click",e=>{
  const id=e.target.id,choice=e.target.closest("[data-point]");
  if(id==="di-back"){close();document.getElementById("nav-overview")?.click()}
  else if(id==="di-openpolicy"){close();document.getElementById("nav-policy")?.click()}
  else if(id==="di-export")exportDossier();
  else if(id==="di-rainexport")exportRain();
  else if(choice){S.selected=Number(choice.dataset.point);render()}
 });
 root.addEventListener("change",e=>{
  switch(e.target.id){case"di-month":S.month=Number(e.target.value);break;case"di-span":S.span=Number(e.target.value);break;case"di-scenarios":S.scenario=Number(e.target.value);break;case"di-field":S.field=e.target.checked;break;case"di-survey":S.survey=e.target.checked;break;default:return}render();
 });
 root.addEventListener("input",e=>{
  const n=Number(e.target.value);
  switch(e.target.id){case"di-low":S.lo=Math.min(n,S.hi);break;case"di-high":S.hi=Math.max(n,S.lo);break;case"di-shock":S.shock=n;break;default:return}render();
 });
 root.addEventListener("click",e=>{if(e.target.id!=="di-map"||!S.data)return;const box=e.target.getBoundingClientRect(),g=S.data.grid;const col=Math.min(g.width-1,Math.max(0,Math.floor((e.clientX-box.left)/box.width*g.width))),row=Math.min(g.height-1,Math.max(0,Math.floor((e.clientY-box.top)/box.height*g.height)));S.selected=row*g.width+col;render()});
 document.addEventListener("click",e=>{if(!S.open)return;const other=e.target.closest(".global-tabs .gtab");if(other&&other!==nav)close()},true);
 document.addEventListener("cwi-language-changed",()=>{S.lang=lang();nav.textContent=t("nav");markup();render()});
 window.addEventListener("resize",()=>{if(S.open)frontierDraw(finance())});
 window.addEventListener("keydown",e=>{if(S.open&&e.key==="Escape"){close();document.getElementById("nav-overview")?.click()}});
 function close(){S.open=false;document.body.classList.remove("di-open");nav.classList.remove("active");nav.setAttribute("aria-expanded","false")}
 S.lang=lang();render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.CWI_DECISION={getCase:dossier,getState:()=>({open:S.open,verified:S.verified,selected:S.selected,month:S.month,lo:S.lo,hi:S.hi,shock:S.shock}),calcBounds:v=>{const old=scenario;return finance()}};
})();