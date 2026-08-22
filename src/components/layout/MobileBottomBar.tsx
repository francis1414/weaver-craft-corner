import { Link } from "@tanstack/react-router";
import { Heart, Scale, Search, ShoppingBag, Store } from "lucide-react";

import { useStore } from "@/context/StoreProvider";

export function MobileBottomBar() {
  const { cartCount, wishlist, compare, openDrawer } = useStore();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <Link
        to="/shop"
        className="flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em]"
      >
        <Store size={17} /> Shop
      </Link>
      <Link
        to="/shop"
        className="flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em]"
      >
        <Search size={17} /> Search
      </Link>
      <BarButton label="Saved" count={wishlist.length} onClick={() => openDrawer("wishlist")}>
        <Heart size={17} />
      </BarButton>
      <BarButton label="Compare" count={compare.length} onClick={() => openDrawer("compare")}>
        <Scale size={17} />
      </BarButton>
      <BarButton label="Cart" count={cartCount} onClick={() => openDrawer("cart")}>
        <ShoppingBag size={17} />
      </BarButton>
    </nav>
  );
}

function BarButton({
  label,
  count,
  onClick,
  children,
}: {
  label: string;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em]"
    >
      {children}
      {label}
      {count > 0 && (
        <span className="absolute right-4 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] text-background">
          {count}
        </span>
      )}
    </button>
  );
}
