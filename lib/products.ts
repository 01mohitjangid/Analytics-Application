export type ProductTab = "best" | "new" | "hot";

export interface Product {
  id: string;
  name: string;
  colorway: string;
  price: number;
  badge: string;
  colors: string[];
  image: string;
  category: "men" | "women";
  tabs: ProductTab[];
}

const IMG_BASE = "https://images.unsplash.com/";

export function img(id: string, w = 600): string {
  return `${IMG_BASE}${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const PRODUCTS: Product[] = [
  {
    id: "dasher-nz-crimson",
    name: "Dasher NZ Crimson",
    colorway: "University Red/White",
    price: 142,
    badge: "Top Rated",
    colors: ["#dc2626", "#111827", "#f3f4f6"],
    image: "photo-1542291026-7eec264c27ff",
    category: "men",
    tabs: ["best", "hot"],
  },
  {
    id: "superrep-volt",
    name: "SuperRep Volt",
    colorway: "Volt/Black",
    price: 135,
    badge: "Top Rated",
    colors: ["#a3e635", "#111827"],
    image: "photo-1606107557195-0e29a4b5b4aa",
    category: "men",
    tabs: ["best", "new"],
  },
  {
    id: "breezer-point",
    name: "Breezer Point",
    colorway: "Burgundy/Cream",
    price: 154,
    badge: "Top Rated",
    colors: ["#7f1d1d", "#fde68a", "#111827"],
    image: "photo-1525966222134-fcfa99b8ae77",
    category: "women",
    tabs: ["best", "hot", "new"],
  },
  {
    id: "airmax-sunset",
    name: "AirMax Sunset",
    colorway: "Orange/Sail",
    price: 180,
    badge: "Top Rated",
    colors: ["#f97316", "#f5f5f4", "#1d4ed8"],
    image: "photo-1514989940723-e8e51635b782",
    category: "men",
    tabs: ["best", "hot"],
  },
  {
    id: "shadow-pastel",
    name: "Shadow Pastel",
    colorway: "Multi/Pastel",
    price: 122,
    badge: "New",
    colors: ["#fbcfe8", "#bfdbfe", "#fde68a"],
    image: "photo-1595950653106-6c9ebd614d3a",
    category: "women",
    tabs: ["new", "hot"],
  },
  {
    id: "trail-247-olive",
    name: "Trail 247 Olive",
    colorway: "Olive/Black",
    price: 118,
    badge: "Top Rated",
    colors: ["#4d7c0f", "#111827"],
    image: "photo-1539185441755-769473a23570",
    category: "men",
    tabs: ["best"],
  },
  {
    id: "airmax-ultra-sail",
    name: "AirMax Ultra Sail",
    colorway: "Sail/Crimson",
    price: 165,
    badge: "New",
    colors: ["#f5f5f4", "#ef4444"],
    image: "photo-1600185365926-3a2ce3cdb9eb",
    category: "women",
    tabs: ["new"],
  },
  {
    id: "court-smash-white",
    name: "Court Smash White",
    colorway: "Triple White",
    price: 99,
    badge: "Hot",
    colors: ["#f8fafc", "#e5e7eb"],
    image: "photo-1608231387042-66d1773070a5",
    category: "men",
    tabs: ["hot", "best"],
  },
  {
    id: "force-wheat",
    name: "Force Wheat",
    colorway: "Wheat/Black",
    price: 138,
    badge: "Top Rated",
    colors: ["#b45309", "#111827", "#fef3c7"],
    image: "photo-1549298916-b41d501d3772",
    category: "men",
    tabs: ["best", "hot"],
  },
  {
    id: "retro-high-shattered",
    name: "Retro High Shattered",
    colorway: "Black/Starfish",
    price: 210,
    badge: "Hot",
    colors: ["#111827", "#ea580c", "#f9fafb"],
    image: "photo-1556906781-9a412961c28c",
    category: "women",
    tabs: ["hot", "new"],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
