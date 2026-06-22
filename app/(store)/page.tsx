import StoreHeader from "../components/StoreHeader";
import StoreGrid from "../components/StoreGrid";

const HERO_IMG =
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=80&auto=format&fit=crop";

export default function StoreHome() {
  return (
    <div>
      <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <StoreHeader overlay />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt="UA Dasher NZ collection"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6 text-white">
          <h1 className="max-w-xl font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            BUILT BY NATURE.
            <br />
            DESIGNED FOR COMFORT.
          </h1>
          <p className="mt-4 text-lg text-zinc-200">
            All-new Dasher NZ Collection
          </p>
          <div className="mt-8">
            <a
              href="/dashboard"
              data-cta="shop-collection"
              className="inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Analytics
            </a>
          </div>
        </div>
      </section>

      <div id="best-selling">
        <StoreGrid />
      </div>
    </div>
  );
}
