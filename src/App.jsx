import { getPageSeo, productIdFromPath, productPath } from "./lib/seo.js";
import products from "./data/products.json";
import { formatGBP, isPurchasable, getVariant, getVariantPrice, replaceCartVariant, getProductGallery, getProductImage, getUnitPricing, getProductVariants, getDefaultProductVariant, getStockQuantity } from "./lib/catalog.js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";

const AUTH_STORAGE_KEY = "oneconnect_member";
const ORDERS_STORAGE_KEY = "oneconnect_orders_v2";
const CART_STORAGE_KEY = "oneconnect_cart_v2";
const MINIMUM_ORDER_AMOUNT = 70;
const LOW_PRICE_ITEM_THRESHOLD = 50;
const UK_WHATSAPP_NUMBER = "447927876232";
const USA_SMS_NUMBER = "+13125617143";
const UK_TELEGRAM_URL = "https://t.me/+1hs1FC9DBlJhNmUx";
const USA_TELEGRAM_URL = "https://t.me/BRoneconnectHQ";
const UK_REVIEWS_URL = UK_TELEGRAM_URL;

const navItems = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Reviews", "/reviews"],
  ["Contact", "/contact"],
];

const footerLinks = {
  Shop: [
    ["Products", "/products"],
    ["Cart", "/cart"],
    ["Checkout", "/checkout"],
  ],
  Support: [
    ["Contact", "/contact"],
    ["Reviews", "/reviews"],
    ["Dashboard", "/dashboard"],
  ],
  Legal: [
    ["Terms & Conditions", "/terms"],
    ["Refund Policy", "/refund-policy"],
    ["Privacy Policy", "/privacy-policy"],
  ],
};

const termsSections = [
  {
    title: "1. General",
    body: [
      "1:1 CONNECT supplies consumer electronics and related accessories.",
      "By placing an order, the customer confirms that they have read and accepted these Terms & Conditions, our Refund Policy, and any product information provided before purchase.",
    ],
  },
  {
    title: "2. Product Information",
    body: [
      "We aim to ensure all product descriptions, specifications, pricing, and images are accurate.",
      "Customers are encouraged to ask any questions before placing an order if they require clarification regarding a product.",
    ],
  },
  {
    title: "3. Orders",
    body: [
      "An order is considered confirmed once payment has been successfully received.",
      "We reserve the right to decline or cancel any order where stock becomes unavailable, incorrect pricing has been displayed, fraud is suspected, or payment verification cannot be completed.",
    ],
  },
  {
    title: "4. Pricing & Payment",
    body: [
      "All prices are displayed in GBP (£) unless stated otherwise.",
      "Prices may change without prior notice. Orders already paid for will not be affected by future price changes.",
      "Payment must be completed before dispatch. Orders remain unconfirmed until cleared payment has been received.",
    ],
  },
  {
    title: "5. Shipping & Delivery",
    body: [
      "Dispatch times may vary depending on stock availability. Estimated delivery times are guidelines only.",
      "1:1 CONNECT cannot guarantee courier delivery dates once parcels have been handed over. Tracking information will be provided where applicable.",
    ],
  },
  {
    title: "6. Customer Responsibilities",
    list: [
      "Providing accurate delivery information.",
      "Monitoring tracking updates.",
      "Ensuring someone is available where required to receive deliveries.",
      "Contacting us promptly if an issue arises.",
    ],
  },
  {
    title: "7. Inspection Upon Delivery",
    body: [
      "Customers should inspect their order promptly after delivery.",
      "Any issues should be reported within 48 hours with supporting photographs or videos where appropriate.",
    ],
  },
  {
    title: "8. Refunds & Returns",
    body: ["Refunds and returns are handled in accordance with our published Refund & Cancellation Policy."],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, 1:1 CONNECT shall not be responsible for delays, losses, or damages resulting from courier delays, customs processing, weather, incorrect customer information, or events outside our reasonable control.",
      "Nothing in these Terms excludes liability where it cannot legally be excluded, and nothing affects your mandatory statutory consumer rights.",
    ],
  },
  {
    title: "10. Fraud Prevention",
    body: [
      "To protect both customers and the business, orders may be documented before dispatch, shipping records may be retained, and fraudulent claims or payment disputes may be challenged using available evidence.",
    ],
  },
  {
    title: "11. Intellectual Property",
    body: [
      "All branding, logos, product photography, website content, and promotional materials remain the property of 1:1 CONNECT unless otherwise stated.",
      "They may not be copied or reproduced without permission.",
    ],
  },
  {
    title: "12. Privacy",
    body: [
      "Customer information is used solely for order processing, delivery, customer support, and legal or regulatory compliance.",
      "We do not sell customer data to third parties.",
    ],
  },
  {
    title: "13. Governing Law",
    body: [
      "These Terms & Conditions are governed by the laws applicable to the jurisdiction in which 1:1 CONNECT operates and any mandatory consumer protection laws that apply to the customer.",
    ],
  },
  {
    title: "14. Changes",
    body: [
      "We reserve the right to amend these Terms & Conditions at any time. Updated versions will apply to future orders from the date they are published.",
    ],
  },
];

const refundSections = [
  {
    title: "1. Order Cancellation",
    body: [
      "Customers may cancel an order at any time before dispatch. If payment has already been received and the order has not been shipped, a full refund will be issued to the original payment method.",
      "Once an order has entered the dispatch process or has been handed over to the courier, it can no longer be cancelled unless applicable consumer law gives you a right to cancel or a remedy.",
    ],
  },
  {
    title: "2. Refund Eligibility",
    body: ["Refunds may be considered in the following circumstances. All refund requests are reviewed individually."],
    list: [
      "The order is cancelled before dispatch.",
      "The product cannot be supplied due to stock availability.",
      "The order is lost in transit and confirmed as lost by the courier.",
      "The product arrives significantly damaged during shipping, with evidence required.",
      "The wrong product was supplied.",
    ],
  },
  {
    title: "3. Returns",
    body: ["Where a return is applicable:"],
    list: [
      "The product must be returned in the same condition it was received.",
      "All original packaging and accessories must be included.",
      "The item must not show signs of misuse, accidental damage, or unauthorised modification.",
      "Returned products may be inspected before any refund is approved.",
    ],
  },
  {
    title: "4. Dispatch & Delivery",
    body: [
      "Once tracking information has been issued and the parcel has been accepted by the courier, responsibility for delivery times rests with the shipping provider.",
      "We will assist customers in resolving courier-related issues, but delays caused by courier operations, customs inspections, weather, public holidays, or other third parties do not automatically qualify for a refund.",
    ],
  },
  {
    title: "5. Incorrect Delivery Information",
    body: [
      "Customers are responsible for ensuring that all shipping information is accurate before payment.",
      "1:1 CONNECT cannot accept responsibility for delays or losses resulting from incorrect names, addresses, postcodes, or contact information supplied by the customer.",
    ],
  },
  {
    title: "6. Damaged or Incorrect Orders",
    body: [
      "If your order arrives damaged or differs from your invoice, please contact us within 48 hours of delivery.",
      "To help us investigate quickly, include your order number, clear photos or videos of the item, and photos of the packaging if applicable.",
      "Failure to report issues within this timeframe may affect eligibility for a refund or replacement.",
    ],
  },
  {
    title: "7. Refund Processing",
    body: [
      "Approved refunds are issued to the original payment method only.",
      "Processing times vary depending on the payment provider or bank and may take several business days before the funds appear in your account.",
    ],
  },
  {
    title: "8. Fraud Prevention",
    list: [
      "All orders are documented before dispatch.",
      "Packaging and shipping records are retained.",
      "Fraudulent refund claims, chargebacks without valid grounds, or attempts to obtain goods without payment may be contested using available transaction, shipping, and communication records.",
    ],
  },
  {
    title: "9. Customer Support",
    body: [
      "If you experience any issues with your order, we encourage you to contact us directly before initiating a payment dispute. Most issues can be resolved quickly through our support team.",
      "1:1 CONNECT is committed to handling every genuine issue fairly, professionally, and in accordance with applicable consumer protection laws.",
    ],
  },
];

const privacySections = [
  {
    title: "Information We Collect",
    body: [
      "We collect the information needed to process orders, provide delivery updates, and support customers. This may include your name, email address, phone number, delivery details, billing details, order notes, and order history.",
    ],
  },
  {
    title: "How We Use Information",
    list: [
      "Processing and managing orders.",
      "Arranging delivery and order support.",
      "Responding to customer questions.",
      "Preventing fraud and handling payment disputes.",
      "Meeting legal and regulatory responsibilities.",
    ],
  },
  {
    title: "Data Sharing",
    body: [
      "We do not sell customer data. Information may be shared only where needed with delivery providers, payment providers, support channels, or legal and regulatory authorities.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "Order and communication records may be retained for customer support, accounting, fraud prevention, and legal compliance purposes.",
    ],
  },
  {
    title: "Customer Rights",
    body: [
      "Customers may contact us to request access to, correction of, or deletion of personal information where applicable law allows.",
    ],
  },
];

const reviewScreenshots = [
  {
    image: "/reviews/review-1.PNG",
    caption: "Nahhh, you're the best, for life. Proper real one, no lie.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-2.JPG",
    caption: "Landed. Your products and quality are the best in the game.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-4.JPG",
    caption: "AirPods came in. Clean delivery proof.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-5.JPG",
    caption: "First time buying. Order confirmed.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-6.JPG",
    caption: "Fresh customer proof from the channel.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-7.JPG",
    caption: "Another clean order update.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-8.JPG",
    caption: "Recent customer delivery screenshot.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-9.JPG",
    caption: "More proof from recent orders.",
    date: "Customer screenshot",
  },
  {
    image: "/reviews/review-10.jpeg",
    caption: "Mission accomplished. Bag and packaging came through clean.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-11.jpeg",
    caption: "Fast shipping, order received.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-12.jpeg",
    caption: "Customer called it real iPhone stock and asked for more.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-13.jpeg",
    caption: "Reseller feedback after taking the phone to work.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-14.jpeg",
    caption: "Customer checking before buying again within 24 hours.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-15.jpeg",
    caption: "Everything locked in and clean.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-16.jpeg",
    caption: "Best supplier feedback from a fresh order.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-17.jpeg",
    caption: "Smooth resale feedback from a returning customer.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-18.jpeg",
    caption: "Apple Watch order received.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-19.jpeg",
    caption: "Two white phones came through with clean packaging.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-20.jpeg",
    caption: "AirPods came and got vouched.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-21.jpeg",
    caption: "Fresh order proof from the channel.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-22.jpeg",
    caption: "Customer called the product clean and worth the wait.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-23.jpeg",
    caption: "Phone came through and customer asked about more stock.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-24.jpeg",
    caption: "Bulk order conversation and payment handoff.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-25.jpeg",
    caption: "Payment confirmation screenshot from a new order.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-26.jpeg",
    caption: "Consistency and reseller feedback from a repeat buyer.",
    date: "New customer screenshot",
  },
  {
    image: "/reviews/review-27.jpeg",
    caption: "Customer praised the quality after multiple orders.",
    date: "New customer screenshot",
  },
];

const emptyCheckout = {
  fullName: "",
  email: "",
  phone: "",
  country: "UK",
  deliveryOption: "Royal Mail",
  deliveryAddress: "",
  inpostLocker: "",
  billingSame: true,
  billingAddress: "",
  notes: "",
  completionMethod: "whatsapp",
};

const CartContext = createContext(null);

const getProduct = (id) => products.find((product) => product.id === id) || products[0];
const homeFeaturedProductIds = [
  "iphone-18-pro-max",
  "iphone-17-pro-max",
  "laptop-1",
  "headphones",
  "ai-smart-glasses",
  "airpod-pro-3",
];

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getStoredUser = () => safeJsonParse(localStorage.getItem(AUTH_STORAGE_KEY), null);
const getStoredOrders = () => safeJsonParse(localStorage.getItem(ORDERS_STORAGE_KEY), []);
const getStoredCart = () => {
  const stored = safeJsonParse(localStorage.getItem(CART_STORAGE_KEY), []);
  return Array.isArray(stored) ? stored.filter(item => item && typeof item === "object").map(item => {
    const product = products.find(p => p.id === item.productId);
    const variant = product?.variantAliases?.[item.variant] || item.variant;
    const minimumQuantity = product?.minimumOrderQuantity || 1;
    const quantity = Number.isSafeInteger(item.quantity) && item.quantity > 0 ? Math.min(getStockQuantity(product) ?? 999, Math.max(item.quantity, minimumQuantity)) : item.quantity;
    return {...item, quantity, variant, id: `${item.productId}-${variant}`};
  }).filter(item => {
    const product = products.find(p => p.id === item.productId);
    return isPurchasable(product, item.variant) && getProductVariants(product).some(v => v.label === item.variant) && Number.isSafeInteger(item.quantity) && item.quantity > 0;
  }) : [];
};

const navigateTo = (path) => {
  if (window.location.pathname === path && window.location.search === "") return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const getPricingForQuantity = getUnitPricing;

const normaliseQuantity = (value, minimum = 1, maximum = 999) => Math.min(maximum, Math.max(minimum, Math.floor(Number(value) || minimum)));

const makeCartItem = ({ productId, variant, quantity }) => {
  const product = products.find(p => p.id === productId);
  if (!isPurchasable(product, variant) || !getProductVariants(product).some(v => v.label === variant)) return null;
  const nextQuantity = normaliseQuantity(quantity, product.minimumOrderQuantity || 1, getStockQuantity(product, variant) ?? 999);
  const pricing = getPricingForQuantity(product, nextQuantity, variant);
  return {
    id: `${product.id}-${variant}`,
    productId: product.id,
    variant,
    quantity: nextQuantity,
    unitPrice: pricing.price,
    pricingType: pricing.label,
  };
};

const getCartItemDetails = (item) => {
  const product = getProduct(item.productId);
  const pricing = getPricingForQuantity(product, item.quantity, item.variant);
  return {
    ...item,
    product,
    unitPrice: pricing.price,
    pricingType: pricing.label,
    lineTotal: Math.round(pricing.price * 100) * item.quantity / 100,
  };
};

const getCartSubtotal = (items) =>
  items.reduce((total, item) => {
    const details = getCartItemDetails(item);
    return Math.round((total + details.lineTotal) * 100) / 100;
  }, 0);

const buildOrderSummary = ({ checkout, cartItems }) => {
  const details = cartItems.map(getCartItemDetails);
  const itemsText = details
    .map(
      (item, index) => `${index + 1}. Product: ${item.product.name}
   Options: ${item.variant}
   Option requests: ${item.optionNotes || "None"}
   Quantity: ${item.quantity}
   Unit Price: ${formatGBP(item.unitPrice)}
   Line Total: ${formatGBP(item.lineTotal)}`
    )
    .join("\n\n");
  const carrier =
    checkout.country === "UK"
      ? checkout.deliveryOption
      : checkout.completionMethod === "sms"
        ? "SMS / Text confirmation"
        : "Telegram confirmation";
  const address =
    checkout.country === "UK" && checkout.deliveryOption === "InPost Locker"
      ? checkout.inpostLocker
      : checkout.deliveryAddress;
  const billing = checkout.billingSame ? address : checkout.billingAddress;

  return `NEW ORDER - 1:1 CONNECT

Customer:
Name: ${checkout.fullName}
Email: ${checkout.email}
Phone: ${checkout.phone}
Country: ${checkout.country}

Items:

${itemsText}

Delivery:
Carrier: ${carrier}
Address / Locker: ${address}

Billing:
Address: ${billing}

Order Total: ${formatGBP(getCartSubtotal(cartItems))}

Notes: ${checkout.notes || "None"}`;
};

const makeWhatsAppUrl = (message = "") =>
  `https://wa.me/${UK_WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
const makeSmsUrl = (summary) => `sms:${USA_SMS_NUMBER}?&body=${encodeURIComponent(summary)}`;

function usePathname() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  return path;
}

function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

function CartProvider({ children }) {
  const [items, setItems] = useState(() => getStoredCart());
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = ({ productId, variant, quantity = 1 }) => {
    const nextItem = makeCartItem({ productId, variant, quantity });
    if (!nextItem) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === nextItem.id);
      if (existing) {
        return current.map((item) =>
          item.id === nextItem.id
            ? {...makeCartItem({ productId: item.productId, variant: item.variant, quantity: item.quantity + nextItem.quantity }), optionNotes: item.optionNotes}
            : item
        );
      }
      return [...current, nextItem];
    });
    setToast("Added to cart");
    window.setTimeout(() => setToast(""), 1800);
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? {...makeCartItem({ productId: item.productId, variant: item.variant, quantity }), optionNotes: item.optionNotes} : item))
    );
  };

  const updateVariant = (id, variant) => setItems(current => replaceCartVariant(current, id, variant, products));
  const updateOptionNotes = (id, optionNotes) => setItems(current => current.map(item => item.id === id ? {...item, optionNotes: optionNotes.slice(0, 500)} : item));

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));
  const clearCart = () => setItems([]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = getCartSubtotal(items);

  return (
    <CartContext.Provider value={{ items, cartCount, subtotal, addItem, updateQuantity, updateVariant, updateOptionNotes, removeItem, clearCart }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-aqua/35 bg-black/85 px-5 py-3 text-sm font-bold text-white shadow-glow backdrop-blur-xl"
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

function LinkButton({ to, children, className = "", variant = "primary" }) {
  return (
    <button
      type="button"
      onClick={() => navigateTo(to)}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-xs font-bold uppercase tracking-[0.14em] transition ${
        variant === "primary"
          ? "border-aqua/40 bg-aqua/15 text-white hover:border-titanium/50"
          : "border-white/15 bg-white/[0.06] text-white/82 hover:border-aqua/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function PageShell({ eyebrow, title, children, actions }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 pb-20 pt-28 sm:pt-32">
      <motion.header
        className="mb-10 max-w-4xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-aqua">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">{title}</h1>
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </motion.header>
      {children}
    </main>
  );
}

function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`surface-card rounded-lg border border-white/12 bg-white/[0.055] shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function LoadingCurtain() {
  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-carbon"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, pointerEvents: "none" }}
      transition={{ delay: 0.45, duration: 0.45, ease: "easeInOut" }}
    >
      <img className="h-24 w-24 rounded-full border border-aqua/30 object-cover shadow-glow" src="/mrconnect-logo.png" alt="1:1 Connect logo" />
    </motion.div>
  );
}

function WhatsAppLogo(props) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

function TelegramLogo(props) {
  return (
    <svg viewBox="0 0 496 512" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zM362 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7.2-.7.3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3.7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6.5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 362 176.7z" />
    </svg>
  );
}

function FloatingContactButtons() {
  return (
    <div className="fixed bottom-5 right-5 z-[85] flex flex-col items-end gap-3">
      <a
        href={UK_TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on Telegram"
        className="group relative grid h-14 w-14 place-items-center rounded-full border border-[#229ED9]/50 bg-[#229ED9] text-white shadow-[0_10px_30px_rgba(34,158,217,0.45)] transition hover:scale-105"
      >
        <TelegramLogo className="h-7 w-7" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/12 bg-black/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white opacity-0 shadow-glow backdrop-blur-xl transition group-hover:opacity-100">
          Chat on Telegram
        </span>
      </a>
      <a
        href={makeWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Message us on WhatsApp"
        className="group relative grid h-14 w-14 place-items-center rounded-full border border-[#25D366]/50 bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition hover:scale-105"
      >
        <WhatsAppLogo className="h-7 w-7" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/12 bg-black/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white opacity-0 shadow-glow backdrop-blur-xl transition group-hover:opacity-100">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-carbon">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(79,195,247,0.15),transparent_35%),radial-gradient(circle_at_82%_0%,rgba(255,154,77,0.08),transparent_28%),linear-gradient(180deg,#070707_0%,#091011_50%,#070707_100%)]" />
      <div className="absolute inset-0 tech-grid opacity-15" />
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { cartCount } = useCart();

  const go = (to) => {
    setOpen(false);
    navigateTo(to);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-carbon/70 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button type="button" onClick={() => go("/")} className="flex min-w-0 items-center gap-3">
          <img className="h-12 w-12 rounded-full border border-aqua/35 object-cover shadow-[0_0_24px_rgba(79,195,247,0.18)]" src="/mrconnect-logo.png" alt="1:1 Connect" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, to]) => (
              <button
                key={to}
                type="button"
                onClick={() => go(to)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                  path === to ? "bg-aqua/15 text-aqua" : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go("/cart")}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-titanium px-1 text-[10px] font-black text-black">
                {cartCount}
              </span>
            )}
          </button>
          <a
            href={UK_REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white sm:inline-flex"
          >
            <Send className="h-4 w-4" />
            Telegram
          </a>
          <a
            href={makeWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center gap-2 rounded-full border border-titanium/35 bg-titanium/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            Order
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-aqua/35 bg-white/[0.04] text-white lg:hidden"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mx-5 mb-4 grid gap-2 rounded-lg border border-white/10 bg-black/80 p-3 lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {[...navItems, ["Cart", "/cart"]].map(([label, to]) => (
              <button
                key={to}
                type="button"
                onClick={() => go(to)}
                className="rounded-md px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-white/78 hover:bg-white/[0.06]"
              >
                {label}
              </button>
            ))}
            <a
              href={UK_TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center gap-2 rounded-md border border-aqua/30 bg-aqua/10 px-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              <Send className="h-4 w-4" />
              Join Telegram
            </a>
            <a
              href={makeWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center gap-2 rounded-md border border-titanium/30 bg-titanium/10 px-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Order
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/35 px-5 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <button type="button" onClick={() => navigateTo("/")} className="flex items-center gap-3 text-left">
            <img className="h-12 w-12 rounded-full border border-aqua/35 object-cover shadow-[0_0_24px_rgba(79,195,247,0.18)]" src="/mrconnect-logo.png" alt="1:1 Connect" />
            <span>
              <strong className="block text-lg text-white">1:1 Connect</strong>
              <span className="mt-1 block text-sm text-white/58">Electronics, fashion and fragrance for the UK.</span>
            </span>
          </button>
          <p className="mt-5 max-w-lg leading-7 text-white/62">
            Simple checkout, direct support, and clear policies for every order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={makeWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-titanium/35 bg-titanium/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={UK_TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-aqua">{group}</h2>
              <div className="mt-4 grid gap-3">
                {links.map(([label, to]) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => navigateTo(to)}
                    className="text-left text-sm font-semibold text-white/62 transition hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} 1:1 CONNECT. All rights reserved.</p>
        <p>Nothing on this site affects your mandatory statutory rights.</p>
      </div>
    </footer>
  );
}

function QuantityControl({ value, onChange, min = 1, max = 999 }) {
  return (
    <div className="inline-grid grid-cols-[44px_64px_44px] overflow-hidden rounded-full border border-white/12 bg-white/[0.055]">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(min, value - 1))} className="grid min-h-11 place-items-center text-aqua">
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        aria-label="Quantity"
        step="1"
        max={max}
        min={min}
        value={value}
        onChange={(event) => onChange(normaliseQuantity(event.target.value, min, max))}
        className="min-h-11 border-x border-white/10 bg-transparent text-center font-bold text-white outline-none"
      />
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="grid min-h-11 place-items-center text-aqua disabled:opacity-35">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductCard({ product }) {
  const { addItem } = useCart();
  const detailPath = productPath(product);
  const productVariants = getProductVariants(product);
  const defaultVariant = getDefaultProductVariant(product);
  const lowestPrice = productVariants.map(v => v.pricePence).filter(Number.isSafeInteger).sort((a,b) => a-b)[0];
  const repPrice = productVariants.filter(v => v.qualityId === "rep").map(v => v.pricePence).filter(Number.isSafeInteger).sort((a,b)=>a-b)[0];
  const originalPrice = productVariants.filter(v => v.qualityId === "original").map(v => v.pricePence).filter(Number.isSafeInteger).sort((a,b)=>a-b)[0];

  return (
    <motion.article
      className="product-card flex h-full flex-col"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35 }}
    >
      <a
        href={detailPath}
        aria-label={`View ${product.name}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          navigateTo(detailPath);
        }}
      >
        <img className="shop-card-image product-image-blend" loading="lazy" src={product.cardImage} alt={product.name} />
      </a>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-aqua">{product.category}</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        <a
          className="transition hover:text-aqua focus-visible:text-aqua"
          href={detailPath}
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            navigateTo(detailPath);
          }}
        >
          {product.name}
        </a>
      </h3>
      {product.qualityVariants?.length ? <div className="mt-5 grid gap-1 text-sm text-white/75">
        {product.qualityVariants.filter(q=>q.enabled!==false).map(q => {
          const value = q.id === "rep" ? repPrice : q.id === "original" ? originalPrice : lowestPrice;
          return <p key={q.id}><span className="mr-2 inline-flex rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{q.label}</span>{value ? <>from <strong className="text-white">{formatGBP(value/100)}</strong></> : <strong className="text-white">Contact for price</strong>}</p>;
        })}
      </div> : <p className="starting-price mt-5">{product.variants.length > 1 && isPurchasable(product) ? "From " : ""}{formatGBP(product.pricing.consumer.price)}</p>}
      {getStockQuantity(product) !== null && <p className="mt-2 text-xs font-semibold text-white/58">In stock · {getStockQuantity(product)} available</p>}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => {
            if (product.qualityVariants?.length || !isPurchasable(product) || product.variants.length > 1 || (product.minimumOrderQuantity || 1) > 1) { navigateTo(`/products/${product.id}`); return; }
            addItem({ productId: product.id, variant: defaultVariant, quantity: 1 });
            navigateTo("/checkout");
          }}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-aqua/40 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-titanium/50"
        >
          <ShoppingBag className="h-4 w-4" />
          Buy Now
        </button>
      </div>
    </motion.article>
  );
}

function ReviewsPreview() {
  return (
    <section className="section-shell">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-aqua">Customer Reviews</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Recent proof, cleanly shown.</h2>
        </div>
        <LinkButton to="/reviews" variant="secondary">
          View Reviews
        </LinkButton>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {reviewScreenshots.slice(0, 3).map((review) => (
          <ReviewCard key={review.image} review={review} />
        ))}
      </div>
      <a
        href={UK_REVIEWS_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white"
      >
        View More on Telegram
        <ArrowRight className="h-4 w-4" />
      </a>
    </section>
  );
}

const trustPoints = [
  { icon: ShieldCheck, title: "Verified checkout", copy: "Clear pricing with no hidden fees." },
  { icon: PackageCheck, title: "Fast dispatch", copy: "Orders packed and shipped quickly." },
  { icon: MessageCircle, title: "Direct support", copy: "Real replies on WhatsApp & Telegram." },
];

const heroSlides = [
  { src: "/hero/hero-1.jpeg", alt: "Fresh iPhone stock ready to ship" },
  { src: "/hero/hero-2.jpeg", alt: "Orders packed and ready for dispatch" },
  { src: "/hero/hero-3.jpeg", alt: "New arrivals sorted daily" },
  { src: "/hero/hero-4.jpeg", alt: "AirPods Pro stock and packed orders" },
  { src: "/hero/hero-5.jpeg", alt: "AirPods Pro, sealed and ready" },
  { src: "/hero/hero-6.jpeg", alt: "Genuine AirPods Pro packaging" },
];

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % heroSlides.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const goTo = (next) => setIndex((next + heroSlides.length) % heroSlides.length);

  return (
    <section className="home-slideshow relative isolate flex flex-col justify-end overflow-hidden" aria-label="Featured collection slideshow">
      <h1 className="sr-only">1:1 Connect — Electronics, Designer Clothing and Perfumes UK</h1>

      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={heroSlides[index].src}
            src={heroSlides[index].src}
            alt={heroSlides[index].alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/5 to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="slider-control slider-control-left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="slider-control slider-control-right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <HeroActions />
      <div className="relative z-10 mx-auto mb-7 mt-6 flex items-center justify-center gap-2">
        {heroSlides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(slideIndex)}
            aria-label={`Show slide ${slideIndex + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              slideIndex === index ? "w-6 bg-aqua" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function HeroActions() {
  return (
    <motion.div
      className="hero-overlay-actions relative z-10 mx-auto w-full max-w-7xl px-5 pt-20"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-aqua">UK shopping · Prices in GBP</p>
      <p className="mb-6 text-center text-2xl font-semibold text-white sm:text-4xl">Shop, use or release</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <LinkButton to="/products">
          Shop Products
          <ArrowRight className="h-4 w-4" />
        </LinkButton>
        <a
          href={UK_TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-titanium/35 bg-titanium/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-titanium/70"
        >
          <Send className="h-4 w-4" />
          Join Telegram
        </a>
      </div>
    </motion.div>
  );
}

function TrustStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {trustPoints.map(({ icon: Icon, title, copy }) => (
        <Card key={title} className="flex items-start gap-4 p-5">
          <span className="icon-orb flex-none">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function HomePage() {
  return (
    <main>
      <Hero />

      <section className="section-shell">
        <TrustStrip />
      </section>

      <section className="section-shell pt-0">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-aqua">Featured Products</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">Premium products, cleanly presented.</h2>
          </div>
          <LinkButton to="/products" variant="secondary">
            Shop All
          </LinkButton>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {homeFeaturedProductIds.map(id => products.find(product => product.id === id)).filter(Boolean).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <ReviewsPreview />
    </main>
  );
}

function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [version, setVersion] = useState("All");
  const filtered = products.filter(p => (category === "All" || p.category === category) && (version === "All" || p.qualityVariants?.some(q=>q.id===version.toLowerCase()&&q.enabled!==false)) && [p.name, p.sourceTitle, p.retailReference.name].join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <PageShell eyebrow={`${products.length} products · GBP`} title="Explore the collection." actions={<LinkButton to="/cart">View Cart</LinkButton>}>
      <p className="mb-6 max-w-3xl leading-7 text-white/70">Shop phones, electronics, designer clothing, perfumes and watches for UK delivery. Choose your colour, size or storage, with clear prices in pounds sterling.</p>
      <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_240px_180px]">
        <label className="grid gap-2 text-white">Search products<input className="rounded-lg border border-white/20 bg-black/40 p-3" type="search" placeholder="Search products, brands or models" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label className="grid gap-2 text-white">Category<select className="rounded-lg border border-white/20 bg-black p-3" value={category} onChange={e => setCategory(e.target.value)}>{["All", "Electronics", "Designers", "Perfumes", "Watches", "Extras"].map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="grid gap-2 text-white">Version<select className="rounded-lg border border-white/20 bg-black p-3" value={version} onChange={e => setVersion(e.target.value)}>{["All", "Rep", "Original"].map(c => <option key={c}>{c}</option>)}</select></label>
      </div>
      <p className="mb-6 text-white/60" role="status">{filtered.length} of {products.length} products · Price: high to low</p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div>
      {!filtered.length && <p className="py-10 text-white/70">No products match your search. Try another name or category.</p>}
    </PageShell>
  );
}

function VariantSelector({ product, value, onChange, pricedOnly = false }) {
  const variants = getProductVariants(product);
  const selected = getVariant(product, value) || variants[0];
  return <div className="grid gap-3" aria-label={product.name + " options"}>
    {product.optionGroups.map(group => <label key={group.name} className="grid min-w-0 gap-1 text-sm text-white/75">
      <span>{group.name}</span>
      <select className="min-h-11 w-full min-w-0 rounded-lg border border-white/20 bg-[#15191c] px-3 py-2 text-white" value={selected.values[group.name]} onChange={event => {
        const candidates = variants.filter(v => v.values[group.name] === event.target.value && (!pricedOnly || v.pricePence !== null) && v.qualityId === selected.qualityId);
        const exact = candidates.find(v => product.optionGroups.every(g => g.name === group.name || v.values[g.name] === selected.values[g.name]));
        if (exact || candidates[0]) onChange((exact || candidates[0]).label);
      }}>
        {group.values.map(option => {
          const matching = variants.filter(v => v.values[group.name] === option && v.qualityId === selected.qualityId);
          const priced = matching.some(v => v.pricePence !== null);
          return <option key={option} value={option} disabled={pricedOnly && !priced}>{option}{!priced ? " — enquire for price" : ""}</option>;
        })}
      </select>
    </label>)}
  </div>;
}

function QualitySelector({ product, value, onChange }) {
  if (!product.qualityVariants?.length) return null;
  const selected = getVariant(product, value);
  const variants = product.qualityVariants.filter(q => q.enabled !== false);
  return <div className="grid gap-2">
    <span className="text-sm text-white/75">Choose Version</span>
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose product version">
      {variants.map(quality => <button key={quality.id} type="button" aria-pressed={selected?.qualityId === quality.id} onClick={() => {
        const current = selected?.values || {};
        const choice = getProductVariants(product).find(v => v.qualityId === quality.id && Object.entries(current).every(([k,val])=>v.values[k]===val)) || getProductVariants(product).find(v=>v.qualityId===quality.id);
        if (choice) onChange(choice.label);
      }} className={`min-h-12 rounded-lg border px-4 font-semibold transition ${selected?.qualityId===quality.id ? "border-aqua/70 bg-aqua/12 text-white" : "border-white/15 bg-white/[0.04] text-white/65"}`}>{quality.label}</button>)}
    </div>
  </div>;
}

function OptionRequest({ value, onChange }) {
  return <label className="my-3 grid gap-1 text-xs text-white/60">Other option requests (subject to confirmation)
    <input value={value} maxLength={500} onChange={e => onChange(e.target.value)} placeholder="Size, finish or bundle preferences" className="min-h-10 w-full rounded-lg border border-white/15 bg-black/25 px-3 text-white" />
  </label>;
}

function ProductDetailsPage({ id }) {
  const product = getProduct(id);
  const { addItem, subtotal: cartSubtotal } = useCart();
  const [activeImage, setActiveImage] = useState(null);
  const [variant, setVariant] = useState(getDefaultProductVariant(product));
  const minimumQuantity = product.minimumOrderQuantity || 1;
  const maximumQuantity = getStockQuantity(product, variant) ?? 999;
  const [quantity, setQuantity] = useState(minimumQuantity);
  const pricing = getPricingForQuantity(product, quantity, variant);

  useEffect(() => {
    setActiveImage(null);
    setVariant(getDefaultProductVariant(product));
    setQuantity(product.minimumOrderQuantity || 1);
  }, [product.id]);

  useEffect(() => { setActiveImage(null); }, [variant]);

  if (!products.some(p => p.id === id)) return <PageShell eyebrow="Products" title="Product not found"><LinkButton to="/products">Browse products</LinkButton></PageShell>;

  return (
    <PageShell
      eyebrow={product.eyebrow}
      title={product.name}
      actions={<LinkButton to="/products" variant="secondary">Back to Products</LinkButton>}
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr]">
        <Card className="p-4">
          <img className="product-image-blend aspect-[4/3] w-full rounded-lg object-contain" src={activeImage || getProductImage(product, variant)} alt={`${product.name} — ${variant}`} />
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {getProductGallery(product, variant).map((image, imageIndex) => (
              <button
                key={image}
                type="button"
                aria-label={`View image ${imageIndex + 1}`}
                onClick={() => setActiveImage(image)}
                className={`h-20 min-w-24 overflow-hidden rounded-md border ${(activeImage || getProductImage(product, variant)) === image ? "border-aqua" : "border-white/12"}`}
              >
                <img className="product-image-blend h-full w-full object-contain" src={image} alt="" />
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <p className="text-lg leading-8 text-white/72">{getVariant(product, variant)?.description || product.description}</p>
            {getStockQuantity(product, variant) !== null && <p className="mt-3 text-sm font-semibold text-titanium">In stock · {getStockQuantity(product, variant)} available</p>}
            {!product.qualityVariants?.length && <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Object.entries(product.pricing).map(([key, option]) => (
                <div key={key} className={`rounded-lg border p-5 ${pricing.key === key ? "border-aqua/60 bg-aqua/10" : "border-white/12 bg-white/[0.045]"}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">{option.label}</p>
                  <strong className="mt-2 block text-3xl text-white">{formatGBP(key === "reseller" ? option.price : getVariantPrice(product, variant))}</strong>
                  <span className="mt-2 block text-sm font-semibold text-titanium">
                    {option.minimum > 1 ? `Applies automatically at ${option.minimum}+ items` : "Single-unit price"}
                  </span>
                </div>
              ))}
            </div>}
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-white">Choose options</h2>
            <div className="mt-5 grid gap-5">
              <QualitySelector product={product} value={variant} onChange={value => { setVariant(value); setActiveImage(null); }} />
              <VariantSelector product={product} value={variant} onChange={value => { setVariant(value); setActiveImage(null); }} />
              
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/58">Quantity</p>
                <QuantityControl value={quantity} min={minimumQuantity} max={maximumQuantity} onChange={setQuantity} />
                {Number.isFinite(pricing.price) && pricing.price < LOW_PRICE_ITEM_THRESHOLD && cartSubtotal + pricing.price * quantity < MINIMUM_ORDER_AMOUNT && <p className="mt-3 max-w-lg rounded-lg border border-titanium/25 bg-titanium/10 p-3 text-sm leading-6 text-titanium">Orders should total at least {formatGBP(MINIMUM_ORDER_AMOUNT)}. Double this item or add another product to reach the minimum.</p>}
              </div>
              <div className="rounded-lg border border-white/12 bg-white/[0.045] p-4">
                <p className="text-sm text-white/62">Current unit price</p>
                <strong className="mt-1 block text-3xl text-white">{formatGBP(pricing.price)}</strong>
                <p className="mt-2 text-sm font-semibold text-titanium">{pricing.label}</p>
              </div>
              <button
                type="button"
                onClick={() => isPurchasable(product, variant) ? addItem({ productId: product.id, variant, quantity }) : navigateTo("/contact")}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-titanium/45 bg-titanium/15 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                {isPurchasable(product, variant) ? "Add to Cart" : "Enquire about this product"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function CartPage() {
  const { items, subtotal, updateQuantity, updateVariant, updateOptionNotes, removeItem } = useCart();
  const detailedItems = items.map(getCartItemDetails);

  return (
    <PageShell eyebrow="Cart" title="Your shopping cart." actions={<LinkButton to="/products" variant="secondary">Continue Shopping</LinkButton>}>
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-aqua" />
          <h2 className="mt-5 text-2xl font-semibold text-white">Your cart is empty.</h2>
          <p className="mt-3 text-white/62">Add a product before going to checkout.</p>
          <div className="mt-6">
            <LinkButton to="/products">Browse Products</LinkButton>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
          <div className="grid gap-4">
            {detailedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                  <img className="product-image-blend h-32 w-full rounded-lg object-contain sm:w-32" src={getProductImage(item.product, item.variant)} alt={item.product.name} />
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{item.product.name}</h2>
                      <div className="mt-3"><VariantSelector product={item.product} value={item.variant} onChange={value => updateVariant(item.id, value)} pricedOnly /></div>
                      <OptionRequest value={item.optionNotes || ""} onChange={value => updateOptionNotes(item.id, value)} />
                      <p className="mt-1 text-sm text-white/62">Pricing: {item.pricingType}</p>
                      <p className="mt-1 text-sm text-white/62">Unit price: {formatGBP(item.unitPrice)}</p>
                      {subtotal < MINIMUM_ORDER_AMOUNT && item.unitPrice < LOW_PRICE_ITEM_THRESHOLD && <p className="mt-2 text-xs leading-5 text-titanium">Orders should total at least {formatGBP(MINIMUM_ORDER_AMOUNT)}. Double this item or add another product.</p>}
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <QuantityControl value={item.quantity} min={item.product.minimumOrderQuantity || 1} max={getStockQuantity(item.product, item.variant) ?? 999} onChange={(value) => updateQuantity(item.id, value)} />
                      <strong className="text-2xl text-white">{formatGBP(item.lineTotal)}</strong>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-titanium/30 bg-titanium/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="h-fit p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Cart subtotal</p>
            <strong className="mt-2 block text-5xl text-white">{formatGBP(subtotal)}</strong>
            {subtotal < MINIMUM_ORDER_AMOUNT && <p className="mt-3 rounded-lg border border-titanium/25 bg-titanium/10 p-3 text-sm leading-6 text-titanium">Minimum order guidance: {formatGBP(MINIMUM_ORDER_AMOUNT)}. Add another product or increase the quantity.</p>}
            <p className="mt-3 text-sm leading-6 text-white/62">All prices are in GBP. Select Royal Mail delivery or an InPost locker at checkout.</p>
            <div className="mt-6 grid gap-3">
              <LinkButton to="/checkout">Proceed to Checkout</LinkButton>
              <LinkButton to="/products" variant="secondary">Continue Shopping</LinkButton>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

function ReviewCard({ review }) {
  return (
    <Card
      className="review-card overflow-hidden"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="review-image-frame" aria-label={review.caption || "Customer review screenshot"}>
        <img
          className="review-image"
          src={review.image}
          alt={review.caption || "Customer review"}
          draggable="false"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <p className="text-base font-semibold text-white">{review.caption || "Customer review screenshot"}</p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">{review.date || "Date placeholder"}</p>
      </div>
    </Card>
  );
}

function ReviewsPage() {
  return (
    <PageShell
      eyebrow="Reviews"
      title="Customer review screenshots."
      actions={
        <a
          href={UK_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white"
        >
          View More on Telegram
          <Send className="h-4 w-4" />
        </a>
      }
    >
      <div className="review-grid">
        {reviewScreenshots.map((review, index) => (
          <ReviewCard key={`${review.image}-${index}`} review={review} />
        ))}
      </div>
      <div className="review-telegram-cta">
        <a
          href={UK_TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-aqua/40 bg-aqua/15 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-titanium/50"
        >
          <Send className="h-5 w-5" />
          View More on Telegram
        </a>
      </div>
    </PageShell>
  );
}

function Field({ label, value, onChange, required = true, type = "text", textarea = false, placeholder = "" }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">
        {label}
        {required && <span className="text-titanium"> *</span>}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-lg border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-aqua/60"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          className="min-h-12 w-full rounded-lg border border-white/12 bg-white/[0.06] px-4 text-white outline-none transition focus:border-aqua/60"
        />
      )}
    </label>
  );
}

function CheckboxField({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-white/12 bg-white/[0.045] p-4 text-sm font-semibold text-white/76">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-aqua" />
      {children}
    </label>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/58">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={`${label}: ${option.label}${option.helper ? ` ${option.helper}` : ""}`}
            className={`rounded-lg border p-4 text-left transition ${
              value === option.value ? "border-aqua/70 bg-aqua/12 text-white" : "border-white/12 bg-white/[0.045] text-white/68"
            }`}
          >
            <strong>{option.label}</strong>
            {option.helper && <span className="mt-1 block text-sm text-white/52">{option.helper}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckoutPage({ onSaveOrder }) {
  const { items, subtotal, clearCart, updateVariant, updateOptionNotes } = useCart();
  const [step, setStep] = useState(1);
  const [checkout, setCheckout] = useState(emptyCheckout);
  const [errors, setErrors] = useState("");
  const [copied, setCopied] = useState(false);
  const isUk = checkout.country === "UK";
  const detailedItems = items.map(getCartItemDetails);
  const summary = useMemo(() => buildOrderSummary({ checkout, cartItems: items }), [checkout, items]);

  useEffect(() => {
    if (checkout.billingSame) {
      setCheckout((current) => ({
        ...current,
        billingAddress: current.country === "UK" && current.deliveryOption === "InPost Locker" ? current.inpostLocker : current.deliveryAddress,
      }));
    }
  }, [checkout.billingSame, checkout.country, checkout.deliveryOption, checkout.deliveryAddress, checkout.inpostLocker]);

  const setValue = (key, value) => {
    setCheckout((current) => ({ ...current, [key]: value }));
    setErrors("");
  };

  const validateStep = (targetStep = step) => {
    if (items.length === 0) return "Your cart is empty. Add products before checkout.";
    if (targetStep === 1) {
      if (!checkout.fullName.trim()) return "Full name is required.";
      if (!checkout.email.trim()) return "Email is required for delivery updates.";
      if (!/^\S+@\S+\.\S+$/.test(checkout.email.trim())) return "Enter a valid email address.";
      if (!checkout.phone.trim()) return "Phone number is required.";
      if (!checkout.country) return "Choose UK or USA.";
    }
    if (targetStep === 2) {
      if (isUk && checkout.deliveryOption === "InPost Locker" && !checkout.inpostLocker.trim()) {
        return "Add your preferred InPost locker name, address, or location.";
      }
      if ((!isUk || checkout.deliveryOption === "Royal Mail") && !checkout.deliveryAddress.trim()) {
        return "Delivery address is required.";
      }
    }
    if (targetStep === 3) {
      if (!checkout.billingSame && !checkout.billingAddress.trim()) return "Billing address is required.";
    }
    if (targetStep === 5) {
      if (isUk && !["whatsapp", "telegram"].includes(checkout.completionMethod)) return "Choose WhatsApp or Telegram.";
      if (!isUk && !["telegram", "sms"].includes(checkout.completionMethod)) return "Choose Telegram or SMS.";
    }
    return "";
  };

  const nextStep = () => {
    const problem = validateStep(step);
    if (problem) {
      setErrors(problem);
      return;
    }
    setStep((current) => Math.min(5, current + 1));
  };

  const completeOrder = () => {
    const problem = validateStep(5);
    if (problem) {
      setErrors(problem);
      return;
    }
    const order = {
      id: `OC-${Date.now().toString().slice(-6)}`,
      productName: `${items.length} cart item${items.length === 1 ? "" : "s"}`,
      total: subtotal,
      status: `Awaiting customer send via ${checkout.completionMethod}`,
      checkout,
      cartItems: items,
      createdAt: new Date().toISOString(),
    };
    onSaveOrder(order);
    if (checkout.completionMethod === "whatsapp") window.open(makeWhatsAppUrl(summary), "_blank", "noreferrer");
    if (checkout.completionMethod === "telegram") window.open(isUk ? UK_TELEGRAM_URL : USA_TELEGRAM_URL, "_blank", "noreferrer");
    if (checkout.completionMethod === "sms") window.location.href = makeSmsUrl(summary);
    clearCart();
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (items.length === 0) {
    return (
      <PageShell eyebrow="Checkout" title="Your cart is empty.">
        <Card className="p-8 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-aqua" />
          <p className="mt-4 text-white/68">Checkout starts after products are added to the cart.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton to="/products">Browse Products</LinkButton>
            <LinkButton to="/cart" variant="secondary">View Cart</LinkButton>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Checkout" title="Complete your order.">
      <div className="grid gap-7 lg:grid-cols-[0.78fr_0.42fr]">
        <Card className="p-5 sm:p-7">
          <div className="mb-7 grid gap-2 sm:grid-cols-5">
            {["Details", "Delivery", "Billing", "Review", "Complete"].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index + 1)}
                className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  step >= index + 1 ? "border-aqua/60 bg-aqua/12 text-white" : "border-white/12 text-white/45"
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Cart → Details → Delivery → Review → Complete</p>
          {subtotal < MINIMUM_ORDER_AMOUNT && <div className="mb-5 flex flex-col gap-3 rounded-lg border border-titanium/25 bg-titanium/10 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-6 text-titanium">Minimum order guidance: {formatGBP(MINIMUM_ORDER_AMOUNT)}. Add another product or increase the quantity if your order is below this amount.</p><LinkButton to="/products" variant="secondary">Add another product</LinkButton></div>}
          {errors && <p className="mb-5 rounded-lg border border-titanium/30 bg-titanium/10 p-4 text-sm font-semibold text-titanium">{errors}</p>}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="details" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" value={checkout.fullName} onChange={(value) => setValue("fullName", value)} />
                  <Field label="Email" type="email" value={checkout.email} onChange={(value) => setValue("email", value)} />
                  <Field label="Phone number" type="tel" value={checkout.phone} onChange={(value) => setValue("phone", value)} />
                  <Segmented
                    label="Country"
                    value={checkout.country}
                    onChange={(value) =>
                      setCheckout((current) => ({
                        ...current,
                        country: value,
                        deliveryOption: value === "UK" ? "Royal Mail" : "USA Delivery",
                        completionMethod: value === "UK" ? "whatsapp" : "telegram",
                      }))
                    }
                    options={[
                      { value: "UK", label: "UK" },
                      { value: "USA", label: "USA" },
                    ]}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="delivery" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5">
                {isUk ? (
                  <>
                    <Segmented
                      label="Delivery option"
                      value={checkout.deliveryOption}
                      onChange={(value) => setValue("deliveryOption", value)}
                      options={[
                        { value: "Royal Mail", label: "Royal Mail", helper: "Use your full delivery address" },
                        { value: "InPost Locker", label: "InPost Locker", helper: "Use your preferred locker details" },
                      ]}
                    />
                    {checkout.deliveryOption === "Royal Mail" ? (
                      <Field label="Full delivery address" value={checkout.deliveryAddress} onChange={(value) => setValue("deliveryAddress", value)} textarea />
                    ) : (
                      <Field
                        label="Preferred InPost locker name / address / location"
                        value={checkout.inpostLocker}
                        onChange={(value) => setValue("inpostLocker", value)}
                        textarea
                      />
                    )}
                  </>
                ) : (
                  <Field label="Full delivery address" value={checkout.deliveryAddress} onChange={(value) => setValue("deliveryAddress", value)} textarea />
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="billing" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5">
                <CheckboxField checked={checkout.billingSame} onChange={(value) => setValue("billingSame", value)}>
                  Billing address same as delivery address
                </CheckboxField>
                {!checkout.billingSame && (
                  <Field label="Billing address" value={checkout.billingAddress} onChange={(value) => setValue("billingAddress", value)} textarea />
                )}
                <Field label="Notes" value={checkout.notes} onChange={(value) => setValue("notes", value)} required={false} textarea />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="review" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5">
                <OrderReview checkout={checkout} items={detailedItems} subtotal={subtotal} />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="complete" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5">
                <p className="rounded-lg border border-white/12 bg-white/[0.045] p-4 leading-7 text-white/68">
                  No card details are collected here. Final order completion happens only when you send the generated message.
                </p>
                <Segmented
                  label="Send order by"
                  value={checkout.completionMethod}
                  onChange={(value) => setValue("completionMethod", value)}
                  options={
                    isUk
                      ? [
                          { value: "whatsapp", label: "WhatsApp", helper: "Direct order button" },
                          { value: "telegram", label: "Telegram", helper: "UK Telegram channel" },
                        ]
                      : [
                          { value: "telegram", label: "Telegram", helper: "@BRoneconnectHQ" },
                          { value: "sms", label: "SMS / Text", helper: USA_SMS_NUMBER },
                        ]
                  }
                />
                {checkout.completionMethod === "telegram" && (
                  <div>
                    <OrderSummary summary={summary} compact />
                    <button type="button" onClick={copySummary} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy Order Details"}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={completeOrder}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-titanium/45 bg-titanium/15 px-6 text-sm font-bold uppercase tracking-[0.14em] text-white"
                >
                  Complete Order
                  <Send className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {step < 5 && (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </Card>

        <aside>
          <Card className="sticky top-28 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Order summary</p>
            <div className="mt-5 grid gap-4">
              {detailedItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-4">
                  <img className="product-image-blend h-16 w-12 rounded-md object-contain" src={getProductImage(item.product, item.variant)} alt={item.product.name} />
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.product.name}</p>
                    <p className="mt-1 text-sm text-white/60">{item.quantity} × {formatGBP(item.unitPrice)}</p>
                    <strong className="text-white">{formatGBP(item.lineTotal)}</strong>
                  </div>
                  <div className="col-span-2">
                    <VariantSelector product={item.product} value={item.variant} onChange={value => updateVariant(item.id, value)} pricedOnly />
                    <OptionRequest value={item.optionNotes || ""} onChange={value => updateOptionNotes(item.id, value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-white/12 bg-white/[0.045] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">Final total</span>
              <strong className="mt-1 block text-4xl text-white">{formatGBP(subtotal)}</strong>
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

function OrderReview({ checkout, items, subtotal }) {
  const deliveryAddress =
    checkout.country === "UK" && checkout.deliveryOption === "InPost Locker" ? checkout.inpostLocker : checkout.deliveryAddress;
  const billingAddress = checkout.billingSame ? deliveryAddress : checkout.billingAddress;

  return (
    <div className="grid gap-5">
      <Card className="p-5">
        <h2 className="text-2xl font-semibold text-white">Customer details</h2>
        <div className="mt-4 grid gap-2 text-white/68">
          <p>Name: <strong className="text-white">{checkout.fullName}</strong></p>
          <p>Email: <strong className="text-white">{checkout.email}</strong></p>
          <p>Phone: <strong className="text-white">{checkout.phone}</strong></p>
          <p>Country: <strong className="text-white">{checkout.country}</strong></p>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-2xl font-semibold text-white">Delivery and billing</h2>
        <div className="mt-4 grid gap-2 text-white/68">
          <p>Carrier: <strong className="text-white">{checkout.country === "UK" ? checkout.deliveryOption : "USA delivery confirmation"}</strong></p>
          <p>Address / Locker: <strong className="text-white">{deliveryAddress}</strong></p>
          <p>Billing: <strong className="text-white">{billingAddress}</strong></p>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-2xl font-semibold text-white">Cart items</h2>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <strong className="text-white">{item.product.name}</strong>
                  <p className="mt-1 text-sm text-white/58">{item.variant} · {item.pricingType}</p>
                  {item.optionNotes && <p className="text-sm text-white/60">Option requests: {item.optionNotes}</p>}
                  <p className="mt-1 text-sm text-white/58">Qty {item.quantity} · {formatGBP(item.unitPrice)} each</p>
                </div>
                <strong className="text-xl text-white">{formatGBP(item.lineTotal)}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-xl font-semibold text-white">
          <span>Final total</span>
          <span>{formatGBP(subtotal)}</span>
        </div>
      </Card>
    </div>
  );
}

function OrderSummary({ summary, compact = false }) {
  return (
    <pre
      className={`whitespace-pre-wrap rounded-lg border border-white/12 bg-black/35 p-5 font-mono text-sm leading-7 text-white/78 ${
        compact ? "max-h-72 overflow-auto" : ""
      }`}
    >
      {summary}
    </pre>
  );
}

function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Speak to the right team.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6">
          <MessageCircle className="h-8 w-8 text-aqua" />
          <h2 className="mt-5 text-2xl font-semibold text-white">UK Telegram</h2>
          <p className="mt-3 text-white/62">UK Telegram channel</p>
          <a className="mt-5 inline-flex min-h-12 items-center rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white" href={UK_TELEGRAM_URL} target="_blank" rel="noreferrer">
            Open Telegram
          </a>
        </Card>
        <Card className="p-6">
          <Phone className="h-8 w-8 text-titanium" />
          <h2 className="mt-5 text-2xl font-semibold text-white">UK WhatsApp</h2>
          <p className="mt-3 text-white/62">Direct WhatsApp ordering</p>
          <a className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-titanium/35 bg-titanium/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white" href={makeWhatsAppUrl()} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </Card>
        <Card className="p-6">
          <Send className="h-8 w-8 text-aqua" />
          <h2 className="mt-5 text-2xl font-semibold text-white">USA Telegram</h2>
          <p className="mt-3 text-white/62">@BRoneconnectHQ</p>
          <a className="mt-5 inline-flex min-h-12 items-center rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white" href={USA_TELEGRAM_URL} target="_blank" rel="noreferrer">
            Open Telegram
          </a>
        </Card>
      </div>
    </PageShell>
  );
}

function AuthPage({ user, onAuth, onLogout }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const nextUser = {
      id: `member-${Date.now()}`,
      fullName: form.fullName || form.email.split("@")[0] || "1:1 Connect Member",
      email: form.email,
      phone: form.phone,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    onAuth(nextUser);
    setMessage(mode === "login" ? "Logged in successfully." : "Account created successfully.");
    navigateTo("/dashboard");
  };

  return (
    <PageShell eyebrow="Account" title="Login / Sign Up">
      <Card className="mx-auto max-w-xl p-6 sm:p-8">
        {user ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-aqua" />
            <h2 className="mt-4 text-2xl font-semibold text-white">You are signed in.</h2>
            <p className="mt-2 text-white/62">{user.email}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/dashboard" className="flex-1">Open Dashboard</LinkButton>
              <button type="button" onClick={onLogout} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-xs font-bold uppercase tracking-[0.14em] text-white">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-white/12 bg-white/[0.04] p-1">
              {["login", "signup"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`min-h-11 rounded-full text-xs font-bold uppercase tracking-[0.14em] ${
                    mode === item ? "bg-aqua/15 text-white" : "text-white/55"
                  }`}
                >
                  {item === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
            <form className="grid gap-5" onSubmit={submit}>
              {mode === "signup" && (
                <Field label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
              )}
              <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
              {mode === "signup" && (
                <Field label="Phone number" type="tel" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              )}
              <Field label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
              {message && <p className="text-sm font-semibold text-aqua">{message}</p>}
              <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-6 text-xs font-bold uppercase tracking-[0.14em] text-white" type="submit">
                {mode === "login" ? "Login" : "Create Account"}
                <LogIn className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </Card>
    </PageShell>
  );
}

function DashboardPage({ user, orders }) {
  if (!user) {
    return (
      <PageShell eyebrow="Dashboard" title="Login to view your dashboard.">
        <Card className="max-w-2xl p-6">
          <LayoutDashboard className="h-9 w-9 text-aqua" />
          <h2 className="mt-5 text-2xl font-semibold text-white">Your order hub is ready.</h2>
          <p className="mt-3 leading-7 text-white/66">
            Sign in to view saved checkout activity, recent order handoffs, and account details in one clean dashboard.
          </p>
          <div className="mt-6">
            <LinkButton to="/login">Login / Sign Up</LinkButton>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="User Dashboard" title={`Welcome, ${user.fullName || "1:1 Connect Member"}.`}>
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-6">
          <ShoppingBag className="h-7 w-7 text-aqua" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/50">Orders</p>
          <strong className="mt-2 block text-4xl text-white">{orders.length}</strong>
        </Card>
        <Card className="p-6">
          <User className="h-7 w-7 text-titanium" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/50">Account</p>
          <strong className="mt-2 block text-xl text-white">{user.email}</strong>
        </Card>
        <Card className="p-6">
          <ShieldCheck className="h-7 w-7 text-aqua" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/50">Status</p>
          <strong className="mt-2 block text-xl text-white">Active</strong>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-semibold text-white">Recent orders</h2>
        <div className="mt-5 grid gap-3">
          {orders.length ? (
            orders.slice(0, 6).map((order) => (
              <div key={order.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <strong className="text-white">{order.productName}</strong>
                  <span className="text-sm font-semibold text-titanium">{formatGBP(order.total)}</span>
                </div>
                <p className="mt-2 text-sm text-white/58">{order.status}</p>
              </div>
            ))
          ) : (
            <p className="text-white/62">No orders saved yet. Start checkout to create one.</p>
          )}
        </div>
      </Card>
    </PageShell>
  );
}

function PolicySection({ section }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
      {section.body?.map((paragraph) => (
        <p key={paragraph} className="mt-4 leading-7 text-white/66">
          {paragraph}
        </p>
      ))}
      {section.list && (
        <ul className="mt-4 grid gap-3 text-white/66">
          {section.list.map((item) => (
            <li key={item} className="flex gap-3 leading-7">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-aqua" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function PolicyPage({ eyebrow, title, intro, sections }) {
  return (
    <PageShell eyebrow={eyebrow} title={title}>
      <div className="grid gap-5 lg:grid-cols-[0.34fr_1fr]">
        <aside className="h-fit rounded-lg border border-aqua/25 bg-aqua/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-aqua">Effective Date</p>
          <p className="mt-2 text-lg font-semibold text-white">2 August 2026</p>
          <p className="mt-4 leading-7 text-white/62">{intro}</p>
          <p className="mt-4 text-sm leading-6 text-white/50">
            This page is provided as store policy information and should be reviewed for current UK consumer law before public use.
          </p>
        </aside>
        <div className="grid gap-5">
          {sections.map((section) => (
            <PolicySection key={section.title} section={section} />
          ))}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p className="mt-4 leading-7 text-white/66">
              For order support, tracking, refunds, or policy questions, contact 1:1 CONNECT through WhatsApp or Telegram.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={makeWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-titanium/35 bg-titanium/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </a>
              <a
                href={UK_TELEGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-aqua/35 bg-aqua/15 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                <Send className="h-4 w-4" />
                Telegram Support
              </a>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function NotFoundPage() {
  return (
    <PageShell eyebrow="404" title="Page not found.">
      <LinkButton to="/">Back Home</LinkButton>
    </PageShell>
  );
}

export default function App() {
  const path = usePathname();
  const [user, setUser] = useState(() => getStoredUser());
  const [orders, setOrders] = useState(() => getStoredOrders());

  useEffect(() => {
    const seo = getPageSeo(path, products);
    document.title = seo.title;
    document.documentElement.lang = 'en-GB';
    const setMeta = (selector, attribute, value) => document.querySelector(selector)?.setAttribute(attribute, value);
    setMeta('meta[name="description"]', 'content', seo.description);
    setMeta('meta[name="robots"]', 'content', seo.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow');
    for (const prefix of ['og', 'twitter']) {
      const key = prefix === 'og' ? 'property' : 'name';
      for (const field of ['title', 'description', 'image']) setMeta('meta[' + key + '="' + prefix + ':' + field + '"]', 'content', seo[field]);
    }
    setMeta('meta[property="og:url"]', 'content', seo.url);
    setMeta('meta[property="og:image:alt"]', 'content', seo.imageAlt);
    setMeta('meta[property="og:image:type"]', 'content', seo.imageType);
    setMeta('meta[name="twitter:image:alt"]', 'content', seo.imageAlt);
    setMeta('link[rel="canonical"]', 'href', seo.url);
    document.getElementById('page-schema')?.remove();
    if (seo.schema) {
      const script = document.createElement('script');
      script.id = 'page-schema'; script.type = 'application/ld+json';
      script.textContent = JSON.stringify(seo.schema);
      document.head.appendChild(script);
    }
  }, [path]);

  const saveOrder = (order) => {
    setOrders((current) => {
      const next = [order, ...current];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    navigateTo("/");
  };

  let page = <NotFoundPage />;
  if (path === "/") page = <HomePage />;
  if (path === "/products") page = <ProductsPage />;
  if (path.startsWith("/products/")) page = <ProductDetailsPage id={productIdFromPath(path)} />;
  if (path === "/cart") page = <CartPage />;
  if (path === "/reviews") page = <ReviewsPage />;
  if (path === "/checkout") page = <CheckoutPage onSaveOrder={saveOrder} />;
  if (path === "/contact") page = <ContactPage />;
  if (path === "/login") page = <AuthPage user={user} onAuth={setUser} onLogout={logout} />;
  if (path === "/dashboard") page = <DashboardPage user={user} orders={orders} />;
  if (path === "/terms") {
    page = (
      <PolicyPage
        eyebrow="Terms & Conditions"
        title="1:1 CONNECT - Terms & Conditions"
        intro="By placing an order with 1:1 CONNECT, you agree to these Terms & Conditions."
        sections={termsSections}
      />
    );
  }
  if (path === "/refund-policy") {
    page = (
      <PolicyPage
        eyebrow="Refunds & Cancellations"
        title="1:1 CONNECT - Refund & Cancellation Policy"
        intro="We aim to provide a transparent and straightforward buying experience. Please read this refund policy carefully before placing an order."
        sections={refundSections}
      />
    );
  }
  if (path === "/privacy-policy") {
    page = (
      <PolicyPage
        eyebrow="Privacy Policy"
        title="1:1 CONNECT - Privacy Policy"
        intro="This policy explains how customer information is used for orders, delivery, support, and compliance."
        sections={privacySections}
      />
    );
  }

  return (
    <CartProvider>
      <LoadingCurtain />
      <BackgroundFX />
      <Navbar />
      {page}
      <SiteFooter />
      <FloatingContactButtons />
    </CartProvider>
  );
}
