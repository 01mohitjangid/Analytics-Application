"use client";

import { useState } from "react";
import { PRODUCTS, type ProductTab } from "@/lib/products";
import ProductCard from "./ProductCard";

const TABS: { key: ProductTab; label: string }[] = [
  { key: "best", label: "Best Selling" },
  { key: "new", label: "New Arrival" },
  { key: "hot", label: "Hot Items" },
];

export default function StoreGrid() {
  const [tab, setTab] = useState<ProductTab>("best");
  const products = PRODUCTS.filter((p) => p.tabs.includes(tab));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          BEST SELLING PRODUCT
        </h2>
        <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                tab === t.key
                  ? "bg-fuchsia-700 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
