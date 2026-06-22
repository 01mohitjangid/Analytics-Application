import Link from "next/link";

/**
 * Storefront top bar. `overlay` floats it transparently over a hero image
 * (used on the homepage); the default solid variant is used elsewhere.
 */
export default function StoreHeader({ overlay = false }: { overlay?: boolean }) {
  const base = overlay
    ? "absolute inset-x-0 top-0 z-20 text-white"
    : "sticky top-0 z-20 border-b border-zinc-200 bg-white/90 text-zinc-900 backdrop-blur";

  const analyticsClass = overlay
    ? "rounded-full border border-white/80 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm shadow-sm transition-colors hover:bg-white hover:text-zinc-900"
    : "rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-zinc-700";

  return (
    <header className={base}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
        <nav className="flex items-center gap-6 font-medium uppercase tracking-wide">
          <Link href="/?cat=men" className="hover:opacity-70">
            Men
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/dashboard" className={analyticsClass}>
            Analytics ↗
          </Link>
        </div>
      </div>
    </header>
  );
}
