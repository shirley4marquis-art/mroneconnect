import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {getProductImage,getUnitPricing} from '../src/lib/catalog.js';
import {getPageSeo,productPath} from '../src/lib/seo.js';
const products=JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
const images=JSON.parse(fs.readFileSync('docs/catalog/option-images.json','utf8'));
assert.ok(images.length >= 74);
for(const asset of images)assert.equal(fs.statSync('public'+asset.path).size,asset.bytes);
for(const p of products){
 for(const v of p.variantOptions)for(const image of v.images||[])assert.ok(fs.existsSync('public'+image));
 const seo=getPageSeo(productPath(p),products);assert.equal(seo.product.id,p.id);assert.equal(seo.description,p.description);assert.ok(!('brand' in seo.schema));
 if(p.pricePence===null)assert.ok(!seo.schema.offers);
 else assert.equal(seo.schema.offers.priceCurrency,'GBP');
 const html=fs.readFileSync('dist/seo/products/'+p.id+'.html','utf8');assert.ok(html.includes('lang="en-GB"'));assert.ok(html.includes('page-schema'));assert.ok(!html.includes('schema.org/InStock'));
 assert.ok(fs.readFileSync('dist/sitemap.xml','utf8').includes(productPath(p)));
}
assert.equal(products.filter(p=>p.id==='headphones').length,1);
for(const [id,single,bulk,minimum] of [['iphone-17-pro-max',600,500,3],['airpod-pro-3',75,45,4],['apple-watch-3-smartwatch-49mm',120,120,1]]){const p=products.find(p=>p.id===id);assert.equal(getUnitPricing(p,1).price,single);assert.equal(getUnitPricing(p,minimum).price,bulk);}
assert.equal(getPageSeo('/checkout',products).indexable,false);
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const base=process.env.TEST_BASE_URL||'http://localhost:5173';
 const phone=products.find(p=>p.id==='iphone-18-pro-max');
 await page.goto(base+productPath(phone));const main=page.locator('main img.product-image-blend').first();
 await page.getByRole('combobox',{name:'Colour',exact:true}).selectOption('Black');await page.getByRole('combobox',{name:'Storage',exact:true}).selectOption('256 GB');
 assert.equal(await main.getAttribute('src'),getProductImage(phone,'Black / 256 GB'));
 await page.getByRole('combobox',{name:'Colour',exact:true}).selectOption('Silver');assert.equal(await main.getAttribute('src'),getProductImage(phone,'Silver / 256 GB'));
 await page.getByRole('button',{name:'View image 2',exact:true}).click();assert.notEqual(await main.getAttribute('src'),getProductImage(phone,'Silver / 256 GB'));
 await page.getByRole('combobox',{name:'Colour',exact:true}).selectOption('Burgundy');assert.equal(await main.getAttribute('src'),getProductImage(phone,'Burgundy / 256 GB'));
 assert.ok(!/UK retail|retail reference|pricing reference/i.test(await page.locator('main').innerText()));
 await page.getByRole('button',{name:'Add to Cart',exact:true}).click();await page.goto(base+'/checkout');assert.equal(await page.locator('aside img').first().getAttribute('src'),getProductImage(phone,'Burgundy / 256 GB'));
 await page.locator('aside').getByRole('combobox',{name:'Colour',exact:true}).selectOption('Black');assert.equal(await page.locator('aside img').first().getAttribute('src'),getProductImage(phone,'Black / 256 GB'));
 await page.goto(base+'/products/phone-2');await page.getByRole('combobox',{name:'Colour',exact:true}).selectOption('Pink');await main.scrollIntoViewIfNeeded();await page.waitForTimeout(600);await page.screenshot({path:'.artifacts/colour-gallery-desktop.png'});
 await page.setViewportSize({width:390,height:844});await main.scrollIntoViewIfNeeded();await page.screenshot({path:'.artifacts/colour-gallery-mobile.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const unicode=products.find(p=>p.id.includes('earbuds-inspired'));await page.goto(base+productPath(unicode));await page.getByRole('heading',{name:unicode.name,exact:true}).waitFor();assert.equal(await page.title(),getPageSeo(productPath(unicode),products).title);
 assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'),getPageSeo(productPath(unicode),products).image);assert.deepEqual(errors,[]);
 console.log('PASS: downloaded option images; colour galleries and checkout photos; restored prices and bulk thresholds; encoded URLs; static UK metadata and sitemap; mobile layout.');
} finally {await browser.close();}

