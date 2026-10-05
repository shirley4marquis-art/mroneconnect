import { getProductVariants } from "./catalog.js";

export const SITE_URL = 'https://mroneconnect.shop';
export const productPath = product => '/products/' + encodeURIComponent(product.id);
export const productIdFromPath = path => { try { return decodeURIComponent(path.split('/')[2] || ''); } catch { return ''; } };
export const publicRoutes = ['/', '/products', '/contact', '/reviews', '/terms', '/refund-policy', '/privacy-policy'];
const routePreviews = {
  '/': '/social/og-home.jpg',
  '/products': '/social/og-products.jpg',
  '/contact': '/social/og-contact.jpg',
  '/reviews': '/social/og-reviews.jpg',
  '/terms': '/social/og-terms.jpg',
  '/refund-policy': '/social/og-refund-policy.jpg',
  '/privacy-policy': '/social/og-privacy-policy.jpg',
  '/cart': '/social/og-cart.jpg',
  '/checkout': '/social/og-checkout.jpg',
  '/login': '/social/og-login.jpg',
  '/dashboard': '/social/og-dashboard.jpg',
};
const routeCopy = {
  '/': ['Phones, Fashion & Fragrances UK | 1:1 Connect', 'Shop phones, laptops, audio, watches, fashion and fragrance at 1:1 Connect.'],
  '/products': ['Shop Electronics, Designer Clothing & Perfumes UK | 1:1 Connect', 'Browse phones, laptops, audio, watches, fashion and fragrances from the 1:1 Connect collection.'],
  '/contact': ['Contact & UK Order Support | 1:1 Connect', 'Get in touch with 1:1 Connect for product, delivery and order support.'],
  '/reviews': ['Customer Reviews | 1:1 Connect UK', 'Read customer feedback and reviews of 1:1 Connect.'],
  '/terms': ['Terms & Conditions | 1:1 Connect', 'Read the terms and conditions for shopping with 1:1 Connect.'],
  '/refund-policy': ['Refund & Cancellation Policy | 1:1 Connect', 'Review the refund, returns and cancellation policy for 1:1 Connect orders.'],
  '/privacy-policy': ['Privacy Policy | 1:1 Connect', 'Learn how 1:1 Connect handles customer information and privacy.'],
  '/cart': ['Shopping Cart | 1:1 Connect', 'Review selected products and quantities in your 1:1 Connect shopping cart.'],
  '/checkout': ['Checkout | 1:1 Connect', 'Review delivery details and prepare your 1:1 Connect order.'],
  '/login': ['Customer Account | 1:1 Connect', 'Access your 1:1 Connect customer account.'],
  '/dashboard': ['Customer Dashboard | 1:1 Connect', 'View saved account and order information from 1:1 Connect.'],
};
export function getPageSeo(path, products) {
  const product = path.startsWith('/products/') ? products.find(p => p.id === productIdFromPath(path)) : null;
  const copy = routeCopy[path] || ['1:1 Connect', 'Shop phones, laptops, fashion and fragrances at 1:1 Connect.'];
  const description = product ? product.description : copy[1];
  const title = product ? product.name + ' | 1:1 Connect UK' : copy[0];
  const url = SITE_URL + (product ? productPath(product) : path);
  const image = SITE_URL + (product?.image || routePreviews[path] || '/social/og-home.jpg');
  const imageAlt = product ? `${product.name} product image` : `${title} social preview`;
  const imageExtension = image.split('.').pop().toLowerCase();
  const imageType = imageExtension === 'webp' ? 'image/webp' : imageExtension === 'png' ? 'image/png' : 'image/jpeg';
  const indexable = Boolean(product || publicRoutes.includes(path));
  let schema = null;
  if (product) {
    schema = {'@context':'https://schema.org','@type':'Product',name:product.name,description:product.description,sku:product.id,url,image:product.images.map(i=>SITE_URL+i)};
    const prices = getProductVariants(product).filter(v=>Number.isSafeInteger(v.pricePence)&&v.pricePence>0).map(v=>v.pricePence/100);
    if (prices.length) schema.offers = new Set(prices).size > 1 ? {'@type':'AggregateOffer',url,priceCurrency:'GBP',lowPrice:Math.min(...prices),highPrice:Math.max(...prices),offerCount:prices.length} : {'@type':'Offer',url,priceCurrency:'GBP',price:prices[0],seller:{'@type':'Organization',name:'1:1 Connect'}};
  } else if (path === '/') {
    schema = {'@context':'https://schema.org','@graph':[{'@type':'OnlineStore','@id':SITE_URL+'/#store',name:'1:1 Connect',url:SITE_URL,description,areaServed:'GB',currenciesAccepted:'GBP',logo:SITE_URL+'/mrconnect-logo.png'},{'@type':'WebSite',name:'1:1 Connect',url:SITE_URL,inLanguage:'en-GB'}]};
  } else if (path === '/products') {
    schema = {'@context':'https://schema.org','@type':'ItemList',name:'1:1 Connect UK product collection',itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:SITE_URL+productPath(p)}))};
  }
  return {title,description,url,image,imageAlt,imageType,indexable,schema,product};
}
