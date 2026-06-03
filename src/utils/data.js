// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const fmtTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ── Order status ─────────────────────────────────────────────────────────────
export const STATUS = {
  pending:    { label: 'Pending',    cls: 'badge-yellow' },
  processing: { label: 'Processing', cls: 'badge-blue'   },
  shipped:    { label: 'Shipped',    cls: 'badge-purple'  },
  delivered:  { label: 'Delivered',  cls: 'badge-green'   },
  cancelled:  { label: 'Cancelled',  cls: 'badge-red'     },
}

export const PAYMENT_STATUS = {
  pending:  { label: 'Pending',  cls: 'badge-yellow' },
  paid:     { label: 'Paid',     cls: 'badge-green'  },
  failed:   { label: 'Failed',   cls: 'badge-red'    },
  refunded: { label: 'Refunded', cls: 'badge-gray'   },
}

// ── Sample products (picsum images) ──────────────────────────────────────────
const p = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const PRODUCTS = [
  { _id:'p1',  name:'Swiss Chronograph Pro',    price:74999,  originalPrice:99999,  category:'Watches',     badge:'Best Seller', stock:12, rating:4.8, reviewCount:234, images:[p('wt1'),p('wt2'),p('wt3')], sizes:[], description:'Precision Swiss movement with sapphire crystal and 100m water resistance. A masterpiece on your wrist.' },
  { _id:'p2',  name:'Linen Silk Blazer',        price:28999,  originalPrice:41999,  category:'Fashion',     badge:'New',         stock:25, rating:4.6, reviewCount:89,  images:[p('jk1'),p('jk2')],         sizes:['XS','S','M','L','XL'], description:'Luxurious linen-silk blend with premium horn buttons. Unstructured silhouette for all-day comfort.' },
  { _id:'p3',  name:'Studio ANC Headphones',    price:37499,  originalPrice:49999,  category:'Electronics', badge:'Top Rated',   stock:8,  rating:4.9, reviewCount:512, images:[p('hp1'),p('hp2')],         sizes:[], description:'40-hour battery, industry-leading ANC, Hi-Res Audio certified. Built for audiophiles.' },
  { _id:'p4',  name:'Artisan Fragrance Set',    price:15749,  originalPrice:20999,  category:'Beauty',      badge:'Limited',     stock:30, rating:4.7, reviewCount:156, images:[p('pf1'),p('pf2')],         sizes:[], description:'Three signature fragrances inspired by coastal landscapes. Handcrafted in Grasse, France.' },
  { _id:'p5',  name:'Carbon Fibre Wallet',      price:10749,  originalPrice:null,   category:'Accessories', badge:null,          stock:50, rating:4.5, reviewCount:78,  images:[p('wl1'),p('wl2')],         sizes:[], description:'4mm ultra-slim carbon fibre bifold with RFID blocking. Lifetime warranty.' },
  { _id:'p6',  name:'Responsive Runner Elite',  price:24999,  originalPrice:32499,  category:'Footwear',    badge:'Trending',    stock:15, rating:4.8, reviewCount:342, images:[p('sn1'),p('sn2')],         sizes:['UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'], description:'Reactive foam technology with a sustainable recycled upper. Certified carbon neutral.' },
  { _id:'p7',  name:'Heritage Leather Duffle',  price:18249,  originalPrice:24999,  category:'Bags',        badge:'Sale',        stock:20, rating:4.6, reviewCount:93,  images:[p('bg1'),p('bg2')],         sizes:[], description:'Full-grain veg-tanned leather with solid brass fittings. Ages beautifully.' },
  { _id:'p8',  name:'Wellness Smart Ring',      price:49999,  originalPrice:66499,  category:'Tech',        badge:'New',         stock:6,  rating:4.4, reviewCount:61,  images:[p('rg1'),p('rg2')],         sizes:['5','6','7','8','9','10'], description:'Track HRV, SpO2, and sleep in titanium. 7-day battery, IP68 waterproof.' },
  { _id:'p9',  name:'Boucle Accent Chair',      price:62499,  originalPrice:83249,  category:'Home',        badge:'Best Seller', stock:5,  rating:4.7, reviewCount:47,  images:[p('ch1'),p('ch2')],         sizes:[], description:'Hand-loomed boucle on solid walnut frame. Ships fully assembled, ready to enjoy.' },
  { _id:'p10', name:'Titanium Ballpoint Pen',   price:7499,   originalPrice:null,   category:'Accessories', badge:null,          stock:100,rating:4.3, reviewCount:34,  images:[p('pn1'),p('pn2')],         sizes:[], description:'CNC-machined aerospace-grade titanium. Schmidt refill, writes continuously for 3 years.' },
  { _id:'p11', name:'Performance Polo',         price:6999,   originalPrice:9999,   category:'Fashion',     badge:'New',         stock:40, rating:4.5, reviewCount:72,  images:[p('pl1'),p('pl2')],         sizes:['XS','S','M','L','XL','XXL'], description:'Pima cotton performance polo with moisture-wicking finish. Anti-odour treated.' },
  { _id:'p12', name:'Pour-Over Coffee Set',     price:8999,   originalPrice:11999,  category:'Home',        badge:null,          stock:40, rating:4.6, reviewCount:118, images:[p('cf1'),p('cf2')],         sizes:[], description:'Handthrown stoneware dripper, carafe and two mugs. Dishwasher safe, microwave safe.' },
]

export const CATEGORIES = [
  { slug:'Watches',     label:'Watches',     icon:'⌚', count:48 },
  { slug:'Fashion',     label:'Fashion',     icon:'👔', count:124 },
  { slug:'Electronics', label:'Electronics', icon:'🎧', count:87 },
  { slug:'Beauty',      label:'Beauty',      icon:'✨', count:63 },
  { slug:'Footwear',    label:'Footwear',    icon:'👟', count:95 },
  { slug:'Bags',        label:'Bags',        icon:'👜', count:72 },
  { slug:'Accessories', label:'Accessories', icon:'💎', count:56 },
  { slug:'Tech',        label:'Tech',        icon:'💡', count:39 },
  { slug:'Home',        label:'Home',        icon:'🏠', count:28 },
]

export const REVIEWS = [
  { name:'Ananya Sharma',  role:'Fashion Designer', text:'cartato has completely elevated how I shop. Every product feels genuinely premium and arrives beautifully packaged.' },
  { name:'Rohan Kapoor',   role:'Tech Lead',        text:'The Smart Ring is incredible — replaced three other devices. COD made it risk-free. Absolutely worth it.' },
  { name:'Priya Nair',     role:'Interior Stylist', text:'Found pieces here I could not get anywhere else. The quality is consistently outstanding across every category.' },
  { name:'Arjun Mehta',    role:'Entrepreneur',     text:'Same-day dispatch, pristine packaging, and the product exceeded expectations. cartato is my go-to.' },
]

export const COUPONS = { cartato10:10, cartato20:20, WELCOME15:15, SAVE25:25, NEWUSER30:30 }
