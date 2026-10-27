'use strict';
const {chromium}=require('playwright');
const fs=require('fs');
const widths=[320,375,390,480,768,1024,1440,1920,2560];
const results=[],findings=[],screens=[];
const base='http://127.0.0.1:8765/';
function log(group,name,result,details=''){
 const r={group,name,result,details:String(details).slice(0,600)};
 results.push(r);console.log('ACCEPTANCE',JSON.stringify(r));
 if(result==='FAIL')findings.push(r);
}
async function check(group,name,fn){
 try{const detail=await fn();log(group,name,'PASS',typeof detail==='string'?detail:JSON.stringify(detail??''));return true}
 catch(e){log(group,name,'FAIL',e.message);return false}
}
async function note(group,name,fn){try{let v=await fn();log(group,name,'UNVERIFIED',v??'External service not conclusively tested')}catch(e){log(group,name,'UNVERIFIED',e.message)}}
async function click(page,selector,{domFallback=false}={}){
 const loc=page.locator(selector).first();
 if(await loc.isVisible())return await loc.click({timeout:9000});
 if(!domFallback)throw Error('Control not visible: '+selector);
 return await loc.evaluate(el=>el.click());
}
async function getFile(page,selector,limit=12000){
 const download=page.waitForEvent('download',{timeout:limit});
 await click(page,selector,{domFallback:true});
 const d=await download;const location=await d.path();return {name:d.suggestedFilename(),content:fs.readFileSync(location,'utf8')};
}
function nonempty(f){if(!f||f.content.length<10)throw Error('Empty export');return {name:f.name,bytes:f.content.length}}
async function setup(browser,width=1440,theme='light'){
 const ctx=await browser.newContext({viewport:{width,height:900},acceptDownloads:true,locale:'vi-VN',deviceScaleFactor:1});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/Uncaught|TypeError|ReferenceError|SyntaxError/i.test(m.text()))errors.push(m.text())});
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.evaluate(t=>{document.documentElement.dataset.theme=t},theme);
 return {page,ctx,errors}
}
async function main(){
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 try {
  const {page,ctx,errors}=await setup(browser);
  await check('startup','Required systems initialized',async()=>{
   await page.waitForFunction(()=>!!(window.CWI_POLICY&&window.CWI_RASTER&&window.CWI_DECISION&&window.CWI_I18N),{timeout:25000});
   return {policy:!!window.CWI_POLICY,raster:!!window.CWI_RASTER,decision:!!window.CWI_DECISION}
  });
  await check('core','Policy arithmetic edge cases',async()=>{
   const a=await page.evaluate(()=>{
    const v=window.CWI_POLICY.getScenarios()[0],calc=window.CWI_POLICY.calculate,zero=calc({...v,discount:0}),
     ff=calc({...v,fee:0}),zeroCost=calc({...v,cost:0,fixed:0,capex:0,discount:0}),
     bad=(()=>{try{calc({...v,uptake:200});return false}catch{return true}})();
    return {zero:zero.npv,expected:-v.capex+(v.N*v.fee*v.uptake/100-v.N*v.cost-v.fixed)*v.years,feeZeroThreshold:ff.breakEvenNpv,zeroCost:zeroCost.npv,bad}
   });
   if(Math.abs(a.zero-a.expected)>0.01||a.feeZeroThreshold!==null||!a.bad||!Number.isFinite(a.zeroCost))throw Error(JSON.stringify(a));
   return a;
  });
  await check('core','Navigation one-active and route transitions',async()=>{
   const out=[];
   for(const [id,expected] of [['nav-economics','nav-economics'],['nav-policy','nav-policy'],['nav-integrated','nav-integrated'],['nav-overview','nav-overview']]){
    await click(page,'#'+id,{domFallback:true});
    const x=await page.evaluate(()=>({active:[...document.querySelectorAll('.global-tabs .gtab.active')].map(e=>e.id),decision:document.body.classList.contains('di-open'),policy:document.body.classList.contains('policy-full')}));
    out.push({id,...x});if(x.active.length!==1||x.active[0]!==expected)throw Error(JSON.stringify(out));
    if(id==='nav-integrated'&&!x.decision)throw Error('Decision not open');
    if(id==='nav-overview'&&(x.decision||x.policy))throw Error('Overview retained hidden overlays');
   }
   return out;
  });
  await check('core','Language switch VI-EN-VI',async()=>{
   await click(page,'#lang-en',{domFallback:true});
   let en=await page.evaluate(()=>window.CWI_I18N.getLanguage());
   await click(page,'#nav-integrated',{domFallback:true});
   const enTitle=await page.locator('#di-root h1').innerText();
   await click(page,'#lang-vi',{domFallback:true});
   let vi=await page.evaluate(()=>window.CWI_I18N.getLanguage());
   const viTitle=await page.locator('#di-root h1').innerText();
   if(en!=='en'||vi!=='vi'||enTitle===viTitle)throw Error(JSON.stringify({en,vi,enTitle,viTitle}));
   return {enTitle,viTitle};
  });
  await check('decision','Audited CHIRPS loads successfully',async()=>{
   await page.waitForFunction(()=>window.CWI_DECISION?.getState().verified||document.querySelector('#di-status')?.dataset.state==='error',{timeout:50000});
   const v=await page.evaluate(()=>({state:window.CWI_DECISION.getState(),dataset:window.CWI_DECISION.getCase().climate.dataset}));
   if(!v.state.verified||v.dataset!=='CHIRPS v3 monthly final')throw Error(JSON.stringify(v));
   return v;
  });
  await check('decision','Decision inputs change scenario and clear stale field checks',async()=>{
   await page.locator('#di-field').check();
   await page.locator('#di-survey').check();
   await page.locator('#di-month').selectOption('11');
   const checks=await page.evaluate(()=>[document.querySelector('#di-field').checked,document.querySelector('#di-survey').checked]);
   await page.locator('#di-span').selectOption('3');
   await page.locator('#di-low').fill('15');
   await page.locator('#di-high').fill('65');
   await page.locator('#di-shock').fill('30');
   const d=await page.evaluate(()=>window.CWI_DECISION.getCase());
   if(checks.some(Boolean)||d.scenario?.bounds?.uptakeMin!==15||d.scenario.bounds.uptakeMax!==65||d.scenario.bounds.costStressPct!==30)throw Error(JSON.stringify({checks,d:d.scenario?.bounds}));
   return {checks,bounds:d.scenario.bounds};
  });
  await check('decision','Climate cell selection and screen rule',async()=>{
   await page.locator('#di-map').click({position:{x:100,y:110}});
   const one=await page.evaluate(()=>window.CWI_DECISION.getState());
   await page.locator('#di-span').selectOption('4');
   const report=await page.evaluate(()=>window.CWI_DECISION.getCase());
   if(one.selected==null||report.climate.rule.months!==4||!Number.isFinite(report.climate.selected?.r))throw Error(JSON.stringify({one,rule:report.climate.rule}));
   return {selected:one.selected,rule:report.climate.rule};
  });
  await check('decision','Export decision JSON and selected-cell CSV',async()=>{
   const json=await getFile(page,'#di-export'),csv=await getFile(page,'#di-rainexport');
   const parsed=JSON.parse(json.content);
   if(!json.name.endsWith('.json')||parsed.schema!=='CWI-DecisionCase-v1'||parsed.scenario?.source!=='CWI_POLICY.calculate')throw Error('Invalid decision JSON');
   if(!csv.name.endsWith('.csv')||csv.content.trim().split('\n').length<10||!csv.content.includes('observed_mm'))throw Error('Invalid rainfall CSV');
   return {json:nonempty(json),csv:nonempty(csv),csvRows:csv.content.split('\n').length};
  });
  await check('decision','Sensitivity bounds and no causal pixel inference',async()=>{
   const d=await page.evaluate(()=>window.CWI_DECISION.getCase());
   if(!(d.scenario.npvWorst<=d.scenario.npvBest)||!d.interpretation.toLowerCase().includes('no rainfall-to-household causal model'))throw Error(JSON.stringify(d.scenario));
   return {worst:d.scenario.npvWorst,best:d.scenario.npvBest};
  });
  await check('decision','Open Policy Studio from Decision Intelligence',async()=>{
   await click(page,'#di-openpolicy');
   const d=await page.evaluate(()=>({isDecision:document.body.classList.contains('di-open'),isPolicy:document.body.classList.contains('policy-full'),active:[...document.querySelectorAll('.global-tabs .gtab.active')].map(e=>e.id)}));
   if(d.isDecision||!d.isPolicy||d.active.join(',')!=='nav-policy')throw Error(JSON.stringify(d));return d;
  });
  await check('policy','Download Policy CSV and JSON',async()=>{
   const csv=await getFile(page,'#pstudio-export'),json=await getFile(page,'#pstudio-save-json'),packet=JSON.parse(json.content);
   if(!csv.content.includes('NPV')||csv.content.split('\n').length<4)throw Error('Policy CSV malformed');
   if(packet.parameters?.length!==3||packet.results?.length!==3)throw Error('Policy JSON malformed');
   return {csv:nonempty(csv),json:nonempty(json)};
  });
  await check('policy','Re-import valid scenarios',async()=>{
   const j=await getFile(page,'#pstudio-save-json');
   await page.locator('#pstudio-import-file').setInputFiles({name:'cwi-scenarios.json',mimeType:'application/json',buffer:Buffer.from(j.content)});
   await page.waitForTimeout(300);
   const msg=await page.locator('#pstudio-file-status').innerText();
   if(/lỗi|không hợp lệ|invalid|error/i.test(msg)||!msg.trim())throw Error(msg);
   return msg;
  });
  await check('policy','Reject malformed imported JSON',async()=>{
   await page.locator('#pstudio-import-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{"parameters":[{"fee":1}]}')});
   await page.waitForTimeout(250);
   const status=await page.locator('#pstudio-file-status').innerText();
   if(!status.trim())throw Error('Missing import error message');return status;
  });
  await check('policy','PDF report opens as a separate document',async()=>{
   const popup=page.waitForEvent('popup',{timeout:10000});
   await click(page,'#pstudio-report',{domFallback:true});
   const win=await popup;
   await win.waitForLoadState('domcontentloaded');
   const content=await win.locator('body').innerText();
   if(content.length<100||!/NPV|Coffee Water/i.test(content))throw Error('Empty PDF-ready report');
   await win.close();return {chars:content.length};
  });
  await check('policy','Switch scenarios and use fullscreen exit',async()=>{
   await page.locator('#pstudio-switcher button[data-case="1"]').click();
   const active=await page.evaluate(()=>window.CWI_POLICY.getScenarios()[1].name);
   await click(page,'#pstudio-exit',{domFallback:true});
   const policy=await page.evaluate(()=>document.body.classList.contains('policy-full'));
   if(policy)throw Error('Policy fullscreen not exited');return {selected:active,policy};
  });
  await check('raster','CHIRPS default raster initialized',async()=>{
   await page.waitForFunction(()=>!!window.CWI_RASTER?.data?.(),{timeout:35000});
   const g=await page.evaluate(()=>({dataset:window.CWI_RASTER.data()?.dataset,periods:window.CWI_RASTER.data()?.periods?.length}));
   if(g.periods<12)throw Error(JSON.stringify(g));return g;
  });
  await check('raster','Export CHIRPS raster CSV and audit JSON',async()=>{
   await click(page,'.bottom-tab[data-tab="raster"]',{domFallback:true});
   const csv=await getFile(page,'#raster-export'),audit=await getFile(page,'#raster-audit-export');
   const j=JSON.parse(audit.content);
   if(!csv.content.includes('longitude,latitude,value')||csv.content.split('\n').length<80)throw Error('Raster CSV unexpectedly empty');
   if(!j||typeof j!=='object')throw Error('Audit invalid JSON');return {csv:nonempty(csv),audit:nonempty(audit)};
  });
  await check('map','Main map layers and controls respond',async()=>{
   await click(page,'#nav-overview',{domFallback:true});
   const before=await page.locator('#geo-map').getAttribute('data-basemap-mode');
   await click(page,'#terrain-toolbar',{domFallback:true});
   const terrain=await page.locator('#geo-map').getAttribute('data-basemap-mode');
   await click(page,'#dark-toolbar',{domFallback:true});
   const dark=await page.locator('#geo-map').getAttribute('data-basemap-mode');
   await click(page,'#satellite-toolbar',{domFallback:true});
   const satellite=await page.locator('#geo-map').getAttribute('data-basemap-mode');
   for(const id of ['#zoom-in','#zoom-out','#reset-view','#layer-boundary','#layer-rivers','#layer-grid']){
    const l=page.locator(id);if(await l.count()){if(await l.evaluate(e=>e.type==='checkbox')){await l.evaluate(e=>e.click())}else await click(page,id,{domFallback:true})}
   }
   if(terrain!=='terrain'||dark!=='dark'||satellite!=='satellite')throw Error(JSON.stringify({before,terrain,dark,satellite}));
   return {before,terrain,dark,satellite};
  });
  await note('external','NASA POWER live data and CSV export need independent provider validation',async()=> 'A live NASA API request requires network and provider availability; not counted as passing');
  await note('external','Dark/imagery tiles depend on provider and must not be used as deterministic reliability pass',async()=> 'Map-mode changes were tested; provider content may be unavailable');
  await check('external','Open and close official CHIRPS source viewer panel',async()=>{
   await click(page,'#nav-official-chirps',{domFallback:true});
   const open=await page.locator('#official-chirps-panel').evaluate(x=>!x.hidden);
   if(!open)throw Error('Source panel not open');
   await click(page,'#close-chirps-panel',{domFallback:true});
   if(await page.locator('#official-chirps-panel').evaluate(x=>!x.hidden))throw Error('Panel did not close');
   return {opened:open,closed:true};
  });
  await check('external','Export manually entered CHIRPS source notes',async()=>{
   await click(page,'#nav-official-chirps',{domFallback:true});
   await page.locator('#oc-record-notes').fill('QA test note — not a verified measurement');
   await click(page,'#oc-add-record',{domFallback:true});
   const data=await getFile(page,'#oc-export-record');
   const obj=JSON.parse(data.content);
   if(obj.observations?.length<1||obj.notes_status!=='MANUAL_NOTES_ONLY')throw Error('Source notes missing or misrepresented');
   await click(page,'#close-chirps-panel',{domFallback:true});
   return {file:nonempty(data),count:obj.observations.length};
  });
  log('runtime','Desktop page errors',errors.length?'FAIL':'PASS',errors.slice(0,10).join(';'));
  await ctx.close();
  for(const theme of ['light','dark']){
   for(const width of widths){
    const o=await setup(browser,width,theme),p=o.page;
    await check('responsive',theme+' '+width+'px: root and navigation',async()=>{
     if(!await p.locator('.global-tabs').count())throw Error('Missing navigation');
     if(!await p.locator('#nav-integrated').count())throw Error('Missing integrated tab');
     await click(p,'#nav-integrated',{domFallback:true});
     await p.waitForFunction(()=>window.CWI_DECISION?.getState().verified||document.querySelector('#di-status')?.dataset.state==='error',{timeout:40000});
     const d=await p.evaluate(()=>{
       const metric=document.querySelector('.di-numbers>div'),a=metric.querySelector('small').getBoundingClientRect(),b=metric.querySelector('b').getBoundingClientRect();
       const right=document.querySelector('#di-root .di-wrap').getBoundingClientRect().right;
       const viewport=window.innerWidth;
       const tabs=[...document.querySelectorAll('.global-tabs .gtab.active')].map(x=>x.id);
       return {gap:b.top-a.bottom,viewport,right,active:tabs,verified:window.CWI_DECISION.getState().verified,documentWidth:document.documentElement.scrollWidth};
     });
     if(d.gap<0||!d.verified||d.active.length!==1||d.active[0]!=='nav-integrated')throw Error(JSON.stringify(d));
     await p.screenshot({path:'qa-accept-'+theme+'-'+width+'.png'});
     screens.push('qa-accept-'+theme+'-'+width+'.png');return d;
    });
    if(o.errors.length)log('responsive',theme+' '+width+'px runtime errors','FAIL',o.errors.join(';'));
    await o.ctx.close();
   }
  }
 }finally{await browser.close()}
 const by={};for(const x of results)by[x.result]=(by[x.result]||0)+1;
 const report={createdAt:new Date().toISOString(),outcomes:by,results};
 fs.writeFileSync('cwi-acceptance-results.json',JSON.stringify(report,null,2));
 console.log('ACCEPTANCE_SUMMARY',JSON.stringify(by));
 if(findings.length){console.error('ACCEPTANCE_FAILURES',JSON.stringify(findings));process.exitCode=1}
}
main().catch(e=>{console.error('ACCEPTANCE_FATAL',e.stack||e);process.exitCode=1});
