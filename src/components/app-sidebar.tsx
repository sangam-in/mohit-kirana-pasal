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
  Search,
  Globe,
  Shield,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bikri (POS)", url: "/pos", icon: ShoppingCart },
  { title: "Saman (Inventory)", url: "/inventory", icon: Package },
  { title: "Khata", url: "/khata", icon: BookOpen },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const utility = [
  { title: "Search", icon: Search },
  { title: "Security", icon: Shield },
  { title: "Global", icon: Globe },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <aside className="hidden lg:flex flex-col w-20 shrink-0 h-screen sticky top-0 py-6 px-3 gap-4 items-center bg-transparent">
      {/* Brand */}
      <Link to="/" className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-soft">
        <Store className="w-5 h-5" />
      </Link>

      {/* Primary nav pill container */}
      <nav className="mt-2 flex flex-col gap-1.5 rounded-full bg-card border border-border p-2 shadow-soft">
        {items.map((it) => {
          const active = isActive(it.url);
          return (
            <Link
              key={it.url}
              to={it.url}
              title={it.title}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <it.icon className="w-[18px] h-[18px]" strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      {/* Utility icons */}
      <div className="flex flex-col gap-1 mt-1">
        {utility.map((u) => (
          <button
            key={u.title}
            title={u.title}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <u.icon className="w-[17px] h-[17px]" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Link
          to="/settings"
          title="Settings"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
            isActive("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="w-[17px] h-[17px]" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-iridescent border-2 border-card shadow-soft" />
      </div>
    </aside>
  );
}
