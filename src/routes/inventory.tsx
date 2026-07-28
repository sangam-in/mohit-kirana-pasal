import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, ClipboardCheck, AlertTriangle } from "lucide-react";
import { formatNPR, products } from "@/lib/mock/data";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory (Saman) — Mohit Kirana Pasal" },
      { name: "description", content: "Live product stock, loose-unit tracking and weekly Quick Count reconciliation." },
      { property: "og:title", content: "Kirana Inventory" },
      { property: "og:description", content: "Manage packaged and loose-unit stock with low-stock alerts." },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const [q, setQ] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Saman (Inventory)</h1>
          <p className="text-sm text-muted-foreground">{products.length} products · {products.filter(p=>p.packStock<=p.lowStockAt).length} need restock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast("Quick Count started", { description: "Count loose items on shelf" })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm hover:bg-muted">
            <ClipboardCheck className="w-4 h-4 text-primary" /> Quick Count
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-soft">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search products or barcode…" className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
          </div>
          {["All", "Snacks", "Drinks", "Grocery", "Dairy", "Household", "Tobacco"].map((c) => (
            <button key={c} className="px-3 py-1.5 rounded-full text-xs bg-muted hover:bg-accent text-foreground">{c}</button>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-3 py-3 font-medium">Category</th>
              <th className="text-left px-3 py-3 font-medium">Barcode</th>
              <th className="text-right px-3 py-3 font-medium">Price</th>
              <th className="text-right px-3 py-3 font-medium">Pack stock</th>
              <th className="text-right px-3 py-3 font-medium">Loose</th>
              <th className="text-right px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const low = p.packStock <= p.lowStockAt;
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-soft flex items-center justify-center text-lg">{p.emoji}</div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.nameNp && <div className="text-xs text-muted-foreground">{p.nameNp}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{p.barcode}</td>
                  <td className="px-3 py-3 text-right font-display font-semibold">{formatNPR(p.price)}</td>
                  <td className={`px-3 py-3 text-right font-medium ${low ? "text-warning-foreground" : ""}`}>{p.packStock}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground">{p.looseUnits ? `${p.looseUnits}/${p.looseUnitsPerPack}` : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {low ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20 text-warning-foreground text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-success/15 text-success-foreground text-xs font-medium">In stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
