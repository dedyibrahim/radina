import {chromium} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const keys=JSON.parse(await readFile('config/additional-template-demos.json','utf8')).map(d=>d.key)
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'}),errors=[]
page.on('pageerror',e=>errors.push(e.message))
try{
 for(const key of keys){
  const pattern=`**/api/templates/${key}/preview`
  await page.route(pattern,async route=>{
   const response=await route.fetch(),body=await response.json()
   body.data.settings.enable_video=true;body.data.settings.enable_livestream=true
   body.data.video_url='/video/our-story.mp4';body.data.livestream={url:'https://www.youtube.com/'}
   await route.fulfill({response,json:body})
  })
  await page.goto(`http://127.0.0.1:5173/templates/${key}/preview`,{waitUntil:'domcontentloaded'})
  await page.getByRole('button',{name:'Buka Undangan',exact:true}).click()
  await page.locator('#video').waitFor();await page.locator('#livestream').waitFor()
  await page.getByRole('button',{name:'Muat video cerita cinta'}).click()
  assert.equal(await page.locator('#video video').evaluate(el=>el.autoplay),false)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  await page.unroute(pattern)
 }
 assert.deepEqual(errors,[])
 console.log('PASS: all ten new templates display CMS-enabled video/livestream without autoplay or overflow')
}finally{await browser.close()}
