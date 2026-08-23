export const products = [
  // 1. Electronics (Featured)
  {
    id: 1,
    name: "Sony WH-1000XM5",
    category: "Electronics",
    description: "Wireless noise cancelling headphones with industry-leading audio clarity",
    price: 29990,
    rating: 4.7,
    priceStatus: "8% below average",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    specifications: {
      type: "Over-Ear Wireless Headphones",
      connectivity: "Bluetooth 5.2 & 3.5mm",
      battery: "Up to 30 hours",
      weight: "250 g",
    },
  },
  // 2. Fashion (Featured)
  {
    id: 2,
    name: "Minimal Leather Backpack",
    category: "Fashion",
    description: "Everyday full-grain leather backpack designed for modern commuters",
    price: 5499,
    rating: 4.6,
    priceStatus: "5% below average",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Full-Grain Leather",
      color: "Cognac Brown",
      size: "18L (15.6\" Laptop Fit)",
      style: "Minimalist Commuter",
    },
  },
  // 3. Home & Living (Featured)
  {
    id: 3,
    name: "Ceramic Table Lamp",
    category: "Home & Living",
    description: "Warm architectural table lamp crafted with matte ceramic finish",
    price: 2499,
    rating: 4.5,
    priceStatus: "12% below average",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Matte Ceramic & Linen",
      dimensions: "18 × 18 × 32 cm",
      color: "Warm White",
      style: "Minimalist Modern",
    },
  },
  // 4. Beauty (Featured)
  {
    id: 4,
    name: "Daily Skincare Set",
    category: "Beauty",
    description: "Nourishing botanical essentials for radiant, balanced skin",
    price: 1899,
    rating: 4.8,
    priceStatus: "7% below average",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    specifications: {
      skinType: "All Skin Types",
      volume: "3 × 50 ml Set",
      keyIngredient: "Niacinamide & Botanicals",
      formulation: "Complete 3-Step Routine",
    },
  },

  // 5. Electronics
  {
    id: 5,
    name: "Apple AirPods Pro (2nd Gen)",
    category: "Electronics",
    description: "Active noise cancellation with adaptive audio and spatial sound",
    price: 22900,
    rating: 4.8,
    priceStatus: "6% below average",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    specifications: {
      type: "In-Ear Wireless Earbuds",
      connectivity: "Bluetooth 5.3",
      battery: "Up to 30 hours (with case)",
      weight: "50.8 g (with case)",
    },
  },
  // 6. Electronics
  {
    id: 6,
    name: "Logitech MX Master 3S",
    category: "Electronics",
    description: "Precision ergonomic wireless mouse with quiet electromagnetic scroll",
    price: 8995,
    rating: 4.6,
    priceStatus: "10% below average",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    specifications: {
      type: "Ergonomic Wireless Mouse",
      connectivity: "Bluetooth & Logi Bolt",
      battery: "Up to 70 days",
      weight: "141 g",
    },
  },
  // 7. Electronics
  {
    id: 7,
    name: "Kindle Paperwhite (16 GB)",
    category: "Electronics",
    description: "Glare-free 6.8-inch display with adjustable warm light for reading",
    price: 14999,
    rating: 4.5,
    priceStatus: "Near average",
    image: "https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=800&q=80",
    specifications: {
      type: "6.8\" Glare-Free E-Reader",
      connectivity: "Wi-Fi 2.4/5.0 GHz",
      battery: "Up to 10 weeks",
      weight: "205 g",
    },
  },

  // 8. Fashion
  {
    id: 8,
    name: "Classic Denim Jacket",
    category: "Fashion",
    description: "Timeless relaxed-fit denim jacket made from 100% organic cotton",
    price: 3499,
    rating: 4.4,
    priceStatus: "4% below average",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "100% Organic Cotton Denim",
      color: "Washed Indigo",
      size: "Regular Fit (S–XL)",
      style: "Classic Vintage",
    },
  },
  // 9. Fashion
  {
    id: 9,
    name: "Everyday Leather Sneakers",
    category: "Fashion",
    description: "Minimal low-top sneakers crafted with premium Italian leather",
    price: 4999,
    rating: 4.7,
    priceStatus: "9% below average",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Italian Calfskin Leather",
      color: "Chalk White",
      size: "EU 40–45",
      style: "Low-Top Casual",
    },
  },
  // 10. Fashion
  {
    id: 10,
    name: "Canvas Crossbody Bag",
    category: "Fashion",
    description: "Lightweight structured crossbody bag with brass hardware accents",
    price: 2199,
    rating: 4.3,
    priceStatus: "Near average",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Heavy-Duty Canvas & Brass",
      color: "Olive Sand",
      size: "5L Compact",
      style: "Urban Everyday",
    },
  },

  // 11. Home & Living
  {
    id: 11,
    name: "Minimal Wooden Side Table",
    category: "Home & Living",
    description: "Solid oak accent table with tapered legs and warm satin finish",
    price: 6899,
    rating: 4.6,
    priceStatus: "8% below average",
    image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Solid Natural Oak",
      dimensions: "45 × 45 × 52 cm",
      color: "Natural Oak",
      style: "Scandinavian Modern",
    },
  },
  // 12. Home & Living
  {
    id: 12,
    name: "Linen Cushion Set",
    category: "Home & Living",
    description: "Pair of breathable pure European linen pillow covers with feather insert",
    price: 1499,
    rating: 4.4,
    priceStatus: "3% below average",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "100% European Linen",
      dimensions: "45 × 45 cm (Set of 2)",
      color: "Oatmeal Beige",
      style: "Neutral Contemporary",
    },
  },
  // 13. Home & Living
  {
    id: 13,
    name: "Modern Desk Organizer",
    category: "Home & Living",
    description: "Modular concrete and walnut desk tray set for streamlined workspaces",
    price: 1299,
    rating: 4.2,
    priceStatus: "6% below average",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    specifications: {
      material: "Cast Concrete & Solid Walnut",
      dimensions: "28 × 12 × 4 cm",
      color: "Charcoal Grey / Walnut",
      style: "Modular Modern",
    },
  },

  // 14. Beauty
  {
    id: 14,
    name: "Hydrating Face Serum",
    category: "Beauty",
    description: "Triple hyaluronic acid formula for deep, lightweight hydration",
    price: 1249,
    rating: 4.9,
    priceStatus: "11% below average",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    specifications: {
      skinType: "Dry, Sensitive & Normal",
      volume: "30 ml",
      keyIngredient: "Triple Hyaluronic Acid",
      formulation: "Lightweight Water-Gel Serum",
    },
  },
  // 15. Beauty
  {
    id: 15,
    name: "Gentle Cleansing Foam",
    category: "Beauty",
    description: "pH-balanced botanical cleanser that purifies without drying",
    price: 899,
    rating: 4.5,
    priceStatus: "4% below average",
    image: "https://images.unsplash.com/photo-1556228722-d0b5d0383188?auto=format&fit=crop&w=800&q=80",
    specifications: {
      skinType: "Sensitive, Oily & Normal",
      volume: "150 ml",
      keyIngredient: "Centella & Green Tea",
      formulation: "pH 5.5 Foaming Gel",
    },
  },
  // 16. Beauty
  {
    id: 16,
    name: "Everyday Barrier Moisturizer",
    category: "Beauty",
    description: "Ceramide-rich soothing cream designed to strengthen the skin barrier",
    price: 1450,
    rating: 4.7,
    priceStatus: "Near average",
    image: "https://images.unsplash.com/photo-1608248597359-bb436a53cb85?auto=format&fit=crop&w=800&q=80",
    specifications: {
      skinType: "Dry, Flaky & Barrier-Compromised",
      volume: "80 ml",
      keyIngredient: "Ceramides & Squalane",
      formulation: "Rich Non-Greasy Cream",
    },
  },
];

export default products;
