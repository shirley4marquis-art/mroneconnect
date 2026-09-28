import fs from 'node:fs';
import path from 'node:path';
import {getPageSeo, publicRoutes, productPath, SITE_URL} from '../src/lib/seo.js';
const products=JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
const template=fs.readFileSync('dist/index.html','utf8');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=[...publicRoutes,...products.map(productPath),'/cart','/checkout','/login','/dashboard'];
for(const route of routes){
  const s=getPageSeo(route,products);
  const meta=(key,value,property=false)=>`<meta ${property?'property':'name'}="${key}" content="${escape(value)}" />`;
  const head=[`<title>${escape(s.title)}</title>`,meta('description',s.description),meta('robots',s.indexable?'index, follow, max-image-preview:large':'noindex, follow'),`<link rel="canonical" href="${escape(s.url)}" />`,meta('og:type','website',true),meta('og:locale','en_GB',true),meta('og:site_name','1:1 Connect',true),meta('og:url',s.url,true),meta('og:image:alt',s.product?.name||'1:1 Connect UK',true),meta('twitter:card','summary_large_image'),...['og','twitter'].flatMap(prefix=>['title','description','image'].map(field=>meta(prefix+':'+field,s[field],prefix==='og'))),s.schema?`<script id="page-schema" type="application/ld+json">${JSON.stringify(s.schema).replace(/</g,'\\u003c')}</script>`:''].join('\n');
  const noScript=s.product?`<noscript><main><h1>${escape(s.product.name)}</h1><p>${escape(s.description)}</p><img src="${escape(s.product.image)}" alt="${escape(s.product.name)}" width="400" /><p>${s.product.pricePence===null?'Price on request':new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(s.product.pricePence/100)}</p><a href="/products">Browse all products</a><p>Enable JavaScript to choose options and order.</p></main></noscript>`:route==='/products'?`<noscript><h1>Shop the UK collection</h1><ul>${products.map(p=>`<li><a href="${productPath(p)}">${escape(p.name)}</a> — ${p.pricePence===null?'Price on request':new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(p.pricePence/100)}</li>`).join('')}</ul></noscript>`:'';
  const html=template.replace(/<!-- PAGE_SEO_START -->[\s\S]*?<!-- PAGE_SEO_END -->/,`<!-- PAGE_SEO_START -->\n${head}\n<!-- PAGE_SEO_END -->`).replace('<div id="root"></div>','<div id="root"></div>'+noScript);
  const target=route==='/'?'dist/index.html':'dist/seo'+decodeURIComponent(route)+'.html';fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
}
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.filter(r=>getPageSeo(r,products).indexable).map(r=>`  <url><loc>${escape(SITE_URL+r)}</loc></url>`).join('\n')+'\n</urlset>\n';
fs.writeFileSync('dist/sitemap.xml',sitemap);fs.writeFileSync('public/sitemap.xml',sitemap);
console.log(`Generated UK metadata for ${products.length} products and ${publicRoutes.length} public pages.`);

