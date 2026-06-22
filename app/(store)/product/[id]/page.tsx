import Link from "next/link";
import { notFound } from "next/navigation";
import StoreHeader from "../../../components/StoreHeader";
import ProductCard from "../../../components/ProductCard";
import { getProduct, img, PRODUCTS } from "@/lib/products";

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div>
      <StoreHeader />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to store
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img(product.image, 900)}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="w-fit rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
              {product.badge}
            </span>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-zinc-900">
              {product.name}
            </h1>
            <p className="mt-1 text-zinc-500">{product.colorway}</p>
            <p className="mt-6 text-3xl font-semibold text-zinc-900">
              ${product.price}
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-zinc-700">Colors</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    aria-label={`Color ${c}`}
                    data-swatch={c}
                    className="h-8 w-8 rounded-full border border-zinc-200"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-zinc-700">Size</p>
              <div className="flex flex-wrap gap-2">
                {["7", "8", "9", "10", "11", "12"].map((s) => (
                  <button
                    key={s}
                    data-size={s}
                    className="h-11 w-11 rounded-lg border border-zinc-200 text-sm hover:border-zinc-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                data-action="add-to-cart"
                className="flex-1 rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Add to cart
              </button>
              <button
                data-action="wishlist"
                className="rounded-full border border-zinc-300 px-6 py-3.5 text-sm font-medium hover:bg-zinc-50"
              >
                ♥ Save
              </button>
            </div>

            <p className="mt-8 text-sm leading-6 text-zinc-500">
              Crafted for all-day comfort with a breathable knit upper and a
              responsive foam midsole. Part of the Dasher NZ collection.
            </p>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="mb-6 font-serif text-2xl font-bold text-zinc-900">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
