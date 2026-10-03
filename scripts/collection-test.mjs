import { solveLoginCaptcha } from './support/login-captcha.mjs'
import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const browser=await chromium.launch({channel:'chrome',headless:true})
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[]
page.on('pageerror',e=>errors.push(e.message))
try {
 await page.goto('http://127.0.0.1:5173/templates',{waitUntil:'networkidle'})
 await page.locator('.template-card').first().waitFor()
 const all=[]
 for(let p=1;p<=3;p++){const result=await (await page.request.get(`http://127.0.0.1:8000/api/templates?page=${p}&sort=newest`)).json();all.push(...result.data)}
 assert.equal(new Set(all.map(t=>t.template_key)).size,25)
 for(const card of all){assert(card.music_style.length);assert(card.gallery_style);assert(/\.(webp|svg)$/.test(card.thumbnail))}
 const cat=await (await page.request.get('http://127.0.0.1:8000/api/categories')).json()
 assert.equal(cat.data.length,11)
 const favorite=page.locator('.template-card').first()
 const title=await favorite.locator('h3').innerText()
 await favorite.getByRole('button',{name:`Favorit ${title}`}).click()
 await page.reload({waitUntil:'networkidle'})
 await page.getByRole('button',{name:'♡ Favorit saya',exact:true}).click()
 await page.waitForTimeout(600)
 await page.locator('.template-card').first().waitFor()
 assert.equal(await page.locator('.template-card').count(),1)
 assert.equal(await page.locator('.template-card h3').first().innerText(),title)
 await page.getByRole('button',{name:'♡ Favorit saya',exact:true}).click()
 await page.waitForTimeout(600)
 await page.locator('.template-card').nth(3).waitFor()
 for(let i=0;i<4;i++) await page.locator('.template-card').nth(i).getByRole('button',{name:'+ Bandingkan',exact:true}).click()
 await page.getByRole('status').filter({hasText:'maksimal 3'}).waitFor()
 await page.locator('.comparison-tray').getByRole('button',{name:'Bandingkan',exact:true}).click()
 await page.getByRole('dialog').waitFor()
 assert.equal(await page.locator('.comparison-grid article').count(),3)
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844})
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  const box=await page.getByRole('dialog').boundingBox();assert(box.width<=width && box.height<=844)
 }
 await page.getByRole('button',{name:'Tutup dialog'}).click()
 const env=Object.fromEntries((await readFile('.env','utf8')).split(/\r?\n/).filter(v=>v.includes('=')).map(v=>[v.slice(0,v.indexOf('=')),v.slice(v.indexOf('=')+1)]))
 await page.goto('http://127.0.0.1:5173/admin/login',{waitUntil:'networkidle'})
 await page.getByLabel('Email admin').fill(env.ADMIN_EMAIL.replace(/^"|"$/g,''))
 await page.getByLabel('Kata sandi').fill(env.ADMIN_PASSWORD.replace(/^"|"$/g,''))
 await solveLoginCaptcha(page);
  await page.getByRole('button',{name:'Masuk ke Workspace'}).click()
 await page.waitForURL('**/admin')
 const library=await page.evaluate(async()=> (await fetch('/api/admin/music',{headers:{Accept:'application/json'}})).json())
 assert.equal(library.data.length,6,'The six supplied music tracks must be installed')
 for(const track of library.data.slice(0,3)){const response=await page.request.get(`http://127.0.0.1:8000${track.file_url}`);assert(response.ok())}
 assert.deepEqual(errors,[])
 console.log('PASS: 25 catalog entries, 11 filters, favorites persistence, comparison limit/modal, 6-track supplied music library')
} finally {await browser.close()}
