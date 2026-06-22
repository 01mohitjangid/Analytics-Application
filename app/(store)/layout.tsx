import Tracker from "../components/Tracker";
import StoreFooter from "../components/StoreFooter";

/**
 * Storefront layout. Loads the analytics tracker here so it runs on every store
 * page but NOT on the dashboard (which is the analytics tool, not tracked).
 */
export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {children}
      <StoreFooter />
      <Tracker />
    </div>
  );
}
