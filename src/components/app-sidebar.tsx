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
      {/* Brand — rotated square */}
      <Link
        to="/"
        className="w-11 h-11 rotate-45 bg-primary text-primary-foreground flex items-center justify-center shadow-soft"
      >
        <Store className="w-5 h-5 -rotate-45" />
      </Link>

      {/* Primary nav — squared rail with mixed corner treatments */}
      <nav className="mt-2 flex flex-col gap-1.5 bg-card border border-border p-2 shadow-soft clip-notch">
        {items.map((it, i) => {
          const active = isActive(it.url);
          // alternate shapes: square, cut-corner, chamfered
          const shape =
            i % 3 === 0 ? "rounded-none" : i % 3 === 1 ? "rounded-md" : "clip-notch";
          return (
            <Link
              key={it.url}
              to={it.url}
              title={it.title}
              className={`w-11 h-11 ${shape} flex items-center justify-center transition-all ${
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

      {/* Utility icons — small squares */}
      <div className="flex flex-col gap-1 mt-1">
        {utility.map((u) => (
          <button
            key={u.title}
            title={u.title}
            className="w-10 h-10 rounded-sm flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <u.icon className="w-[17px] h-[17px]" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <Link
          to="/settings"
          title="Settings"
          className={`w-10 h-10 rounded-sm flex items-center justify-center transition ${
            isActive("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="w-[17px] h-[17px]" />
        </Link>
        {/* Iridescent avatar as hex */}
        <div className="w-10 h-10 bg-gradient-iridescent shadow-soft shape-hex" />
      </div>
    </aside>
  );
}
