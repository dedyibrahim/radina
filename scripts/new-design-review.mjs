import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
const demos=JSON.parse(await readFile('config/additional-template-demos.json','utf8')).filter(d=>!process.env.REVIEW_KEYS || process.env.REVIEW_KEYS.split(',').includes(d.key))
const browser=await chromium.launch({channel:'chrome',headless:true})
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],report=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('[Vue warn]'))errors.push(m.text())})
await mkdir('test-results/collection',{recursive:true})
try{
 for(const demo of demos){
  for(const width of [320,390,1024,1440]){
   await page.setViewportSize({width,height:844})
   await page.goto(`http://127.0.0.1:5173/templates/${demo.key}/preview?to=${encodeURIComponent('Keluarga Besar Dedy Ibrahim beserta seluruh saudara dan sahabat yang kami kasihi')}`,{waitUntil:'networkidle'})
   await page.getByRole('button',{name:'Buka Undangan',exact:true}).click()
   await page.locator('#home').waitFor()
   for(const section of ['couple','story','event','gallery','gift','closing']){
    await page.locator(`#${section}`).scrollIntoViewIfNeeded()
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${demo.key} ${section} ${width} overflow`)
   }
   const state=await page.evaluate(()=>{
    const signature=el=>el ? `${el.tagName}(${[...el.children].map(signature).join(',')})` : ''
    const nav=document.querySelector('.floating-nav').getBoundingClientRect(),music=document.querySelector('.playlist-buttons').getBoundingClientRect()
    return {signatures:['couple','story','event'].map(id=>signature(document.getElementById(id))),nav:nav.toJSON(),music:music.toJSON(),navVisible:nav.x>=0&&nav.y>=0&&nav.right<=innerWidth&&nav.bottom<=innerHeight,collision:nav.left<music.right&&nav.right>music.left&&nav.top<music.bottom&&nav.bottom>music.top,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}
   })
   assert(state.navVisible,`${demo.key} navigation outside viewport`);assert(!state.collision,`${demo.key} ${width}: player collides with navigation ${JSON.stringify({nav:state.nav,music:state.music})}`);assert.equal(state.broken.length,0)
   report.push({key:demo.key,width,...state})
   if(width===390){for(const section of ['home','couple','event','gallery','gift','closing']){await page.locator(`#${section}`).scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/collection/${demo.key}-${section}.png`})}}
  }
  const pattern=`**/api/templates/${demo.key}/preview`
  await page.route(pattern,async route=>{
   const response=await route.fetch(),body=await response.json()
   body.data.section_content.home={enabled:true,heading:'CMS Hero Title',subheading:'CMS Hero Subtitle',content:'CMS Hero Content'}
   body.data.opening_text='CMS Opening Content'
   body.data.bride.nickname='Alexandra Putri Ramadhani yang Berbahagia'
   body.data.groom.nickname='Muhammad Alexander Pratama yang Berbahagia'
   await route.fulfill({response,json:body})
  })
  await page.setViewportSize({width:320,height:568})
  await page.goto(`http://127.0.0.1:5173/templates/${demo.key}/preview`,{waitUntil:'networkidle'})
  await page.locator('.design-cover').getByText('CMS Opening Content',{exact:true}).waitFor()
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long names overflow opening')
  await page.getByRole('button',{name:'Buka Undangan',exact:true}).click()
  for(const text of ['CMS Hero Title','CMS Hero Subtitle','CMS Hero Content']) await page.locator('#home').getByText(text,{exact:true}).waitFor()
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long names overflow hero')
  await page.unroute(pattern)
  console.log(`${demo.key}: final sections, CMS text, long names, navigation and music placement passed`)
 }
 if(!process.env.REVIEW_KEYS) for(let section=0;section<3;section++) assert(new Set(report.filter(r=>r.width===390).map(r=>r.signatures[section])).size>=8,'New designs need distinct DOM compositions')
 assert.deepEqual(errors,[])
 await writeFile(`test-results/collection/review${process.env.REVIEW_KEYS ? '-'+process.env.REVIEW_KEYS : ''}.json`,JSON.stringify({report,errors},null,2))
 console.log(`PASS: ${report.length} final views, ${demos.length*6} section screenshots, CMS content, distinct structures, navigation/player separation`)
}finally{await browser.close()}
