import { solveLoginCaptcha } from './support/login-captcha.mjs'
import { chromium } from '@playwright/test'
import { readFile,writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const env=Object.fromEntries((await readFile('.env','utf8')).split(/\r?\n/).filter(line=>line.includes('=')).map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1).replace(/^"|"$/g,'')]))
const browser=await chromium.launch({channel:'chrome',headless:true})
const context=await browser.newContext({reducedMotion:'reduce'}), page=await context.newPage(), errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('[Vue warn]'))errors.push(m.text())})
async function req(method,path,body){return page.evaluate(async({method,path,body})=>{const token=document.cookie.split('; ').find(x=>x.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=');const response=await fetch('/api'+path,{method,headers:{Accept:'application/json','Content-Type':'application/json',...(token?{'X-XSRF-TOKEN':decodeURIComponent(token)}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()}},{method,path,body})}
let snapshot,weddingId,trackId
try{
await page.goto('http://127.0.0.1:5173/admin/login',{waitUntil:'networkidle'})
await page.getByLabel('Email admin').fill(env.ADMIN_EMAIL || 'admin@everafter.test');await page.getByLabel('Kata sandi').fill(env.ADMIN_PASSWORD || 'ChangeMe!2026');await solveLoginCaptcha(page);
  await page.getByRole('button',{name:'Masuk ke Workspace'}).click();await page.waitForURL('**/admin')
await page.goto('http://127.0.0.1:5173/admin/music',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Tambah Musik'}).click()
const dialog=page.getByRole('dialog');await dialog.getByLabel('Judul lagu').fill('Radina UI Test Original');await dialog.getByLabel('Artist',{exact:true}).fill('Owned test audio');await dialog.getByLabel('Audio URL').fill('/music/wedding-song.mp3');await dialog.getByLabel('Durasi (detik)').fill('48');await dialog.getByRole('button',{name:'Simpan Musik'}).click();await dialog.waitFor({state:'hidden'})
const library=(await req('GET','/admin/music')).data.data;trackId=library.find(t=>t.title==='Radina UI Test Original').id
const demo=(await req('GET','/templates/romantic-floral/preview')).data.data;weddingId=demo.id;snapshot=(await req('GET',`/admin/weddings/${weddingId}`)).data.data
await page.goto(`http://127.0.0.1:5173/admin/weddings/${weddingId}`,{waitUntil:'networkidle'});await page.locator('.editor-tabs').getByRole('button',{name:'Music',exact:true}).click();await page.getByLabel('Cari lagu',{exact:true}).fill('Radina UI Test Original');await page.locator('.selector-track').getByRole('button',{name:'Pilih',exact:true}).click();await page.getByLabel('Shuffle',{exact:true}).check();await page.getByRole('button',{name:'Simpan',exact:true}).click();await page.getByRole('status').filter({hasText:'Tersimpan'}).waitFor()
let saved=(await req('GET',`/admin/weddings/${weddingId}`)).data.data;assert(saved.music.playlist.some(t=>t.library_id===trackId));assert(saved.music.shuffle)
await page.locator('.editor-tabs').getByRole('button',{name:'Section Manager',exact:true}).click();const event=page.locator('.managed-section').filter({has:page.getByText('Events',{exact:true})});await event.getByLabel('Heading',{exact:true}).fill('A custom celebration heading');await event.getByRole('button',{name:'Naikkan Events'}).click();await page.getByRole('button',{name:'Simpan',exact:true}).click();await page.getByRole('status').filter({hasText:'Tersimpan'}).waitFor();saved=(await req('GET',`/admin/weddings/${weddingId}`)).data.data;assert.equal(saved.section_content.event.heading,'A custom celebration heading');assert(saved.section_order.length>5)
await page.locator('.editor-tabs').getByRole('button',{name:'Preview',exact:true}).click();await page.locator('#event h2').filter({hasText:'A custom celebration heading'}).waitFor()
assert.equal(await page.locator('.design-cover').count(),0)
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`editor overflow ${width}`)}
assert.deepEqual(errors,[])
await writeFile('test-results/experiences/music-cms-report.json',JSON.stringify({musicCrud:true,playlistSave:true,shuffle:true,sectionContent:true,sectionReorder:true,livePreview:true,widths:[320,390,768,1440],errors},null,2))
console.log('Music Library UI, playlist save, section manager, live preview: PASS')
}finally{
if(snapshot){const fresh=(await req('GET',`/admin/weddings/${weddingId}`)).data.data;snapshot.events=snapshot.events.map(e=>({...e,start_time:e.start_time.slice(0,5),end_time:e.end_time.slice(0,5)}));const restored=await req('PUT',`/admin/weddings/${weddingId}`,{...snapshot,expected_updated_at:fresh.updated_at});assert.equal(restored.status,200,'restore demo')}
if(trackId)await req('DELETE',`/admin/music/${trackId}`)
await browser.close()
}
