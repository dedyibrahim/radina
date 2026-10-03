import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
const keys=['romantic-floral','elegant-luxury','minimalist-white','nusantara-heritage','garden-dream','classic-vintage','midnight-romance','sakinah','eternal-story','blush','celestial','editorial','ocean-vows','royal-heritage','paper-petals','botanica','monochrome','blossom-east','neon-love','timeless-romance']
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({reducedMotion:'reduce'}),errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('[Vue warn]'))errors.push(m.text())})
try{
for(const key of keys){for(const width of [320,1440]){await page.setViewportSize({width,height:844});await page.goto(`http://127.0.0.1:5173/templates/${key}/preview`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Buka Undangan',exact:true}).click();await page.locator('#gallery').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${key} overflow`);await page.locator('#gallery .gallery-item, #gallery .collection-gallery button').first().click();await page.getByRole('dialog').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'lightbox overflow');await page.getByRole('button',{name:'Tutup dialog'}).click()}}
await page.route('**/api/templates/eternal-story/preview',async route=>{const response=await route.fetch(),body=await response.json();body.data.section_content.story.enabled=false;body.data.section_content.couple.heading='The couple remains available';await route.fulfill({response,json:body})})
await page.goto('http://127.0.0.1:5173/templates/eternal-story/preview',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Buka Undangan',exact:true}).click();await page.locator('#couple h2').filter({hasText:'The couple remains available'}).waitFor();assert.equal(await page.locator('#story').count(),0)
await page.route('**/api/templates/romantic-floral/preview',async route=>{const response=await route.fetch(),body=await response.json();body.data.section_content.opening={enabled:false};await route.fulfill({response,json:body})})
await page.goto('http://127.0.0.1:5173/templates/romantic-floral/preview',{waitUntil:'networkidle'});await page.locator('#home').waitFor();assert.equal(await page.locator('.design-cover').count(),0)
assert.deepEqual(errors,[]);console.log('40 final template/lightbox views, disabled-story couple fallback, optional opening: PASS')
}finally{await browser.close()}
