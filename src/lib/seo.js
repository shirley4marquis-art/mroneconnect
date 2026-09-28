export const SITE_URL = 'https://mroneconnect.shop';
export const productPath = product => '/products/' + encodeURIComponent(product.id);
export const productIdFromPath = path => { try { return decodeURIComponent(path.split('/')[2] || ''); } catch { return ''; } };
export const publicRoutes = ['/', '/products', '/contact', '/reviews', '/terms', '/refund-policy', '/privacy-policy'];
export function getPageSeo(path, products) {
  const product = path.startsWith('/products/') ? products.find(p => p.id === productIdFromPath(path)) : null;
  const titles = {'/':'Phones, Fashion & Fragrances UK | 1:1 Connect','/products':'Shop Electronics, Designer Clothing & Perfumes UK | 1:1 Connect','/contact':'Contact & UK Order Support | 1:1 Connect','/reviews':'Customer Reviews | 1:1 Connect UK','/terms':'Terms & Conditions | 1:1 Connect','/refund-policy':'Refund & Cancellation Policy | 1:1 Connect','/privacy-policy':'Privacy Policy | 1:1 Connect'};
  const description = product ? product.description : path === '/contact' ? 'Contact 1:1 Connect for product options, UK delivery enquiries and order support.' : path === '/reviews' ? 'Read customer reviews of 1:1 Connect and share your shopping experience.' : 'Shop phones, laptops, designer clothing, perfumes, watches and accessories at 1:1 Connect. Browse product options, prices in GBP and UK delivery choices.';
  const title = product ? product.name + ' | 1:1 Connect UK' : titles[path] || '1:1 Connect';
  const url = SITE_URL + (product ? productPath(product) : path);
  const image = SITE_URL + (product?.image || '/social/mroneconnect-preview.jpg');
  const indexable = Boolean(product || publicRoutes.includes(path));
  let schema = null;
  if (product) {
    schema = {'@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,sku:product.id,url,image:product.images.map(i=>SITE_URL+i)};
    const prices = product.variantOptions.filter(v=>Number.isSafeInteger(v.pricePence)&&v.pricePence>0).map(v=>v.pricePence/100);
    if (prices.length) schema.offers = new Set(prices).size > 1 ? {'@type':'AggregateOffer',url,priceCurrency:'GBP',lowPrice:Math.min(...prices),highPrice:Math.max(...prices),offerCount:prices.length} : {'@type':'Offer',url,priceCurrency:'GBP',price:prices[0],seller:{'@type':'Organization',name:'1:1 Connect'}};
  } else if (path === '/') {
    schema = {'@context':'https://schema.org','@graph':[{'@type':'OnlineStore','@id':SITE_URL+'/#store',name:'1:1 Connect',url:SITE_URL,description,areaServed:'GB',currenciesAccepted:'GBP',logo:SITE_URL+'/mrconnect-logo.png'},{'@type':'WebSite',name:'1:1 Connect',url:SITE_URL,inLanguage:'en-GB'}]};
  } else if (path === '/products') {
    schema = {'@context':'https://schema.org','@type':'ItemList',name:'1:1 Connect UK product collection',itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:SITE_URL+productPath(p)}))};
  }
  return {title,description,url,image,indexable,schema,product};
}
