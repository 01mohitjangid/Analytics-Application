import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-zinc-500 sm:flex-row">
        
        <p>Built by nature. Designed for comfort.</p>
        <Link href="/" className="hover:text-zinc-900">
          View analytics dashboard →
        </Link>
      </div>
    </footer>
  );
}
