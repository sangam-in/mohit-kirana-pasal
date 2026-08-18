import { Link } from "@tanstack/react-router";
import {
  Home,
  ShoppingCart,
  Package,
  NotebookText,
  Receipt,
  LineChart,
  Settings,
  ChevronDown,
  Store,
  ArrowRight,
} from "lucide-react";
import basket from "@/assets/basket.jpg";

const nav = [
  { label: "Dashboard", icon: Home, to: "/" },
  { label: "Bikri / POS", icon: ShoppingCart, to: "/pos" },
  { label: "Saman", icon: Package, to: "/saman" },
  { label: "Khata", icon: NotebookText, to: "/khata" },
  { label: "Transactions", icon: Receipt, to: "/transactions" },
  { label: "Reports", icon: LineChart, to: "/reports" },
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

const base =
  "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const activeCls =
  "flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary";

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-8 bg-sidebar px-5 py-7 lg:flex">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Store className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-sidebar-foreground">
            Hamro Kirana
          </p>
          <p className="truncate text-xs text-muted-foreground">Management</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className={base}
            activeProps={{ className: activeCls }}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-3xl bg-accent/70 p-4">
          <img
            src={basket}
            alt="Basket full of groceries"
            loading="lazy"
            width={900}
            height={640}
            className="mx-auto h-24 w-auto object-contain mix-blend-multiply"
          />
          <p className="mt-2 font-display text-sm font-bold text-accent-foreground">
            Keep your stock updated
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add new products and never miss a sale.
          </p>
          <Link
            to="/saman"
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-soft"
          >
            Add Product <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-soft">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
            DS
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Dai Store</p>
            <p className="truncate text-xs text-muted-foreground">Owner</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
