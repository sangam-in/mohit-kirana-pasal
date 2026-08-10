import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle, ChevronRight } from "lucide-react";
import { customers, formatNPR } from "@/lib/mock/data";

export const Route = createFileRoute("/khata")({
  head: () => ({
    meta: [
      { title: "Khata (Credit) — Mohit Kirana Pasal" },
      { name: "description", content: "Digital Khata: reliable credit records with automated SMS/WhatsApp balance notifications." },
      { property: "og:title", content: "Kirana Khata Ledger" },
      { property: "og:description", content: "Track credit customers and outstanding balances with per-account itemization." },
    ],
  }),
  component: KhataList,
});

function KhataList() {
  const [q, setQ] = useState("");
  const list = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const total = customers.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Khata</h1>
          <p className="text-sm text-muted-foreground">Total outstanding: <span className="font-display font-semibold text-foreground">{formatNPR(total)}</span> across {customers.filter(c=>c.balance>0).length} customers</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-soft">+ New Customer</button>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search Khata customers…" className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: c.avatarColor }}>{c.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.phone} · last activity {c.lastActivity}</div>
              </div>
              <div className="text-right">
                <div className={`font-display font-bold ${c.balance > 0 ? "text-warning-foreground" : "text-success-foreground"}`}>{formatNPR(c.balance)}</div>
                <div className="text-[11px] text-muted-foreground">{c.balance > 0 ? "outstanding" : "clear"}</div>
              </div>
              <button className="p-2 rounded-lg hover:bg-accent" title="Send WhatsApp reminder"><MessageCircle className="w-4 h-4 text-primary" /></button>
              <Link to="/khata/$customerId" params={{ customerId: c.id }} className="p-2 rounded-lg hover:bg-accent">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
