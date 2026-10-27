/* CWI Decision Intelligence · tightly integrated with CWI 1.7.
 * Climatic observations trigger investigation, NEVER predict household damages.
 * Robust financial bounds reuse window.CWI_POLICY.calculate.
 */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={open:false,busy:false,data:null,audit:null,error:null,verified:false,selected:null,month:12,span:3,scenario:0,lo:20,hi:70,shock:20,field:false,survey:false,ranked:[],lang:"vi"};
const GEOREF={boundary:"M330.5,172.3 L349.2,182.9 L366.3,181.6 L375.4,188.5 L394.9,193.1 L403.4,205.2 L404.5,217.8 L416.1,221.1 L422.4,243.2 L434.7,254.3 L434.7,268.8 L444.4,272.5 L454.8,287.5 L452.8,297.1 L471.3,303.4 L479.5,300.1 L488.3,306.8 L509.7,311.1 L514.4,304.4 L536.0,297.8 L533.5,279.1 L537.6,265.2 L543.5,259.4 L549.9,261.4 L565.4,253.9 L570.2,243.2 L568.5,235.2 L574.0,232.3 L575.8,223.9 L576.3,212.4 L554.4,185.7 L549.2,145.9 L531.3,152.4 L522.3,150.6 L518.4,144.5 L521.8,131.5 L527.4,129.6 L533.4,114.9 L555.9,111.1 L560.7,115.2 L568.8,113.8 L574.7,125.6 L591.7,123.4 L601.0,128.3 L622.9,129.6 L630.0,127.1 L638.2,114.3 L649.5,114.5 L661.0,108.4 L662.0,88.3 L672.9,91.6 L674.2,76.4 L690.4,70.6 L692.2,75.3 L700.3,77.4 L699.3,90.3 L706.8,104.1 L723.4,113.8 L716.6,118.7 L716.6,125.8 L724.5,131.4 L719.5,137.1 L721.9,145.0 L726.6,149.8 L732.0,146.5 L734.3,149.4 L729.4,152.0 L727.9,167.1 L723.2,170.4 L709.8,163.1 L721.3,153.3 L705.4,139.3 L696.5,155.1 L702.6,161.9 L696.1,166.0 L699.9,167.8 L696.9,175.2 L704.3,175.9 L710.5,186.8 L720.8,184.0 L722.4,187.0 L723.6,194.6 L719.2,194.4 L718.0,201.1 L729.1,221.8 L721.5,235.3 L725.0,245.1 L721.8,260.7 L747.7,304.1 L766.1,326.1 L764.3,329.0 L768.7,328.5 L777.6,340.2 L776.8,358.2 L765.3,362.6 L771.5,355.1 L768.5,351.2 L758.7,356.3 L754.5,364.5 L746.4,355.7 L730.9,366.8 L708.5,366.1 L698.6,374.6 L692.6,368.7 L678.4,369.8 L670.0,385.7 L660.1,379.7 L650.0,398.3 L643.1,395.1 L628.2,401.7 L615.6,412.5 L616.4,416.9 L604.8,418.4 L597.4,432.5 L585.2,439.0 L592.1,448.2 L583.1,455.5 L583.1,465.8 L572.1,483.9 L578.3,490.0 L575.2,498.7 L543.7,481.2 L535.1,482.8 L530.1,491.3 L522.2,488.3 L517.3,491.9 L506.2,508.9 L513.2,526.5 L509.0,534.8 L511.6,543.0 L505.6,551.7 L480.8,559.4 L462.5,552.5 L460.2,558.0 L451.7,559.5 L442.3,548.3 L433.9,560.1 L428.2,559.4 L426.9,568.8 L423.6,565.7 L417.7,571.1 L391.4,569.5 L392.7,576.5 L377.5,585.5 L370.9,581.4 L358.7,599.6 L353.9,592.2 L344.3,596.4 L331.5,589.3 L316.7,594.6 L289.4,555.7 L282.3,554.9 L280.9,550.8 L267.3,552.7 L252.5,536.5 L252.4,526.3 L245.3,517.5 L249.9,513.1 L248.9,507.5 L270.3,501.0 L275.7,490.5 L258.1,474.3 L244.3,473.8 L236.8,468.2 L239.1,460.4 L252.9,450.6 L247.5,432.1 L242.5,431.0 L245.9,428.0 L245.1,415.9 L239.6,408.3 L244.3,400.4 L226.0,392.7 L225.6,376.4 L214.8,378.5 L207.8,386.4 L150.6,379.5 L124.2,381.4 L119.3,369.2 L101.9,351.8 L102.8,339.2 L97.5,327.5 L98.4,320.7 L104.4,318.4 L100.0,302.9 L139.7,205.1 L153.8,198.1 L170.5,181.7 L193.3,184.3 L206.9,174.5 L219.8,172.0 L252.4,180.5 L269.5,174.7 L278.2,178.6 L293.4,168.0 L301.4,172.1 L313.8,166.4 L330.5,172.3 Z M735.5,215.0 L734.4,210.6 L738.5,213.0 L735.5,215.0 Z M744.9,101.1 L737.0,91.3 L744.9,101.1 Z",river:"M116.2,310.5 L76.1,287.4 L78.4,273.4 L64.5,256.5 L65.5,244.7 L58.2,224.3 L60.8,214.5 L50.9,201.8 L33.8,202.5 L17.4,182.6 L13.3,194.2 L0.0,201.3 M276.0,637.6 L268.0,633.3 L276.0,614.2 M276.0,552.7 L259.3,542.7 L250.3,521.3 L255.8,507.1 L270.6,505.3 L276.0,496.3 M276.0,487.3 L264.5,478.1 L243.5,471.9 L244.6,460.3 L258.7,452.3 L249.1,431.7 L246.7,400.7 L228.9,393.0 L230.1,378.3 L217.1,376.5 L213.2,357.3 L200.0,356.7 L203.5,342.2 L168.4,333.1 L153.1,314.8 L126.4,320.3 L116.2,310.5 M285.2,655.5 L281.3,639.7 L276.0,637.6 M276.0,614.2 L281.7,615.9 L291.0,605.6 L308.2,608.5 L317.0,604.8 L320.5,592.0 L292.6,557.3 L276.0,552.7 M276.0,496.3 L276.0,487.3 M299.1,695.8 L306.9,679.5 L285.2,655.5 M90.7,35.8 L80.9,41.3 L60.5,29.1 L52.8,5.5 L40.1,10.5 L33.2,0.0 M276.0,302.8 L267.4,302.8 L262.8,295.4 L255.0,297.9 L246.2,293.9 L237.7,278.9 L220.5,269.1 L207.7,254.0 L194.3,230.2 L196.2,222.8 L187.1,222.4 L180.6,213.9 L155.0,210.9 L141.1,203.2 L128.5,210.3 L113.9,208.5 L93.2,195.3 L60.6,215.2 M276.0,11.6 L259.8,38.1 L233.1,48.1 L176.1,109.2 L139.4,94.4 L123.3,98.0 L91.6,118.4 L73.4,150.6 L75.7,176.7 L61.9,182.8 L50.2,201.5 M96.5,0.0 L90.3,9.1 L96.0,17.3 L90.8,35.9 M472.9,0.0 L471.9,1.5 L465.8,0.0 M456.3,0.0 L445.2,8.8 L458.0,44.8 L474.5,72.9 L472.1,79.0 L456.3,87.0 L440.1,117.2 L432.8,143.3 L438.9,150.8 L434.6,179.1 L443.5,184.1 L445.7,177.1 L458.3,188.5 L481.3,196.9 L483.5,207.7 L491.0,210.9 L490.6,225.5 L503.8,236.2 L506.4,248.4 L535.0,259.8 L529.4,265.9 L540.3,267.7 L541.9,276.2 L555.8,279.5 L561.9,291.6 L578.3,304.8 L594.9,301.0 L595.9,287.1 L613.7,301.5 L621.0,300.9 M341.3,310.5 L327.0,301.6 L319.2,289.8 L308.3,287.3 L300.9,292.7 L287.1,285.8 L276.0,302.8 M277.1,10.5 L276.0,11.6 M621.0,300.9 L627.1,296.8 L642.3,301.1 L651.6,295.1 L662.9,302.5 L665.5,310.5 M685.0,310.5 L715.0,299.8 L733.5,283.7 M354.6,314.0 L350.7,322.9 L341.3,310.5 M665.5,310.5 L678.5,316.3 L685.0,310.5 M232.5,700.4 L220.2,699.9 L218.4,700.4 M190.9,700.4 L185.9,697.5 L182.9,685.5 L171.3,684.0 L159.0,699.8 L158.2,700.4 M251.9,75.9 L251.9,83.4 L240.6,99.0 L225.6,96.7 L216.5,100.3 L191.1,136.7 L190.4,152.4 L176.1,181.2 L147.2,203.5 M146.7,8.5 L146.8,26.8 L131.3,26.7 L126.8,38.9 L109.3,33.8 L92.2,36.1 M523.1,540.0 L542.4,539.0 L559.5,562.4 L574.2,564.0 L606.0,555.8 L621.0,560.0 M621.0,560.0 L652.8,566.4 L681.6,562.4",coast:"M715.9,0.0 L718.2,3.3 L724.4,1.7 L724.1,45.7 L722.5,50.7 L712.4,49.6 L710.3,40.3 L713.6,35.8 L719.0,37.2 L719.2,32.5 L715.7,36.0 L709.4,29.9 L708.3,6.3 L702.8,5.5 L701.8,0.0 M701.4,0.0 L700.8,1.8 L696.8,23.6 L701.7,35.1 L697.6,37.7 L709.7,44.9 L702.4,46.1 L697.0,53.8 L703.6,76.2 L701.1,90.0 L712.4,107.7 L725.8,114.1 L718.3,122.2 L721.8,127.9 L715.7,127.1 L716.9,118.7 L702.9,104.2 L705.9,112.4 L701.6,112.1 L716.3,119.9 L710.3,121.6 L708.5,130.0 L721.6,134.7 L724.5,128.7 L724.4,145.5 L736.7,150.4 L731.5,153.2 L730.4,167.6 L724.5,170.9 L711.7,163.3 L722.9,152.7 L707.0,140.2 L701.8,142.8 L698.5,156.4 L705.1,162.7 L697.3,174.5 L707.1,176.8 L713.7,187.5 L706.2,186.0 L712.1,190.5 L715.9,184.7 L724.1,184.6 L726.1,195.5 L721.2,196.4 L721.6,204.6 L719.7,201.0 L720.9,208.8 L715.0,202.0 L714.3,209.9 L707.7,210.7 L713.4,212.5 L713.4,223.4 L720.2,229.6 L721.9,204.8 L732.7,222.2 L724.1,236.0 L729.0,245.8 L724.4,261.9 L738.1,283.2 L734.0,279.9 L730.7,284.9 L739.0,284.6 L753.7,310.5 L780.1,341.3 L779.0,359.7 L767.5,363.4 L773.5,356.2 L770.8,352.3 L746.5,373.2 L755.4,403.4 L762.7,414.1 L766.9,413.1 L768.9,423.8 L779.4,425.7 L782.2,432.1 L772.9,435.0 L772.2,461.9 L757.1,439.6 L764.0,436.1 L759.7,419.8 L758.7,425.4 L749.9,424.4 L748.6,434.6 L743.8,427.7 L739.2,431.1 L736.1,427.5 L753.7,410.6 L742.9,380.2 L736.1,382.7 L734.1,391.9 L724.5,395.8 L711.6,414.2 L703.4,414.6 L697.0,421.8 L697.6,430.7 L688.7,438.2 L693.6,443.0 L689.0,457.7 L695.0,462.9 L694.4,469.8 L703.2,451.2 L707.7,455.7 L702.2,466.3 L705.1,479.8 L724.9,491.3 L722.9,508.9 L741.0,517.5 L736.0,527.7 L728.9,522.4 L721.6,536.6 L712.3,530.7 L704.5,514.3 L679.6,494.1 L678.2,498.7 L672.9,497.7 L679.2,506.3 L670.6,504.0 L679.9,516.8 L691.3,518.9 L692.2,539.6 L706.5,550.9 L693.3,557.2 L693.1,564.5 L685.8,563.8 L692.2,565.8 L696.7,586.8 L682.7,584.5 L695.0,592.0 L690.7,598.3 L699.9,604.0 L690.1,616.4 L690.1,626.2 L701.3,652.9 L720.6,671.9 L712.0,681.7 L719.7,698.3 L717.1,700.4 M704.8,700.4 L703.2,697.6 L692.4,697.2 L697.1,677.3 L692.4,673.0 L696.8,669.6 L693.7,661.7 L687.5,677.1 L674.5,689.9 L667.1,685.4 L661.3,700.4 M686.4,700.4 L688.6,698.8 L687.9,700.4"};
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
function referenceOverlay(){
 const svg=$("di-reference");if(!svg)return;
 const cities=[["Buôn Ma Thuột",108.04,12.667],["Buôn Hồ",108.266,12.92],["Krông Pắc",108.34,12.74],["Tuy Hòa",109.321,13.087],["Sông Hinh",108.9,12.85]];
 const X=x=>(x-107.2)*345,Y=y=>(13.9-y)*345;
 const gridLines=[];
 for(let lon=107.5;lon<=109.5;lon+=.5){const x=X(lon);gridLines.push('<line x1="'+x+'" y1="0" x2="'+x+'" y2="707"/>');}
 for(let lat=12;lat<=13.5;lat+=.5){const y=Y(lat);gridLines.push('<line x1="0" y1="'+y+'" x2="862" y2="'+y+'"/>');}
 const labels=cities.map(([name,lon,lat])=>'<g transform="translate('+X(lon)+' '+Y(lat)+')"><circle r="3.2"/><text x="8" y="-8">'+name+'</text></g>').join("");
 svg.innerHTML='<g class="di-ref-grid">'+gridLines.join("")+'</g><g class="di-ref-coast"><path d="'+GEOREF.coast+'"/></g><g class="di-ref-hydro"><path d="'+GEOREF.river+'"/></g><path class="di-ref-border" d="'+GEOREF.boundary+'"/><g class="di-ref-labels">'+labels+'</g>';
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
 '<div class="di-geogrid"><div class="di-mapzone"><canvas id="di-map" width="750" height="615" role="img" aria-label="CHIRPS rainfall anomaly grid"></canvas><svg id="di-reference" class="di-reference" viewBox="0 0 862.5 707.25" preserveAspectRatio="none" aria-hidden="true"></svg><span class="di-mapcorner">CHIRPS v3 · 0.05° / 2025</span></div><aside class="di-geoside"><div class="di-tag">'+k("verified")+'</div><h3 id="di-rain-flag">'+k("signal")+'</h3><p id="di-trigger">—</p><div class="di-line"></div><span>'+k("grid")+'</span><strong id="di-point">—</strong><div class="di-numbers"><div><small>'+k("rain")+'</small><b id="di-observed">—</b></div><div><small>'+k("normal")+'</small><b id="di-normal">—</b></div><div><small>'+k("delta")+'</small><b id="di-anomaly">—</b></div></div><div class="di-line"></div><span>'+k("screen")+' · <b id="di-rankcount">—</b></span><div id="di-list" class="di-sitelist"></div></aside></div>'+
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
 markup();referenceOverlay();
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
 document.addEventListener("cwi-language-changed",()=>{S.lang=lang();nav.textContent=t("nav");markup();referenceOverlay();render()});
 window.addEventListener("resize",()=>{if(S.open)frontierDraw(finance())});
 window.addEventListener("keydown",e=>{if(S.open&&e.key==="Escape"){close();document.getElementById("nav-overview")?.click()}});
 function close(){S.open=false;document.body.classList.remove("di-open");nav.classList.remove("active");nav.setAttribute("aria-expanded","false")}
 S.lang=lang();render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.CWI_DECISION={getCase:dossier,getState:()=>({open:S.open,verified:S.verified,selected:S.selected,month:S.month,lo:S.lo,hi:S.hi,shock:S.shock}),calcBounds:v=>{const old=scenario;return finance()}};
})();