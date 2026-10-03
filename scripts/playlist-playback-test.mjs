import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import {writeFile} from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true})
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[]
page.on('pageerror',e=>errors.push(e.message))
await page.addInitScript(()=>{const Original=window.Audio;window.__audioCount=0;window.Audio=function(...args){window.__audioCount++;window.__audio=new Original(...args);return window.__audio}})
try{
let data
await page.route('**/api/templates/romantic-floral/preview',async route=>{const response=await route.fetch();const body=await response.json();data=body.data;body.data.music.shuffle=false;body.data.music.repeat=true;await route.fulfill({response,json:body})})
await page.goto('http://127.0.0.1:5173/templates/romantic-floral/preview',{waitUntil:'networkidle'})
await page.getByRole('button',{name:'Buka Undangan',exact:true}).click();await page.waitForFunction(()=>window.__audio && !window.__audio.paused)
assert(data.music.playlist.length>=2)
await page.getByRole('button',{name:'Detail playlist'}).click();await page.getByRole('button',{name:'Lagu berikutnya'}).click();await page.waitForFunction(url=>window.__audio.getAttribute('src')===url,data.music.playlist[1].url)
await page.getByRole('button',{name:'Lagu sebelumnya'}).click();await page.waitForFunction(url=>window.__audio.getAttribute('src')===url,data.music.playlist[0].url)
await page.evaluate(()=>window.__audio.dispatchEvent(new Event('ended')));await page.waitForFunction(url=>window.__audio.getAttribute('src')===url,data.music.playlist[1].url)
await page.evaluate(()=>window.__audio.dispatchEvent(new Event('ended')));await page.waitForFunction(url=>window.__audio.getAttribute('src')===url,data.music.playlist[0].url)
assert.equal(await page.evaluate(()=>window.__audioCount),1)
await page.unroute('**/api/templates/romantic-floral/preview')
await page.route('**/api/templates/romantic-floral/preview',async route=>{const response=await route.fetch();const body=await response.json();body.data.music.playlist=body.data.music.playlist.slice(0,1);body.data.music.shuffle=true;body.data.music.repeat=false;await route.fulfill({response,json:body})})
await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Buka Undangan',exact:true}).click();await page.waitForFunction(()=>window.__audio && !window.__audio.paused);await page.evaluate(()=>window.__audio.dispatchEvent(new Event('ended')));assert(await page.evaluate(()=>window.__audio.paused),'one-track shuffled non-repeat playlist must stop')
assert.deepEqual(errors,[])
await writeFile('test-results/experiences/playlist-report.json',JSON.stringify({next:true,previous:true,automaticAdvance:true,repeat:true,oneTrackShuffleNoRepeat:true,singleAudioElement:true,errors},null,2))
console.log('Next, previous, auto advance, repeat and single-track shuffle/no-repeat: PASS')
}finally{await browser.close()}
