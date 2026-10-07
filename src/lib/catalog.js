export const formatGBP = value => value === null || value === undefined ? "Price on request" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
export const quarterRetailPence = retailPence => Number.isSafeInteger(retailPence) && retailPence > 0 ? Math.round(retailPence / 4) : null;
const combinations = groups => groups.reduce((rows, group) => rows.flatMap(row => group.values.map(value => ({...row, [group.name]: value}))), [{}]);
const optionLabel = values => Object.values(values).join(" / ");
const qualityPrice = (quality, values) => {
  if (!quality || quality.enabled === false) return null;
  const exactKey = Object.entries(values).map(([key, value]) => `${key}=${value}`).join("|");
  if (Object.hasOwn(quality.pricesByOptions || {}, exactKey)) return quality.pricesByOptions[exactKey];
  const storage = values.Storage;
  const pricing = quality.pricing;
  if (pricing?.type === "storage-tier" && storage) {
    const tiers = pricing.storageTiers || [];
    const baseIndex = tiers.indexOf(pricing.baseStorage);
    const selectedIndex = tiers.indexOf(storage);
    if (baseIndex >= 0 && selectedIndex >= baseIndex && Number.isSafeInteger(pricing.basePricePence) && Number.isSafeInteger(pricing.incrementPence)) return pricing.basePricePence + pricing.incrementPence * (selectedIndex - baseIndex);
  }
  if (Number.isSafeInteger(pricing?.basePricePence)) {
    return Object.entries(values).reduce((total, [group, value]) => {
      const modifier = pricing.optionPriceModifiers?.[group]?.[value] ?? 0;
      return Number.isSafeInteger(modifier) ? total + modifier : total;
    }, pricing.basePricePence);
  }
  return null;
};
export const getProductVariants = product => {
  if (!product?.qualityVariants?.length) return product?.variantOptions || [];
  const baseOptions = combinations(product.optionGroups || []);
  return product.qualityVariants.filter(q => q.enabled !== false).flatMap(quality => baseOptions.map(values => {
    const label = `${quality.label} — ${optionLabel(values)}`;
    const exactKey = Object.entries(values).map(([key, value]) => `${key}=${value}`).join("|");
    const pricePence = qualityPrice(quality, values);
    const matchingOption = product.variantOptions?.find(option => Object.entries(values).every(([key, value]) => option.values?.[key] === value));
    const retailPence = quality.retailPricesByOptions?.[exactKey]
      ?? (quality.id === "original" ? matchingOption?.retailPence : undefined)
      ?? (quality.id === "original" && Number.isSafeInteger(quality.marketPriceMarkupPence) && Number.isSafeInteger(pricePence) ? pricePence - quality.marketPriceMarkupPence : undefined);
    return {label, qualityId: quality.id, qualityLabel: quality.label, values, pricePence, retailPence, stockStatus: quality.stockStatus || "Contact for availability", stock: quality.stock, stockQuantity: quality.stockQuantity ?? product.stockQuantity, specifications: quality.specifications || {}, description: quality.description, images: quality.images};
  }));
};
export const getStockQuantity = (product, variant) => {
  const variantStock = variant ? getVariant(product, variant)?.stockQuantity : null;
  const stock = variantStock ?? product?.stockQuantity;
  return Number.isSafeInteger(stock) && stock >= 0 ? stock : null;
};
export const getDefaultProductVariant = product => {
  const variants = getProductVariants(product);
  if (product?.qualityVariants?.length) return variants.find(v => v.qualityId === (product.defaultQuality || "rep"))?.label || variants[0]?.label;
  return product?.defaultVariant || variants[0]?.label;
};
export const isPurchasable = (product, variant) => { const price = variant === undefined ? product?.pricePence : getVariant(product, variant)?.pricePence; return Number.isSafeInteger(price) && price > 0; };

export const getVariant = (product, label) => getProductVariants(product).find(v => v.label === label);
export const getVariantPrice = (product, label) => { const pence = getVariant(product, label)?.pricePence; return pence == null ? null : pence / 100; };
export const getQuality = (product, variant) => getVariant(product, variant)?.qualityId;
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
export const getUnitPricing = (product, quantity, variant = getDefaultProductVariant(product)) => {
  if (product?.qualityVariants?.length) return {key: getQuality(product, variant), label: `${getVariant(product, variant)?.qualityLabel || ""} price`, price: getVariantPrice(product, variant)};
  const reseller = product.pricing.reseller;
  if (reseller && quantity >= reseller.minimum) return {key: "reseller", ...reseller};
  return {key: "consumer", ...product.pricing.consumer, price: getVariantPrice(product, variant)};
};
