import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
const keys=['romantic-floral','elegant-luxury','minimalist-white','nusantara-heritage','garden-dream','classic-vintage','midnight-romance','sakinah','eternal-story','blush','celestial','editorial','ocean-vows','royal-heritage','paper-petals','botanica','monochrome','blossom-east','neon-love','timeless-romance']
await mkdir('frontend/public/images/templates/previews',{recursive:true})
const browser=await chromium.launch({headless:true,channel:'chrome'})
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
try{for(const key of keys){await page.goto(`http://127.0.0.1:5173/templates/${key}/preview`,{waitUntil:'networkidle'});await page.addStyleTag({content: '.wedding-preview-tools{display:none!important}'});await page.locator('.design-cover').screenshot({path:`test-results/experiences/${key}-cover.png`});execFileSync('php',['scripts/convert-demo-image.php',`test-results/experiences/${key}-cover.png`,`frontend/public/images/templates/previews/${key}.webp`]);console.log(key)}}finally{await browser.close()}
