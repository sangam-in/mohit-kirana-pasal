import type { ComponentType, ReactNode } from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-border/60 bg-card p-5 shadow-soft ${className}`}
    >
      {children}
    </section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">{action}</div>
    </header>
  );
}

export function TopBarBits() {
  return (
    <>
      <div className="hidden items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search products, customers..."
          className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <button className="relative grid h-12 w-12 place-items-center rounded-2xl border border-border/60 bg-card shadow-soft">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          3
        </span>
      </button>
      <div className="hidden items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-2 shadow-soft sm:flex">
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">आजको मिति</p>
          <p className="font-display text-sm font-semibold">May 20, 2025</p>
        </div>
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}

export function Pill({ tone, children }: { tone: "success" | "info" | "primary" | "warning"; children: ReactNode }) {
  const map = {
    success: "bg-success/12 text-success",
    info: "bg-info/12 text-info",
    primary: "bg-primary/12 text-primary",
    warning: "bg-warning/25 text-accent-foreground",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

const tints = [
  "bg-primary/12 text-primary",
  "bg-success/12 text-success",
  "bg-info/12 text-info",
  "bg-warning/25 text-accent-foreground",
];

/** Friendly rounded product tile, in the spirit of the Hamro Kirana icon set. */
export function ProductIcon({
  name,
  icon: Icon,
  size = "md",
}: {
  name: string;
  icon: ComponentType<{ className?: string }>;
  size?: "sm" | "md" | "lg";
}) {
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const tint = tints[seed % tints.length];
  const dims =
    size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-16 w-16 rounded-3xl" : "h-11 w-11 rounded-2xl";
  const ic = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <span className={`grid shrink-0 place-items-center ${dims} ${tint}`}>
      <Icon className={ic} />
    </span>
  );
}
