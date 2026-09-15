import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin";
import { useRealtimeStore } from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Visitors", icon: TrendingUp },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/categories", label: "Shop by craft", icon: FolderTree },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/homepage", label: "Homepage CMS", icon: BarChart3 },
  { to: "/admin/seo", label: "SEO audit", icon: Search },
  { to: "/admin/settings", label: "Store settings", icon: Settings },
];

function AdminLayout() {
  const { data, isLoading } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  useRealtimeStore([
    "products",
    "orders",
    "reviews",
    "categories",
    "subscribers",
    "cms_homepage",
    "store_settings",
  ]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/admin-auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading back-office…
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-3xl">No merchant access</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The account {data?.user?.email} is signed in but has no administrator role for this
          store.
        </p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  const current = [...NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to)));
  const email = data.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF8F5] lg:flex">
      {/* Dark management rail */}
      <aside className="bg-[#1F1D1A] text-[#EFEBE4] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[268px] lg:shrink-0 lg:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FAF8F5] font-serif text-lg text-[#1F1D1A]">
            V
          </span>
          <span className="min-w-0">
            <Link to="/admin" className="block font-serif text-lg tracking-[0.14em]">
              VETA VERA STUDIO
            </Link>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-[#C29B38]">
              <ShieldCheck className="h-3 w-3" /> Admin suite
            </span>
          </span>
        </div>

        <p className="px-6 pt-6 pb-3 text-[10px] uppercase tracking-[0.24em] text-white/40">
          Management
        </p>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to as "/admin"}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white data-[status=active]:bg-[#C29B38] data-[status=active]:font-medium data-[status=active]:text-[#1F1D1A]"
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden gap-2 border-t border-white/10 px-4 py-4 lg:grid">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <Store className="h-[18px] w-[18px]" /> View live store
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 rounded-lg border border-destructive/40 px-3 py-2.5 text-sm text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
        </div>

        <div className="hidden items-center gap-3 border-t border-white/10 px-6 py-4 lg:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#4A5D4E] text-xs text-white">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm">{email}</span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
              Super admin
            </span>
          </span>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#EFEBE4] bg-[#FAF8F5]/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Admin <ChevronRight className="h-3 w-3" /> {current?.label ?? "Overview"}
            </p>
            <h2 className="mt-1 truncate font-serif text-2xl">{current?.label ?? "Overview"}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-[#1F1D1A] px-4 py-2 text-xs text-[#EFEBE4]">
              <span className="h-2 w-2 rounded-full bg-[#5FD08A]" /> Live sync on
            </span>
            <Link
              to="/admin/products"
              className="flex items-center gap-2 rounded-full bg-[#C29B38] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#1F1D1A]"
            >
              <Package className="h-3.5 w-3.5" /> Products
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-full border border-[#EFEBE4] bg-card px-4 py-2 text-xs"
            >
              <Store className="h-3.5 w-3.5" /> Live store
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-xs text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </header>

        <main className="min-w-0 px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
