import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Bell,
  ArrowRight,
  TrendingUp,
  Package,
  BookOpen,
  AlertTriangle,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Settings,
  ScanLine,
  Box,
  Store,
  ChevronDown,
  Calendar,
} from "lucide-react";
import shopScene from "@/assets/shop-scene.png";
import { formatNPR, useCustomers, useProducts, useSales } from "@/lib/store-data";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e8578]">
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[#f0eae0] bg-[#fcfaf6] p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const { data: recentSales = [] } = useSales();

  const lowStock = useMemo(() => products.filter((p) => p.packStock <= p.lowStockAt), [products]);
  const outstanding = useMemo(() => customers.reduce((s, c) => s + c.balance, 0), [customers]);
  const topDebtors = useMemo(() => {
    return [...customers]
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3);
  }, [customers]);

  const totals = useMemo(() => {
    return recentSales.reduce(
      (a, s) => ({
        all: a.all + s.total,
        cash: a.cash + (s.method === "cash" ? s.total : 0),
        qr: a.qr + (s.method === "qr" ? s.total : 0),
        khata: a.khata + (s.method === "khata" ? s.total : 0),
      }),
      { all: 0, cash: 0, qr: 0, khata: 0 }
    );
  }, [recentSales]);

  const todaySales = useMemo(() => {
    const todayStr = new Date().toDateString();
    return recentSales
      .filter((s) => {
        const parts = s.date.split(",")[0].split("/");
        if (parts.length < 3) return false;
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        return d.toDateString() === todayStr;
      })
      .reduce((a, s) => a + s.total, 0);
  }, [recentSales]);

  const stockValue = useMemo(() => {
    return products.reduce((a, p) => a + p.price * p.packStock, 0);
  }, [products]);

  const cashPct = totals.all ? Math.round((totals.cash / totals.all) * 100) : 0;
  const qrPct = totals.all ? Math.round((totals.qr / totals.all) * 100) : 0;
  const khataPct = totals.all ? Math.round((totals.khata / totals.all) * 100) : 0;

  // Formatted date string for top right pill
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Bar */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ff632b] text-white shadow-sm">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#2b2520] sm:text-3xl">
              Namaste, Dai! 👋
            </h1>
            <p className="text-xs text-[#8e8578] font-medium">Aja ko pasal kasto cha?</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#f0eae0] bg-[#fcfaf6] px-4 py-2.5 shadow-sm min-w-[280px]">
            <Search className="h-4 w-4 text-[#8e8578]" />
            <input
              placeholder="Search products, customers..."
              className="w-full bg-transparent text-sm text-[#2b2520] placeholder:text-[#8e8578] outline-none"
              readOnly
            />
          </div>

          {/* Notification icon badge */}
          <button className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#f0eae0] bg-[#fcfaf6] text-[#2b2520] shadow-sm hover:bg-[#f6f2ea] transition">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-[#ff632b] text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* Date Selector Pill */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#f0eae0] bg-[#fcfaf6] px-4 py-2 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#ff632b]/10 text-[#ff632b]">
              <Calendar className="h-4 w-4" />
            </span>
            <div className="text-left">
              <p className="text-[10px] text-[#8e8578] font-semibold leading-tight">
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </p>
              <p className="text-xs font-bold text-[#2b2520] leading-tight">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#8e8578] ml-1" />
          </div>
        </div>
      </header>

      {/* Row 1: Hero Sales Card + Right Bento Column (Stock & Khata) */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Column (8 cols): Hero Sales Card & Pasal ko Aaj ko Biseshan */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          {/* Today's sales - exact match */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#fcfaf6] border border-[#f0eae0] p-8 lg:p-10 shadow-sm min-h-[380px] flex-1 flex items-center">
            {/* Illustration on the right fading softly to the left */}
            <div 
              className="pointer-events-none absolute top-0 right-0 bottom-0 w-[68%] z-0"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,1) 70%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 15%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,1) 70%)"
              }}
            >
              <img
                src={shopScene}
                alt="Hamro Kirana Pasal illustration"
                className="h-full w-full object-cover object-right"
              />
            </div>

            {/* Left Content Area */}
            <div className="relative z-10 w-full max-w-[50%] flex flex-col justify-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8e8578]">
                  TODAY'S SALES
                </span>
                <div className="mt-2 text-4xl sm:text-5xl lg:text-[54px] font-bold font-display text-[#2b2520] tracking-tight leading-none">
                  {formatNPR(todaySales)}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#7a7164]">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span>{recentSales.length} bills cleared today</span>
                </div>
              </div>

              {/* 3 Pastel Payment Cards */}
              <div className="mt-7 grid grid-cols-3 gap-3.5 max-w-[440px]">
                {/* Cash Card */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#eef7f2]/90 border border-[#d2eadc] p-3.5 min-h-[140px] shadow-sm">
                  <div className="flex items-center">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#22c55e]/15 text-[#15803d]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                        <circle cx="12" cy="12" r="2.5"/>
                        <path d="M6 12h.01M18 12h.01"/>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534]">
                      Cash
                    </span>
                    <div className="mt-1 font-display text-lg font-bold text-[#1c1917]">
                      {formatNPR(totals.cash)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#15803d]">
                    <span>{cashPct}%</span>
                    <span>↗</span>
                  </div>
                </div>

                {/* QR Payment Card */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#f4f1fc]/90 border border-[#ded8f6] p-3.5 min-h-[140px] shadow-sm">
                  <div className="flex items-center">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#8b5cf6]/15 text-[#6d28d9]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="5" height="5" x="3" y="3" rx="1"/>
                        <rect width="5" height="5" x="16" y="3" rx="1"/>
                        <rect width="5" height="5" x="3" y="16" rx="1"/>
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                        <path d="M21 21v.01"/>
                        <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                        <path d="M3 12h.01"/>
                        <path d="M12 3h.01"/>
                        <path d="M12 16v.01"/>
                        <path d="M16 12h1"/>
                        <path d="M21 12v.01"/>
                        <path d="M12 21v-1"/>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b21b6]">
                      QR Payment
                    </span>
                    <div className="mt-1 font-display text-lg font-bold text-[#1c1917]">
                      {formatNPR(totals.qr)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#6d28d9]">
                    <span>{qrPct}%</span>
                    <span>↗</span>
                  </div>
                </div>

                {/* Khata Card */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#fdf2eb]/90 border border-[#fbd8c3] p-3.5 min-h-[140px] shadow-sm">
                  <div className="flex items-center">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f97316]/15 text-[#c2410c]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                        <path d="M8 7h6M8 11h8M8 15h5"/>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a3412]">
                      Khata
                    </span>
                    <div className="mt-1 font-display text-lg font-bold text-[#1c1917]">
                      {formatNPR(totals.khata)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#c2410c]">
                    <span>{khataPct}%</span>
                    <span>↗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASAL KO AAJ KO BISESHAN Banner */}
          <div className="rounded-3xl bg-[#fcfaf6] border border-[#f0eae0] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff632b]/15 text-[#ff632b]">
                <TrendingUp className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e8578]">
                  PASAL KO AAJ KO BISESHAN
                </h3>
                <p className="text-xs text-[#8e8578]">
                  Daily insights, top category & performance metrics.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3.5 rounded-2xl bg-white border border-[#f0eae0] p-4 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff632b]/10 text-[#ff632b] shrink-0">
                  <Package className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-[#8e8578]">Most Selling Category</p>
                  <p className="text-sm font-bold text-[#ff632b]">Grocery & Snacks</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white border border-[#f0eae0] p-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#22c55e]/10 text-[#15803d] shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-[#8e8578]">Daily Average Transaction</p>
                    <p className="text-sm font-bold text-[#15803d]">रु 650 <span className="text-xs font-normal text-[#8e8578]">/ customer</span> ↗</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Stock Overview & Outstanding Khata */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          {/* Stock Overview */}
          <Card className="flex-1 flex flex-col justify-between">
            <div>
              <Label>STOCK OVERVIEW</Label>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#22c55e]/15 text-[#15803d]">
                  <Box className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-3xl font-bold font-display text-[#2b2520]">{products.length}</p>
                  <p className="text-xs text-[#8e8578]">Total Products</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-[#8e8578] font-medium">Total Value</p>
                <p className="font-display text-xl font-bold text-[#2b2520] mt-0.5">{formatNPR(stockValue)}</p>
              </div>
            </div>

            {/* Low stock alert badge */}
            <div className="mt-4 rounded-2xl bg-[#fef5ea] border border-[#fae3c6] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-[#c2410c]">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#ea580c]" /> {lowStock.length} items are low in stock
              </p>
              <Link to="/inventory" className="mt-1.5 flex items-center gap-1 text-xs font-bold text-[#ea580c] hover:underline">
                View low stock →
              </Link>
            </div>
          </Card>

          {/* Outstanding Khata */}
          <Card className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Label>OUTSTANDING KHATA</Label>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ff632b]/15 text-[#ff632b]">
                  <BookOpen className="h-4 w-4" />
                </span>
                <p className="text-2xl font-bold font-display text-[#2b2520]">{formatNPR(outstanding)}</p>
              </div>
              <p className="text-xs text-[#8e8578]">Total Receivable</p>

              <ul className="mt-4 space-y-3">
                {topDebtors.map((k) => (
                  <li key={k.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff632b]/12 text-xs font-bold text-[#ff632b]">
                        {k.name.charAt(0)}
                      </span>
                      <span className="font-semibold text-[#2b2520]">{k.name}</span>
                    </div>
                    <span className="font-display font-bold text-[#2b2520]">{formatNPR(k.balance)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/khata"
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-bold text-[#ff632b] hover:underline"
            >
              View all Khata →
            </Link>
          </Card>
        </div>
      </div>

      {/* Row 2: Quick Actions & Start Selling */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Quick Actions (7 cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#fcfaf6] border border-[#f0eae0] p-6 shadow-sm">
          <Label>QUICK ACTIONS</Label>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "New Sale", sub: "Start billing", icon: ShoppingCart, to: "/pos", bg: "bg-[#ff632b]/10", text: "text-[#ff632b]" },
              { label: "Add Customer", sub: "New customer", icon: UserPlus, to: "/khata", bg: "bg-[#ff632b]/10", text: "text-[#ff632b]" },
              { label: "Add Product", sub: "New item", icon: PackagePlus, to: "/inventory", bg: "bg-[#ff632b]/10", text: "text-[#ff632b]" },
              { label: "Settings", sub: "Configure", icon: Settings, to: "/settings", bg: "bg-[#ff632b]/10", text: "text-[#ff632b]" },
            ].map(({ label, sub, icon: Icon, to, bg, text }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center text-center rounded-2xl bg-white border border-[#f0eae0] p-4 shadow-sm hover:border-[#ff632b]/40 hover:shadow-md transition"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${bg} ${text}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-bold text-[#2b2520]">{label}</p>
                <p className="text-[10px] text-[#8e8578]">{sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Start Selling (5 cols) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#fcfaf6] border border-[#f0eae0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <Label>START SELLING</Label>
            <p className="text-xs text-[#8e8578] mt-1">
              Search product, scan barcode or select from categories.
            </p>
            <Link
              to="/pos"
              className="mt-4 flex items-center justify-between rounded-2xl bg-white border border-[#f0eae0] px-4 py-3 shadow-sm hover:border-[#ff632b]/40 transition"
            >
              <div className="flex items-center gap-2.5 text-xs text-[#8e8578]">
                <Search className="h-4 w-4" />
                <span>Search product or scan barcode</span>
              </div>
              <ScanLine className="h-4 w-4 text-[#ff632b]" />
            </Link>
          </div>

          <Link
            to="/pos"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff632b] py-3.5 font-display text-sm font-bold text-white shadow-soft hover:bg-[#f0551e] transition"
          >
            Go to POS / Billing →
          </Link>
        </div>
      </div>

      {/* Row 3: Recent Sales, Payment Breakdown, Low Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sales */}
        <Card>
          <div className="flex items-center justify-between">
            <Label>RECENT SALES</Label>
            <Link to="/transactions" className="text-xs font-bold text-[#ff632b] hover:underline">
              View all →
            </Link>
          </div>

          <ul className="mt-4 space-y-3.5">
            {recentSales.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#2b2520]">{s.items[0]?.name || "Kirana Item"}</p>
                  <p className="text-[#8e8578] mt-0.5">
                    {s.date} · {s.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold text-[#2b2520]">{formatNPR(s.total)}</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                      s.method === "cash"
                        ? "bg-[#eef7f2] text-[#15803d]"
                        : s.method === "qr"
                          ? "bg-[#f4f1fc] text-[#6d28d9]"
                          : "bg-[#fdf2eb] text-[#c2410c]"
                    }`}
                  >
                    {s.method}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Payment Breakdown Donut Chart */}
        <Card>
          <Label>PAYMENT BREAKDOWN</Label>
          <div className="mt-4 flex items-center justify-center gap-6">
            {/* Conic Gradient Donut */}
            <div className="relative h-36 w-36 shrink-0">
              <div
                className="h-36 w-36 rounded-full"
                style={{
                  background: `conic-gradient(#22c55e 0 ${cashPct}%, #8b5cf6 ${cashPct}% ${cashPct + qrPct}%, #ff632b ${cashPct + qrPct}% 100%)`,
                  mask: "radial-gradient(circle, transparent 50px, black 51px)",
                  WebkitMask: "radial-gradient(circle, transparent 50px, black 51px)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-display text-base font-bold text-[#2b2520]">{formatNPR(totals.all)}</p>
                  <p className="text-[10px] text-[#8e8578]">Total Sales</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                <div>
                  <p className="font-bold text-[#2b2520]">Cash</p>
                  <p className="text-[10px] text-[#8e8578]">रु {totals.cash.toLocaleString()} ({cashPct}%)</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                <div>
                  <p className="font-bold text-[#2b2520]">QR Payment</p>
                  <p className="text-[10px] text-[#8e8578]">रु {totals.qr.toLocaleString()} ({qrPct}%)</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff632b]" />
                <div>
                  <p className="font-bold text-[#2b2520]">Khata</p>
                  <p className="text-[10px] text-[#8e8578]">रु {totals.khata.toLocaleString()} ({khataPct}%)</p>
                </div>
              </li>
            </ul>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <div className="flex items-center justify-between">
            <Label>LOW STOCK ALERTS</Label>
            <Link to="/inventory" className="text-xs font-bold text-[#ff632b] hover:underline">
              View all →
            </Link>
          </div>

          <ul className="mt-4 space-y-3">
            {lowStock.slice(0, 3).map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-2xl bg-white border border-[#f0eae0] p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.emoji || "📦"}</span>
                  <div>
                    <p className="text-xs font-bold text-[#2b2520]">{p.name}</p>
                    <p className="text-[10px] font-semibold text-[#ea580c]">Only {p.packStock} left in stock</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Footer info pill */}
      <footer className="flex items-center justify-between text-xs text-[#8e8578] pt-2">
        <div className="flex items-center gap-2 font-medium">
          <Store className="h-4 w-4 text-[#ff632b]" />
          <span>Hamro Kirana Pasal, Kirtipur</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔄 Sync last updated: just now</span>
        </div>
      </footer>
    </div>
  );
}
