import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
const keys=['romantic-floral','elegant-luxury','minimalist-white','nusantara-heritage','garden-dream','classic-vintage','midnight-romance','sakinah','eternal-story','blush','celestial','editorial','ocean-vows','royal-heritage','paper-petals','botanica','monochrome','blossom-east','neon-love','timeless-romance']
const sizes=[[320,568],[360,800],[375,812],[390,844],[414,896],[430,932],[768,1024],[1024,768],[1280,720],[1440,900]]
await mkdir('test-results/experiences',{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({reducedMotion:'reduce'})
const page=await context.newPage(),errors=[],report=[]
page.on('pageerror',e=>errors.push(e.message))
page.on('console',m=>{if(m.text().includes('[Vue warn]'))errors.push(m.text())})
await page.addInitScript(()=>{const Original=window.Audio;window.__audioCount=0;window.Audio=function(...args){window.__audioCount++;window.__audio=new Original(...args);return window.__audio}})
try{
for(const key of keys){
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height})
  await page.goto(`http://127.0.0.1:5173/templates/${key}/preview?to=${encodeURIComponent('Keluarga Besar Dedy Ibrahim dan Saudara Saudari yang Terkasih')}`,{waitUntil:'networkidle'})
  await page.getByRole('button',{name:'Buka Undangan',exact:true}).click()
  await page.locator('#home').waitFor()
  await page.waitForTimeout(100)
  const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,order:[...document.querySelectorAll('.section-frame')].map(el=>el.dataset.section),images:[...document.querySelectorAll('img')].filter(img=>img.complete && !img.naturalWidth).map(img=>img.src)}))
  assert(dimensions.scroll<=width,`${key} ${width} overflow ${dimensions.scroll}`)
  assert.equal(dimensions.images.length,0,`${key} broken images ${dimensions.images}`)
  for(const id of ['couple','event','gallery','gift']){
   await page.locator('.floating-nav').getByRole('button',{name:id==='event'?'Event':id==='couple'?'Couple':id==='gallery'?'Gallery':'Gift',exact:true}).click()
   assert(await page.locator(`#${id}`).count(),`${id} absent`)
   assert.equal(await page.locator('.design-cover').count(),0,'cover remounted')
  }
  assert.equal(new URL(page.url()).searchParams.get('to'),'Keluarga Besar Dedy Ibrahim dan Saudara Saudari yang Terkasih')
  const audio=await page.evaluate(()=>window.__audioCount)
  assert(audio<=1,`${key} audio remounted`)
  if(width===390){await page.locator('#home').scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/experiences/${key}.png`});}
  report.push({key,width,height,order:dimensions.order,audio})
 }
 console.log(`${key}: 10 viewports passed`)
}
assert.deepEqual(errors,[])
assert(new Set(report.map(r=>r.order.join(','))).size>=7,'section arrangements must differ')
await writeFile('test-results/experiences/report.json',JSON.stringify({checks:report,errors},null,2))
console.log('200 responsive views, semantic navigation, image integrity, persistent audio: PASS')
}finally{await browser.close()}
