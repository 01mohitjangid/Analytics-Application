import Link from "next/link";
import { img, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      data-product={product.id}
      className="group block overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 transition hover:border-zinc-200 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden">
        <span className="absolute left-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm">
          {product.badge}
        </span>
        {/* Plain img keeps remote Unsplash URLs config-free. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(product.image)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">{product.name}</h3>
            <p className="text-xs text-zinc-500">{product.colorway}</p>
          </div>
          <span className="text-sm font-semibold text-zinc-900">${product.price}</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c}
              className="h-4 w-4 rounded-full border border-zinc-200"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
