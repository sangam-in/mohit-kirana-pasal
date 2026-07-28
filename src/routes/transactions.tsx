import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { customers, formatNPR, recentSales, type PaymentMethod } from "@/lib/mock/data";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Mohit Kirana Pasal" },
      { name: "description", content: "Chronological sales log with per-line item details and correction actions." },
      { property: "og:title", content: "Sales History" },
      { property: "og:description", content: "Audit trail of every sale by Cash, QR or Khata." },
    ],
  }),
  component: Transactions,
});

function Transactions() {
  const [filter, setFilter] = useState<"all" | PaymentMethod>("all");
  const list = recentSales.filter((s) => filter === "all" || s.method === filter);

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">Every sale, audit-logged for dispute resolution</p>
      </div>

      <div className="flex gap-2">
        {(["all", "cash", "qr", "khata"] as const).map((m) => (
          <button key={m} onClick={() => setFilter(m)} className={`px-4 py-2 rounded-full text-sm ${filter === m ? "bg-gradient-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"}`}>
            {m === "all" ? "All" : m.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-3 py-3 font-medium">Items</th>
              <th className="text-left px-3 py-3 font-medium">Customer</th>
              <th className="text-left px-3 py-3 font-medium">Method</th>
              <th className="text-right px-5 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const c = s.customerId ? customers.find((x) => x.id === s.customerId) : null;
              return (
                <tr key={s.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-5 py-3 text-muted-foreground">{s.date}</td>
                  <td className="px-3 py-3 max-w-md truncate">{s.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</td>
                  <td className="px-3 py-3">{c?.name ?? <span className="text-muted-foreground">Walk-in</span>}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.method === "cash" ? "bg-success/15 text-success-foreground" :
                      s.method === "qr" ? "bg-primary/15 text-primary" :
                      "bg-warning/20 text-warning-foreground"
                    }`}>{s.method.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-display font-semibold">{formatNPR(s.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
