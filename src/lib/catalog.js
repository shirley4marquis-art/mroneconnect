export const formatGBP = value => value === null || value === undefined ? "Price on request" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
export const quarterRetailPence = retailPence => Number.isSafeInteger(retailPence) && retailPence > 0 ? Math.round(retailPence / 4) : null;
export const isPurchasable = (product, variant) => { const price = variant === undefined ? product?.pricePence : getVariant(product, variant)?.pricePence; return Number.isSafeInteger(price) && price > 0; };

export const getVariant = (product, label) => product?.variantOptions?.find(v => v.label === label);
export const getVariantPrice = (product, label) => { const pence = getVariant(product, label)?.pricePence; return pence == null ? null : pence / 100; };
export const replaceCartVariant = (items, id, variant, products) => {
  const item = items.find(i => i.id === id);
  const product = products.find(p => p.id === item?.productId);
  if (!item || !isPurchasable(product, variant)) return items;
  if (variant === item.variant) return items;
  const nextId = product.id + "-" + variant;
  const existing = items.find(i => i.productId === product.id && i.variant === variant && i.id !== id);
  if (existing) {
    const notes = [...new Set([existing.optionNotes, item.optionNotes].filter(Boolean))].join("; ");
    return items.filter(i => i.id !== id).map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity, optionNotes: notes } : i);
  }
  return items.map(i => i.id === id ? { ...i, id: nextId, variant, unitPrice: getVariantPrice(product, variant) } : i);
};

export const getProductGallery = (product, variant) => getVariant(product, variant)?.images?.length ? getVariant(product, variant).images : product.images;
export const getProductImage = (product, variant) => getProductGallery(product, variant)?.[0] || product.image;
export const getUnitPricing = (product, quantity, variant = product.defaultVariant || product.variants[0]) => {
  const reseller = product.pricing.reseller;
  if (reseller && quantity >= reseller.minimum) return {key: "reseller", ...reseller};
  return {key: "consumer", ...product.pricing.consumer, price: getVariantPrice(product, variant)};
};
