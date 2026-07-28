import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-shopkeeper.jpg";
import { Search, Download, Plus, TrendingUp, Package, BookOpen, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { cashflowByMonth, customers, formatNPR, products, recentSales } from "@/lib/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mohit Kirana Pasal" },
      { name: "description", content: "Today's sales, inventory alerts, outstanding Khata balances at a glance." },
      { property: "og:title", content: "Kirana Owner Dashboard" },
      { property: "og:description", content: "Sales, stock and Khata overview for Mohit Kirana Pasal." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, sub, tone = "default", icon: Icon }: any) {
  const toneMap: Record<string, string> = {
    default: "bg-card",
    primary: "bg-gradient-hero text-primary-foreground",
  };
  return (
    <div className={`rounded-2xl p-5 shadow-soft border border-border ${toneMap[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs font-medium ${tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</div>
          <div className={`mt-2 text-2xl font-display font-bold ${tone === "primary" ? "" : "text-foreground"}`}>{value}</div>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone === "primary" ? "bg-white/15" : "bg-accent text-primary"}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {sub && (
        <div className={`mt-3 text-xs flex items-center gap-1.5 ${tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const lowStock = products.filter((p) => p.packStock <= p.lowStockAt);
  const outstanding = customers.reduce((s, c) => s + c.balance, 0);
  const topDebtors = [...customers].filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 4);

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero shadow-elegant">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-8 lg:p-10 text-primary-foreground">
            <div className="text-sm opacity-80">Namaste, Mohit Dai 👋</div>
            <h1 className="mt-2 text-3xl lg:text-4xl font-display font-bold leading-tight">
              Aja ko bikri ramro chha
            </h1>
            <p className="mt-2 text-primary-foreground/80 text-sm max-w-md">
              Sales are up 12% vs. yesterday. 3 items need restocking and 4 Khata customers owe money.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/70" />
                <input placeholder="Search products, customers…" className="pl-9 pr-4 py-2.5 rounded-xl bg-white/15 text-sm text-primary-foreground placeholder:text-primary-foreground/60 border border-white/20 backdrop-blur w-64 outline-none focus:bg-white/25" />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-sm text-primary-foreground border border-white/20 hover:bg-white/25 transition">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary text-sm font-medium hover:opacity-95 transition shadow-soft">
                <Plus className="w-4 h-4" /> New Sale
              </button>
            </div>
          </div>
          <div className="hidden md:block relative h-72">
            <img src={heroImg} alt="Shopkeeper illustration" className="absolute inset-0 w-full h-full object-cover object-right" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Today's Sales" value={formatNPR(18420)} sub={<><ArrowUpRight className="w-3 h-3 text-success" /> <span className="text-success font-medium">+12%</span> vs yesterday</>} tone="primary" icon={TrendingUp} />
        <Stat label="Items Sold" value="127" sub={<><span className="text-success font-medium">+8</span> since morning</>} icon={Package} />
        <Stat label="Outstanding Khata" value={formatNPR(outstanding)} sub={<><span>Across </span><span className="font-medium">{customers.filter(c=>c.balance>0).length} customers</span></>} icon={BookOpen} />
        <Stat label="Low-Stock Alerts" value={String(lowStock.length)} sub={<><AlertTriangle className="w-3 h-3 text-warning" /> Restock today</>} icon={AlertTriangle} />
      </div>

      {/* Charts + right column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground">Cash flow</h3>
              <div className="text-xs text-muted-foreground">Cash · QR · Khata split by month</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" />Cash</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />QR</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" />Khata</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cashflowByMonth} barGap={4}>
              <XAxis dataKey="m" stroke="oklch(0.5 0.03 275)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.5 0.03 275)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "oklch(0.94 0.04 305 / 0.5)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="cash" fill="oklch(0.68 0.15 155)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="qr" fill="oklch(0.5 0.22 285)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="khata" fill="oklch(0.82 0.15 75)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">August summary</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success-foreground font-medium">+8%</span>
          </div>
          {[
            { label: "Income", value: 12320, color: "bg-primary" },
            { label: "Expense", value: 4540, color: "bg-warning" },
            { label: "Net", value: 7780, color: "bg-success" },
          ].map((row) => (
            <div key={row.label} className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-display font-semibold">{formatNPR(row.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${row.color} rounded-full`} style={{ width: `${Math.min(100, (row.value/12320)*100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Top Khata debtors</h3>
            <a className="text-xs text-primary font-medium" href="/khata">View all</a>
          </div>
          <div className="space-y-3">
            {topDebtors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: c.avatarColor }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">{formatNPR(c.balance)}</div>
                  <div className="text-xs text-muted-foreground">{c.lastActivity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent sales</h3>
            <a className="text-xs text-primary font-medium" href="/transactions">View all</a>
          </div>
          <div className="space-y-2">
            {recentSales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold ${
                  s.method === "cash" ? "bg-success/15 text-success-foreground" :
                  s.method === "qr" ? "bg-primary/15 text-primary" :
                  "bg-warning/15 text-warning-foreground"
                }`}>
                  {s.method.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.items.map(i=>i.name).join(", ")}</div>
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
                <div className="font-display font-bold">{formatNPR(s.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
