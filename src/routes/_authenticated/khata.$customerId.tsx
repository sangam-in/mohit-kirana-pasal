import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { customers, formatNPR, khataLedger } from "@/lib/mock/data";

export const Route = createFileRoute("/_authenticated/khata/$customerId")({
  head: ({ params }) => {
    const c = customers.find((c) => c.id === params.customerId);
    return {
      meta: [
        { title: `${c?.name ?? "Khata"} — Ledger` },
        { name: "description", content: `Itemized Khata ledger and payment history for ${c?.name ?? "customer"}.` },
        { property: "og:title", content: `${c?.name ?? "Customer"} Khata` },
        { property: "og:description", content: "Kirana Khata ledger with balance history." },
      ],
    };
  },
  loader: ({ params }) => {
    const c = customers.find((c) => c.id === params.customerId);
    if (!c) throw notFound();
    return { customer: c };
  },
  component: KhataDetail,
});

function KhataDetail() {
  const { customer } = Route.useLoaderData();
  const entries = khataLedger.filter((k) => k.customerId === customer.id);

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">
      <Link to="/khata" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Khata
      </Link>

      <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-8 shadow-elegant flex flex-wrap items-center gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-3xl bg-white/20 backdrop-blur">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-64">
          <h1 className="text-2xl font-display font-bold">{customer.name}</h1>
          <div className="text-sm opacity-80">{customer.phone}</div>
          <div className="mt-2 text-xs opacity-70">Last activity {customer.lastActivity}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Outstanding balance</div>
          <div className="font-display font-bold text-4xl">{formatNPR(customer.balance)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => toast.success("Reminder sent via WhatsApp", { description: `Balance: ${formatNPR(customer.balance)}` })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-sm">
          <MessageCircle className="w-4 h-4 text-primary" /> Send WhatsApp reminder
        </button>
        <button onClick={() => toast.success("Payment recorded", { description: "Khata cleared" })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border font-display font-semibold">Ledger</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-3 py-3 font-medium">Note</th>
              <th className="text-right px-3 py-3 font-medium">Debit</th>
              <th className="text-right px-5 py-3 font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                <td className="px-3 py-3">{e.note}</td>
                <td className="px-3 py-3 text-right font-medium text-warning-foreground">{e.type === "debit" ? formatNPR(e.amount) : "—"}</td>
                <td className="px-5 py-3 text-right font-medium text-success-foreground">{e.type === "credit" ? formatNPR(e.amount) : "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
