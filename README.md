# MRoneConnect

React/Vite storefront imported from the latest ready deployment of the Vercel project `aoneconnect-shop` (`prj_sYsuwG2PrKvcl3ItgOCZcJswAf8o`).

## Run locally

```sh
npm ci
npm run dev
```

The original `.env.example` is retained for reference. The current app does not read those variables: accounts, cart, and orders use browser local storage. Real authentication requires a backend integration.

## Build

```sh
npm run build
npm run preview
```

## Import source

Deployment: `dpl_4M5QuGPKRKQcuPN7NHJ9euWmUMhR`.

Source files and public assets were downloaded through the authenticated Vercel API and verified against their SHA-1 hashes. Generated `dist` output, local environment files, and local assistant settings were excluded.

## Product catalogue

The 39 Vaultsource listings and 61 source images are stored locally. `src/data/products.json` contains new physical-item descriptions, source provenance, and GBP prices set to 25% of documented UK retail references. 28 listings have reference prices; 11 require exact specifications or a verified retail source and display Price on request. See [pricing sources and assumptions](docs/catalog/uk-retail-pricing.md). Historic RRPs and reference configurations are labelled; source supplier-access fees are never used. The imported images do not verify authenticity or stock availability.

Run `npm run test:catalog` against a running dev server (Chrome required). Set `TEST_BASE_URL` if the server uses a port other than 5173. The test covers catalogue integrity, local assets, price rounding, search/filter, cart persistence, enquiry routes, and mobile overflow. Cart storage uses v2 to avoid mapping previous product IDs to new listings; previous orders are retained.

Product colour/configuration selectors are available in the product page, cart and checkout. See [all option references and prices](docs/catalog/product-options.md). Manufacturer options do not establish physical inventory. Unknown prices require an enquiry. Per-item option requests are carried into the order summary without changing the selected configuration price.



Run `npm run test:options` to verify configuration pricing, checkout edits, saved selections, merging and the generated order summary.

## UK catalogue and search updates

The visible catalogue contains 42 listings: 39 imported listings plus three distinct original products. Original iPhone 17 Pro Max, AirPod Pro 3 and watch prices are retained, including applicable bulk discounts. The new AirPods Max listing replaces its older duplicate. See `docs/catalog/legacy-merge.json`.

All 61 source images are retained, with 42 additional manufacturer/retailer images recorded in `docs/catalog/option-images.json`. Matching colour galleries update on product pages, in the cart and at checkout. `docs/catalog/colour-image-coverage.json` records exact coverage; options without a separate published image retain the general gallery. CSS blending improves the original image backgrounds but does not make the source files transparent.

Customer descriptions focus on the physical products. Reference data is internal and no longer appears on product pages. The UK SEO build generates individual product titles, descriptions, social previews, canonical URLs, GBP structured data and a sitemap. Private shopping/account routes are noindex. Vercel rewrites serve the generated metadata pages; local Vite development uses client-side metadata. Product offers omit unverified stock claims.

Run `npm run build`, then `npm run test:uk-catalog` against the running dev server to check image mapping, original prices, encoded product routes, metadata and mobile layout.

A further 32 colour images cover every listed MacBook Pro M3, MacBook Air M2, iPhone 17 Pro, iPhone 17 Pro Max and Denim Tears hoodie colour. The Blue hoodie gallery shows the manufacturer's Powder Blue finish. The original 49mm watch requires its exact supplier/model identification before matching its five strap colours. Images and source hashes are recorded in the option-image manifest.
