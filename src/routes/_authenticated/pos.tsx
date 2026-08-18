import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, ScanLine, Plus, Minus, Trash2, Banknote, QrCode, NotebookText, ChevronDown, Check } from "lucide-react";
import { formatNPR, useCustomers, useProducts, useCreateSale, type PaymentMethod, type Product } from "@/lib/store-data";
import { playPaymentAudio } from "@/lib/audio";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({
    meta: [
      { title: "Bikri / POS — Hamro Kirana" },
      { name: "description", content: "Fast billing counter: search products, scan barcodes and take cash, QR or khata payments." },
      { property: "og:title", content: "Bikri / POS — Hamro Kirana" },
      { property: "og:description", content: "Fast billing counter for your kirana store." },
    ],
  }),
  component: PosPage,
});

interface CartLine {
  product: Product;
  qty: number;
  unit: "pack" | "piece";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-border/60 bg-card p-5 shadow-soft ${className}`}>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  );
}

function PosPage() {
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();
  const createSale = useCreateSale();

  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [awaitingQR, setAwaitingQR] = useState(false);
  const [scanning, setScanning] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const list = useMemo(() => 
    products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (p.name.toLowerCase().includes(q.toLowerCase()) || (p.barcode && p.barcode.includes(q)))
    )
  , [products, cat, q]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((c) => c.product.id === p.id && c.unit === "pack");
      if (found) return prev.map((c) => (c === found ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { product: p, qty: 1, unit: "pack" }];
    });
  };

  const stepQty = (idx: number, delta: number) => {
    setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  };

  const remove = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const total = useMemo(() => cart.reduce((s, l) => s + l.product.price * l.qty, 0), [cart]);

  // Audio confirmation chimes using Web Audio API
  const playSound = () => {
    if (typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Tone 2 (delay 120ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    }
  };

  const persist = async () => {
    try {
      await createSale.mutateAsync({
        total,
        method,
        customerId,
        items: cart.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          qty: l.qty,
          unit: l.unit,
          price: l.product.price,
        })),
      });
      setCart([]);
      setCustomerId(undefined);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save sale");
      return false;
    }
  };

  const triggerCheckout = async (payMethod: PaymentMethod) => {
    if (!cart.length) return toast.error("Cart is empty");
    if (payMethod === "khata" && !customerId) return toast.error("Select a Khata customer first");

    const saleAmount = total;
    setMethod(payMethod);

    if (payMethod === "qr") {
      setAwaitingQR(true);
      setTimeout(async () => {
        setAwaitingQR(false);
        if (await persist()) {
          toast.success("Payment received via QR ✓");
          playPaymentAudio(saleAmount, "qr");
        }
      }, 2000);
      return;
    }

    if (await persist()) {
      toast.success(payMethod === "khata" ? "Recorded to Khata ✓" : "Cash sale completed ✓");
      playPaymentAudio(saleAmount, payMethod);
    }
  };

  const simulateBarcodeScan = (barcode: string) => {
    const p = products.find((prod) => prod.barcode === barcode);
    if (p) {
      addToCart(p);
      toast.success(`Scanned: ${p.name}`);
    } else {
      toast.error("Unknown barcode scanner value");
    }
    setScanning(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">Bikri / POS</h1>
            <p className="mt-1 text-sm text-muted-foreground">Select products and add to cart</p>
          </div>
          {method === "khata" && (
            <select
              value={customerId ?? ""}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex shrink-0 items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-semibold shadow-soft"
            >
              <option value="">Select Customer Khata...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatNPR(c.balance)})
                </option>
              ))}
            </select>
          )}
        </header>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products by name or barcode..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => setScanning((v) => !v)}
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-semibold shadow-soft hover:bg-muted"
              >
                <ScanLine className="h-4 w-4 text-primary" /> Scan Barcode
              </button>
            </div>

            {scanning && (
              <div className="mt-4 p-4 rounded-3xl border border-primary/20 bg-primary/5 space-y-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Simulated Barcode Scan</p>
                <div className="flex flex-wrap gap-2">
                  {products.filter(p => p.barcode).map(p => (
                    <button
                      key={p.id}
                      onClick={() => simulateBarcodeScan(p.barcode!)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium hover:border-primary"
                    >
                      Scan {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={
                    c === cat
                      ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft"
                      : "rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {c === "All" ? "All Categories" : c}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => {
                const low = p.packStock <= p.lowStockAt;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="rounded-3xl border border-border/60 bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-lift relative group"
                  >
                    <div className="grid shrink-0 place-items-center h-16 w-16 rounded-3xl bg-primary/10 text-3xl">
                      {p.emoji || "📦"}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold">{p.name}</p>
                    <p className="mt-1 font-display text-lg font-bold">{formatNPR(p.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[11px] font-semibold ${low ? "text-primary" : "text-success"}`}>
                        {low ? `Low Stock (${p.packStock})` : "In Stock"}
                      </span>
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/12 text-primary">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Card className="self-start">
            <div className="flex items-center justify-between">
              <Label>Cart ({cart.length})</Label>
              <button onClick={() => setCart([])} className="text-xs font-semibold text-primary">
                Clear Cart
              </button>
            </div>

            <ul className="mt-4 space-y-3">
              {cart.map((l, i) => (
                <li key={l.product.id} className="rounded-2xl bg-surface p-3">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{l.product.name}</p>
                    <button onClick={() => remove(i)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatNPR(l.product.price)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => stepQty(i, -1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border/60 bg-card"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                      <button
                        onClick={() => stepQty(i, 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border/60 bg-card"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-sm font-bold">{formatNPR(l.product.price * l.qty)}</span>
                  </div>
                </li>
              ))}
              {cart.length === 0 && (
                <li className="rounded-2xl bg-surface p-6 text-center text-sm text-muted-foreground">
                  Cart is empty — tap a product to start billing.
                </li>
              )}
            </ul>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatNPR(total)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-primary">{formatNPR(total)}</span>
              </div>
            </div>

            {awaitingQR && (
              <div className="mt-4 p-4 rounded-2xl bg-info/10 text-center border border-info/20">
                <QrCode className="h-10 w-10 mx-auto text-info animate-pulse" />
                <p className="text-xs mt-2 text-muted-foreground">Scan QR to pay {formatNPR(total)}</p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={() => triggerCheckout("cash")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-4 py-3 font-display text-sm font-semibold text-success-foreground shadow-soft transition-opacity hover:opacity-90"
              >
                <Banknote className="h-4 w-4" /> Cash
              </button>
              <button
                onClick={() => triggerCheckout("qr")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-info px-4 py-3 font-display text-sm font-semibold text-info-foreground shadow-soft transition-opacity hover:opacity-90"
              >
                <QrCode className="h-4 w-4" /> QR Payment
              </button>
              <button
                onClick={() => {
                  setMethod("khata");
                  triggerCheckout("khata");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
              >
                <NotebookText className="h-4 w-4" /> Record to Khata
              </button>
            </div>
          </Card>
        </div>
      </div>
  );
}
