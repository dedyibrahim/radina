import {chromium} from '@playwright/test'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const env=Object.fromEntries((await readFile('.env','utf8')).split(/\r?\n/).filter(x=>x.includes('=')).map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]))
const browser=await chromium.launch({headless:true,channel:'chrome'})
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],report=[]
page.on('pageerror',e=>errors.push(e.message))
try{
 await page.goto('http://localhost:5173/admin/login');await page.getByLabel('Email admin').fill(env.ADMIN_EMAIL);await page.getByLabel('Kata sandi').fill(env.ADMIN_PASSWORD);await page.getByRole('button',{name:'Masuk ke Workspace'}).click();await page.waitForURL('http://localhost:5173/admin')
 await page.goto('http://localhost:5173/admin/weddings/1',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Template',exact:true}).click()
 for(const [width,height] of [[320,568],[360,800],[375,812],[390,844],[414,896],[430,932],[768,1024],[1024,768],[1280,720],[1440,900]]){
  await page.setViewportSize({width,height});await page.getByRole('button',{name:'Ganti Template',exact:true}).click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('dialog').locator('.template-choice').count(),20);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));const box=await page.getByRole('dialog').boundingBox();assert(box.height<=height&&box.width<=width)
  if([320,1440].includes(width))await page.screenshot({path:`test-results/radina/template-picker-${width}.png`});await page.getByRole('button',{name:'Tutup dialog'}).click();report.push({width,height,status:'passed'})
 }
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS template picker: 20 choices and modal usability at all 10 viewports')
}catch(e){await page.screenshot({path:'test-results/radina/template-picker-failure.png'});throw e}finally{await writeFile('test-results/radina/template-picker-report.json',JSON.stringify(report,null,2));await browser.close()}
