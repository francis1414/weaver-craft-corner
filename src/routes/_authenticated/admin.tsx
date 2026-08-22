import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Star,
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
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/categories", label: "Shop by craft", icon: FolderTree },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/homepage", label: "Homepage CMS", icon: BarChart3 },
  { to: "/admin/settings", label: "Store settings", icon: Settings },
];

function AdminLayout() {
  const { data, isLoading } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-4 py-8 lg:flex-row lg:px-8">
        <aside className="lg:w-60 lg:shrink-0">
          <Link to="/" className="block font-serif text-2xl">
            Vetastudio
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Back-office
          </p>
          <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to as "/admin"}
                activeOptions={{ exact: item.exact ?? false }}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:font-medium data-[status=active]:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 hidden border-t border-border pt-4 lg:block">
            <p className="truncate text-xs text-muted-foreground">{data.user?.email}</p>
            <Button variant="ghost" size="sm" className="mt-2 px-0" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
