import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus, Bell, MoreHorizontal, ArrowUpRight, TrendingUp, Package, BookOpen, AlertTriangle, Wifi } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie } from "recharts";
import { cashflowByMonth, customers, formatNPR, products, recentSales } from "@/lib/mock/data";
import { useState } from "react";

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

const tabs = ["Dashboard", "Analytics", "Charts", "Khata"] as const;

function Dashboard() {
  const [tab, setTab] = useState<typeof tabs[number]>("Dashboard");
  const lowStock = products.filter((p) => p.packStock <= p.lowStockAt);
  const outstanding = customers.reduce((s, c) => s + c.balance, 0);
  const topDebtors = [...customers].filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 4);

  const expenseSlice = [
    { name: "Grocery", value: 42, color: "oklch(0.65 0.22 25)" },
    { name: "Drinks", value: 22, color: "oklch(0.72 0.16 60)" },
    { name: "Snacks", value: 18, color: "oklch(0.58 0.2 300)" },
    { name: "Household", value: 12, color: "oklch(0.72 0.16 200)" },
    { name: "Other", value: 6, color: "oklch(0.5 0.02 275)" },
  ];

  return (
    <div className="p-5 lg:p-7 max-w-[1500px] mx-auto space-y-5">
      {/* Top bar: pill tabs + search + profile */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
          <div className="flex items-center gap-1 bg-card border border-border p-1 shadow-soft shrink-0 clip-notch">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-card border border-border px-4 py-2 shadow-soft w-64 clip-notch">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search products, customers…"
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <button className="w-10 h-10 rotate-45 bg-coral text-white flex items-center justify-center shadow-soft">
            <span className="text-lg font-bold leading-none -rotate-45">+</span>
          </button>
          <button className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center relative shadow-soft">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">2</span>
          </button>
          <div className="w-10 h-10 bg-gradient-iridescent border-2 border-card shadow-soft shape-hex" />

        </div>
      </header>

      {/* Greeting */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Namaste, Mohit Dai 👋 · Aja ko bikri ramro chha</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {customers.slice(0, 3).map((c) => (
              <div key={c.id} className="w-8 h-8 rounded-full border-2 border-background text-white text-xs font-semibold flex items-center justify-center" style={{ background: c.avatarColor }}>
                {c.name.charAt(0)}
              </div>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-soft hover:opacity-90">
            <Plus className="w-4 h-4" /> New Sale
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-card border border-border px-4 py-2 text-sm font-medium shadow-soft">
            Aug 2026 <span className="text-muted-foreground">▾</span>
          </button>

          <span className="text-sm text-muted-foreground pl-2 border-l border-border ml-1">My Store</span>
        </div>
      </div>

      {/* Main grid: left (balance+expenses) / middle (budget+expenses breakdown) / right (card+list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT — Balance card w/ iridescent orb + bar chart */}
        <section className="lg:col-span-5 rounded-3xl bg-card border border-border shadow-soft p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">Balance</h3>
            <button className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">×</button>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-iridescent shadow-elegant" />
          </div>

          <div className="mt-4 mx-auto flex items-center gap-1 rounded-full bg-muted p-1 w-fit">
            {["Cash", "QR", "Khata"].map((s, i) => (
              <button key={s} className={`px-4 py-1.5 rounded-full text-xs font-medium ${i === 0 ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{s}</button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-muted/60 p-4">
            <div className="text-xs text-muted-foreground">Profit in Aug 2026</div>
            <div className="text-3xl font-display font-bold mt-1">{formatNPR(53180)}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Expenses</div>
                <div className="text-sm font-semibold mt-0.5">{formatNPR(14400)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Income</div>
                <div className="text-sm font-semibold mt-0.5">{formatNPR(67500)}</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={140} className="mt-3">
              <BarChart data={cashflowByMonth.slice(0, 6)}>
                <XAxis dataKey="m" stroke="oklch(0.55 0.02 275)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: "oklch(0.94 0.01 285 / 0.6)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }} />
                <Bar dataKey="cash" fill="oklch(0.65 0.22 25)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qr" fill="oklch(0.58 0.2 300)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-coral" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:"oklch(0.58 0.2 300)"}} />Profit</span>
            </div>
          </div>
        </section>

        {/* MIDDLE column */}
        <section className="lg:col-span-4 space-y-5">
          {/* Monthly budget */}
          <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">Monthly Budget</h3>
              <div className="flex gap-1">
                <button className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"><MoreHorizontal className="w-4 h-4" /></button>
                <button className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">↗</button>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Spent</div>
                <div className="text-lg font-display font-bold mt-0.5">{formatNPR(24000)} <span className="text-muted-foreground text-sm font-normal">/ {formatNPR(40000)}</span></div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="text-lg font-display font-bold mt-0.5">{formatNPR(16000)}</div>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-coral via-orange-400 to-purple-400" style={{ width: "60%" }} />
            </div>
          </div>

          {/* Expenses breakdown w/ donut */}
          <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-lg">Expenses</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Income <span className="text-coral font-semibold">↑</span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted p-1 w-fit mb-3">
              {["Day","Week","Month","Year"].map((p,i)=>(
                <button key={p} className={`px-3 py-1 rounded-full text-xs font-medium ${i===0?"bg-primary text-primary-foreground":"text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie data={expenseSlice} innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {expenseSlice.map((s,i)=>(<Cell key={i} fill={s.color} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-xl font-display font-bold">{formatNPR(14400)}</div>
                </div>
                {expenseSlice.map((s)=>(
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{background:s.color}} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT column */}
        <section className="lg:col-span-3 space-y-5">
          {/* Iridescent card */}
          <div className="rounded-3xl p-5 bg-gradient-iridescent shadow-elegant text-white relative overflow-hidden aspect-[1.6/1]">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium opacity-90">Cash on hand</span>
              <Wifi className="w-4 h-4 opacity-90" />
            </div>
            <div className="mt-6 text-3xl font-display font-bold tracking-tight">{formatNPR(35400)}</div>
            <div className="mt-auto absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs opacity-90">
              <span>•••• 5688</span>
              <span className="font-semibold">MOHIT KC</span>
            </div>
          </div>

          <button className="w-full rounded-full bg-card border border-border py-3 text-sm font-medium shadow-soft flex items-center justify-center gap-2 hover:bg-muted transition">
            <Plus className="w-4 h-4" /> Add New Account
          </button>

          {/* Quick Khata */}
          <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
            <h3 className="font-display font-semibold">Quick Khata</h3>
            <div className="mt-3 flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Plus className="w-4 h-4" />
              </button>
              <div className="flex -space-x-2">
                {customers.slice(0, 5).map((c) => (
                  <div key={c.id} className="w-9 h-9 rounded-full border-2 border-card text-white text-xs font-semibold flex items-center justify-center" style={{ background: c.avatarColor }}>
                    {c.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Last transactions */}
          <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
            <h3 className="font-display font-semibold mb-3">Last Transactions</h3>
            <div className="space-y-3">
              {recentSales.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    s.method === "cash" ? "bg-success/15 text-success-foreground" :
                    s.method === "qr" ? "bg-accent text-accent-foreground" :
                    "bg-warning/20 text-warning-foreground"
                  }`}>{s.method.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.items[0].name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.method === "khata" ? "Khata" : "Sale"}</div>
                  </div>
                  <div className={`text-sm font-semibold ${s.method === "khata" ? "text-coral" : ""}`}>
                    {s.method === "khata" ? "-" : "+"}{formatNPR(s.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Secondary stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Sales", value: formatNPR(18420), sub: "+12% vs yesterday", icon: TrendingUp, tone: "coral" },
          { label: "Items Sold", value: "127", sub: "+8 since morning", icon: Package },
          { label: "Outstanding Khata", value: formatNPR(outstanding), sub: `${customers.filter(c=>c.balance>0).length} customers`, icon: BookOpen },
          { label: "Low-Stock Alerts", value: String(lowStock.length), sub: "Restock today", icon: AlertTriangle, tone: "warn" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-card border border-border p-4 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s.tone === "coral" ? "bg-coral/15 text-coral" :
                s.tone === "warn" ? "bg-warning/20 text-warning-foreground" :
                "bg-muted text-foreground"
              }`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-display font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Top debtors */}
      <div className="rounded-3xl bg-card border border-border shadow-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Top Khata debtors</h3>
          <a className="text-xs font-medium text-coral" href="/khata">View all</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topDebtors.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: c.avatarColor }}>
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.phone}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-coral">{formatNPR(c.balance)}</div>
                <div className="text-xs text-muted-foreground">{c.lastActivity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
