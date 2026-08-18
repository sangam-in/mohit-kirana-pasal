import { createFileRoute } from "@tanstack/react-router";
import { formatNPR, useProducts, useUpsertProduct, useSeedStarterData, useSetPackStock } from "@/lib/store-data";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Plus, ClipboardCheck, TriangleAlert, Save, X, Pencil, Filter, Boxes, Wallet } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({
    meta: [
      { title: "Saman (Inventory) — Hamro Kirana" },
      { name: "description", content: "Manage kirana products, prices, stock levels and low-stock alerts in one place." },
      { property: "og:title", content: "Saman (Inventory) — Hamro Kirana" },
      { property: "og:description", content: "Manage products, prices and stock levels." },
    ],
  }),
  component: InventoryPage,
});

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

function Pill({ tone, children }: { tone: "success" | "primary"; children: React.ReactNode }) {
  const map = {
    success: "bg-success/12 text-success",
    primary: "bg-primary/12 text-primary",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

function InventoryPage() {
  const { data: products = [], isLoading } = useProducts();
  const upsert = useUpsertProduct();
  const seed = useSeedStarterData();
  const setStock = useSetPackStock();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Grocery", price: "", packStock: "", emoji: "📦", barcode: "" });

  const [counting, setCounting] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const list = useMemo(() => 
    products.filter(
      (p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())
    )
  , [products, cat, q]);

  const stockValue = useMemo(() => products.reduce((a, p) => a + p.price * p.packStock, 0), [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.packStock <= p.lowStockAt).length, [products]);

  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: Boxes, tone: "bg-success/12 text-success" },
    { label: "Stock Value", value: formatNPR(stockValue), icon: Wallet, tone: "bg-info/12 text-info" },
    { label: "Low Stock", value: `${lowStockCount} items`, icon: TriangleAlert, tone: "bg-primary/12 text-primary" },
  ];

  const startQuickCount = () => {
    const initialCounts: Record<string, number> = {};
    products.forEach((p) => {
      initialCounts[p.id] = p.packStock;
    });
    setCounts(initialCounts);
    setCounting(true);
  };

  const saveQuickCount = async () => {
    try {
      await Promise.all(
        Object.entries(counts).map(([id, packStock]) =>
          setStock.mutateAsync({ id, packStock })
        )
      );
      setCounting(false);
      toast.success("Stock reconciled successfully via Quick Count!");
    } catch (err) {
      toast.error("Could not save stock adjustments");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert.mutateAsync({
        name: form.name,
        category: form.category,
        price: Number(form.price) || 0,
        packStock: Number(form.packStock) || 0,
        emoji: form.emoji || "📦",
        barcode: form.barcode,
      });
      setAdding(false);
      setForm({ name: "", category: "Grocery", price: "", packStock: "", emoji: "📦", barcode: "" });
      toast.success("Product added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add product");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {counting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 rounded-3xl max-w-lg w-full shadow-elegant space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" /> Shelf Quick Count</h3>
                <button onClick={() => setCounting(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-muted-foreground">Adjust stock levels directly based on what is physically sitting on shelves.</p>
              <div className="space-y-3 pt-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl text-sm">
                    <span className="truncate flex-1 pr-2">{p.emoji} {p.name}</span>
                    <input
                      type="number"
                      value={counts[p.id] ?? 0}
                      onChange={(e) => setCounts({ ...counts, [p.id]: Number(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 bg-background border border-border text-center rounded-lg outline-none"
                    />
                  </div>
                ))}
              </div>
              <button onClick={saveQuickCount} className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl shadow-soft">
                Save Stock Counts
              </button>
            </div>
          </div>
        )}

        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">Saman (Inventory)</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your products and stock</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={startQuickCount}
              className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-semibold shadow-soft hover:bg-muted"
            >
              <ClipboardCheck className="h-4 w-4 text-primary" /> Quick Count
            </button>
            <button
              onClick={() => setAdding((v) => !v)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        {adding && (
          <Card className="mt-5">
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-6">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="sm:col-span-2 px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" inputMode="numeric" className="px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.packStock} onChange={(e) => setForm({ ...form, packStock: e.target.value })} placeholder="Stock" inputMode="numeric" className="px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="Emoji (e.g. 🍿)" className="px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Barcode" className="px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none" />
              <button type="submit" disabled={upsert.isPending} className="sm:col-span-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-2xl shadow-soft">Save Product</button>
            </form>
          </Card>
        )}

        <Card className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border/60 bg-surface px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="shrink-0 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-medium outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border/60">
                  <th className="py-3 font-semibold">Product</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Price</th>
                  <th className="py-3 font-semibold">Stock</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const low = p.packStock <= p.lowStockAt;
                  return (
                    <tr key={p.id} className="border-b border-border/60 hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid shrink-0 place-items-center h-9 w-9 rounded-xl bg-primary/10 text-xl">
                            {p.emoji || "📦"}
                          </span>
                          <span className="text-sm font-semibold">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{p.category}</td>
                      <td className="py-3 font-display text-sm font-bold">{formatNPR(p.price)}</td>
                      <td className="py-3 text-sm text-muted-foreground">{p.packStock} packs</td>
                      <td className="py-3">
                        {low ? (
                          <Pill tone="primary">Low Stock</Pill>
                        ) : (
                          <Pill tone="success">In Stock</Pill>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setForm({
                                name: p.name,
                                category: p.category,
                                price: p.price.toString(),
                                packStock: p.packStock.toString(),
                                emoji: p.emoji || "📦",
                                barcode: p.barcode || "",
                              });
                              setAdding(true);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl border border-border/60 bg-surface hover:border-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  );
}
