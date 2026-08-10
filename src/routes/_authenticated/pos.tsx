import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Trash2, Printer, Wifi, Wallet, BookOpen, QrCode, Volume2, Minus, Plus, ScanLine } from "lucide-react";
import { customers, formatNPR, products, type PaymentMethod, type Product } from "@/lib/mock/data";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({
    meta: [
      { title: "Quick Sale — Mohit Kirana Pasal" },
      { name: "description", content: "Fast Kirana billing counter with Cash, QR and Khata payments." },
      { property: "og:title", content: "Quick Sale Counter" },
      { property: "og:description", content: "Ring up sales in under 3 seconds with barcode, single-unit and Khata support." },
    ],
  }),
  component: POS,
});

interface CartLine {
  product: Product;
  qty: number;
  unit: "pack" | "piece";
}

function POS() {
  const [query, setQuery] = useState("");
  const [singleUnit, setSingleUnit] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([
    { product: products[0], qty: 2, unit: "pack" },
    { product: products[6], qty: 3, unit: "piece" },
  ]);
  const [method, setMethod] = useState<PaymentMethod>("qr");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [awaitingQR, setAwaitingQR] = useState(false);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode.includes(query)),
    [query]
  );

  const addToCart = (p: Product) => {
    const unit: "pack" | "piece" = singleUnit && p.looseUnitsPerPack ? "piece" : "pack";
    setCart((prev) => {
      const found = prev.find((c) => c.product.id === p.id && c.unit === unit);
      if (found) return prev.map((c) => (c === found ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { product: p, qty: 1, unit }];
    });
  };

  const setQty = (idx: number, delta: number) =>
    setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  const remove = (idx: number) => setCart((prev) => prev.filter((_, i) => i !== idx));

  const priceOf = (line: CartLine) =>
    line.unit === "piece" && line.product.looseUnitsPerPack
      ? Math.round(line.product.price / line.product.looseUnitsPerPack)
      : line.product.price;
  const total = cart.reduce((s, l) => s + priceOf(l) * l.qty, 0);

  const checkout = () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (method === "khata" && !customerId) return toast.error("Select a Khata customer first");
    if (method === "qr") {
      setAwaitingQR(true);
      setTimeout(() => {
        setAwaitingQR(false);
        toast.success("Payment bhayeko chha ✓", { description: `${formatNPR(total)} received via QR` });
        setCart([]);
      }, 2500);
      return;
    }
    toast.success(method === "cash" ? "Cash sale recorded" : "Khata updated & SMS sent", { description: formatNPR(total) });
    setCart([]);
    setCustomerId(undefined);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Quick Sale</h1>
          <p className="text-sm text-muted-foreground">Bikri sakau chito — Cash · QR · Khata</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-muted">
          <ScanLine className="w-4 h-4 text-primary" /> Scan barcode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or scan barcode…"
                className="pl-9 pr-4 py-2.5 w-full rounded-xl bg-card border border-border text-sm outline-none focus:border-primary transition"
              />
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border cursor-pointer text-sm">
              <input type="checkbox" checked={singleUnit} onChange={(e) => setSingleUnit(e.target.checked)} className="accent-primary" />
              Single Unit mode
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((p) => {
              const low = p.packStock <= p.lowStockAt;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group text-left rounded-2xl bg-card border border-border p-3 hover:border-primary hover:shadow-soft transition"
                >
                  <div className="aspect-square rounded-xl bg-gradient-soft flex items-center justify-center text-4xl mb-2 group-hover:scale-105 transition">
                    {p.emoji}
                  </div>
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-display font-bold text-primary">{formatNPR(p.price)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${low ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                      {p.packStock} left
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-card border border-border shadow-soft sticky top-6">
            <div className="p-5 border-b border-border">
              <h3 className="font-display font-semibold">Current sale</h3>
              <div className="text-xs text-muted-foreground">{cart.length} items</div>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-3 space-y-2">
              {cart.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10">Tap items to add · Aja ko bikri dekhaunu…</div>
              )}
              {cart.map((line, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted">
                  <div className="w-10 h-10 rounded-lg bg-gradient-soft flex items-center justify-center text-xl">{line.product.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{line.product.name} <span className="text-xs text-muted-foreground">{line.unit === "piece" ? "(single)" : ""}</span></div>
                    <div className="text-xs text-muted-foreground">{formatNPR(priceOf(line))} × {line.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQty(idx, -1)} className="w-6 h-6 rounded-md bg-muted hover:bg-accent flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <button onClick={() => setQty(idx, +1)} className="w-6 h-6 rounded-md bg-muted hover:bg-accent flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => remove(idx)} className="w-6 h-6 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display font-bold text-2xl">{formatNPR(total)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {(["cash", "qr", "khata"] as const).map((m) => {
                  const Icon = m === "cash" ? Wallet : m === "qr" ? Wifi : BookOpen;
                  const active = method === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition ${
                        active ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft" : "bg-card border-border hover:border-primary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {m === "qr" ? "QR" : m[0].toUpperCase() + m.slice(1)}
                    </button>
                  );
                })}
              </div>

              {method === "khata" && (
                <select
                  value={customerId ?? ""}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full mb-4 px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                >
                  <option value="">Select Frequent customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {formatNPR(c.balance)} due</option>)}
                </select>
              )}

              {method === "qr" && awaitingQR && (
                <div className="mb-4 p-4 rounded-xl bg-gradient-soft border border-primary/20 text-center">
                  <QrCode className="w-16 h-16 mx-auto text-primary animate-pulse" />
                  <div className="text-xs mt-2 text-muted-foreground">Waiting for payment · {formatNPR(total)}</div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button onClick={checkout} className="col-span-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-soft hover:opacity-95 transition">
                  {method === "qr" ? "Generate QR" : method === "khata" ? "Add to Khata" : "Complete Sale"}
                </button>
                <button className="py-3 rounded-xl bg-card border border-border text-sm hover:bg-muted"><Printer className="w-4 h-4 mx-auto" /></button>
              </div>
              <button className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
                <Volume2 className="w-3 h-3" /> Audio confirmation ON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
