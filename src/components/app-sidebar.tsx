import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Receipt,
  BarChart3,
  Settings,
  Store,
  Sparkles,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, label: "Overview" },
  { title: "Bikri (POS)", url: "/pos", icon: ShoppingCart, label: "Quick sale" },
  { title: "Saman (Inventory)", url: "/inventory", icon: Package, label: "Products" },
  { title: "Khata", url: "/khata", icon: BookOpen, label: "Credit ledger" },
  { title: "Transactions", url: "/transactions", icon: Receipt, label: "Sales history" },
  { title: "Reports", url: "/reports", icon: BarChart3, label: "Insights" },
];

const settings = [{ title: "Settings", url: "/settings", icon: Settings, label: "Preferences" }];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 py-6 px-4 gap-6">
      <div className="flex items-center gap-2 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display font-bold text-sidebar-foreground leading-tight">Mohit Kirana</div>
          <div className="text-[11px] text-muted-foreground">Sandhikharka · Arghakhanchi</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 mb-1">Menu</div>
        {items.map((it) => {
          const active = isActive(it.url);
          return (
            <Link
              key={it.url}
              to={it.url}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
            >
              <it.icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
              <span>{it.title}</span>
            </Link>
          );
        })}

        <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 mb-1 mt-6">Settings</div>
        {settings.map((it) => {
          const active = isActive(it.url);
          return (
            <Link
              key={it.url}
              to={it.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              }`}
            >
              <it.icon className="w-4 h-4" />
              <span>{it.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-gradient-soft border border-border p-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary mx-auto flex items-center justify-center mb-2">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-xs font-medium text-foreground leading-snug">
          Unlock multi-store insights across all your Kirana branches
        </div>
        <button className="mt-3 w-full rounded-lg bg-gradient-primary text-primary-foreground text-xs font-medium py-2 shadow-soft hover:opacity-95 transition">
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
}
