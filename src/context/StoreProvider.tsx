import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartLine, CurrencyCode, Product, WishlistEntry } from "@/types";

type DrawerKind = "cart" | "wishlist" | "compare" | "search" | "filters" | null;

interface StoreContextValue {
  cart: CartLine[];
  wishlist: WishlistEntry[];
  compare: Product[];
  currency: CurrencyCode;
  drawer: DrawerKind;
  promoCode: string | null;
  discountRate: number;
  cartCount: number;
  cartSubtotal: number;
  setCurrency: (code: CurrencyCode) => void;
  openDrawer: (kind: Exclude<DrawerKind, null>) => void;
  closeDrawer: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  toggleCompare: (product: Product) => void
  isCompared: (productId: string) => boolean;
  clearCompare: () => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const PROMOS: Record<string, number> = {
  BOLGA10: 0.1,
  WEAVE15: 0.15,
  HARVEST20: 0.2,
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [compare, setCompare] = useState<Product[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  useEffect(() => {
    setCart(readLocal<CartLine[]>("vs.cart", []));
    setWishlist(readLocal<WishlistEntry[]>("vs.wishlist", []));
    setCompare(readLocal<Product[]>("vs.compare", []));
    setCurrency(readLocal<CurrencyCode>("vs.currency", "USD"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("vs.cart", JSON.stringify(cart));
    window.localStorage.setItem("vs.wishlist", JSON.stringify(wishlist));
    window.localStorage.setItem("vs.compare", JSON.stringify(compare));
    window.localStorage.setItem("vs.currency", JSON.stringify(currency));
  }, [hydrated, cart, wishlist, compare, currency]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const unitPrice = product.salePrice ?? product.price;
    setCart((lines) => {
      const existing = lines.find((l) => l.productId === product.id);
      if (existing) {
        return lines.map((l) =>
          l.productId === product.id
            ? {
                ...l,
                quantity: Math.min(l.quantity + quantity, Math.max(product.stockQuantity, 1)),
              }
            : l,
        );
      }
      return [
        ...lines,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: unitPrice,
          quantity,
          image: product.primaryImage,
          stockQuantity: product.stockQuantity,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((lines) =>
      quantity <= 0
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((lines) => lines.filter((l) => l.productId !== productId));
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((entries) =>
      entries.some((e) => e.productId === product.id)
        ? entries.filter((e) => e.productId !== product.id)
        : [
            ...entries,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.salePrice ?? product.price,
              image: product.primaryImage,
            },
          ],
    );
  }, []);

  const toggleCompare = useCallback((product: Product) => {
    setCompare((entries) =>
      entries.some((e) => e.id === product.id)
        ? entries.filter((e) => e.id !== product.id)
        : [...entries, product].slice(-4),
    );
  }, []);

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (PROMOS[normalized]) {
      setPromoCode(normalized);
      return true;
    }
    return false;
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const cartSubtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return {
      cart,
      wishlist,
      compare,
      currency,
      drawer,
      promoCode,
      discountRate: promoCode ? (PROMOS[promoCode] ?? 0) : 0,
      cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      cartSubtotal,
      setCurrency,
      openDrawer: (kind) => setDrawer(kind),
      closeDrawer: () => setDrawer(null),
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart: () => setCart([]),
      toggleWishlist,
      isWishlisted: (productId) => wishlist.some((e) => e.productId === productId),
      toggleCompare,
      isCompared: (productId) => compare.some((e) => e.id === productId),
      clearCompare: () => setCompare([]),
      applyPromo,
      clearPromo: () => setPromoCode(null),
    };
  }, [
    cart,
    wishlist,
    compare,
    currency,
    drawer,
    promoCode,
    addToCart,
    setQuantity,
    removeFromCart,
    toggleWishlist,
    toggleCompare,
    applyPromo,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
