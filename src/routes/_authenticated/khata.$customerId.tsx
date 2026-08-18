import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { formatNPR, useCustomers, useKhataEntries, useRecordPayment } from "@/lib/store-data";
import { playPaymentAudio } from "@/lib/audio";

export const Route = createFileRoute("/_authenticated/khata/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer Khata — Ledger" },
      { name: "description", content: "Itemized Khata ledger and payment history for this credit customer." },
      { property: "og:title", content: "Customer Khata" },
      { property: "og:description", content: "Kirana Khata ledger with balance history." },
    ],
  }),
  component: KhataDetail,
});

function KhataDetail() {
  const { customerId } = Route.useParams();
  const { data: customers = [] } = useCustomers();
  const { data: entries = [] } = useKhataEntries(customerId);
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState("");

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading customer…
      </div>
    );
  }

  const pay = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Enter a payment amount");
    try {
      await recordPayment.mutateAsync({ customerId, amount: value });
      setAmount("");
      toast.success("Payment recorded", { description: formatNPR(value) });
      playPaymentAudio(value, "cash");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record payment");
    }
  };


  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link 
          to="/khata" 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-all border border-border shadow-sm mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Ledger
        </Link>
      </div>

      {/* Main Profile & Balance Bento Box */}
      <div className="rounded-[2rem] bg-gradient-hero text-primary-foreground p-8 shadow-elegant relative overflow-hidden">
        {/* Subtle decorative vector background pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl bg-white/15 backdrop-blur-md shadow-inner text-white border border-white/10">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">{customer.name}</h1>
              <p className="text-sm opacity-80 font-mono mt-0.5">{customer.phone}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/90 backdrop-blur-sm">
                Last activity: {customer.lastActivity}
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[200px]">
            <div className="text-xs font-medium uppercase tracking-wider text-white/70">Total Outstanding</div>
            <div className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
              {formatNPR(customer.balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Control Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Record Payment Section */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-foreground">Record Payment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Collect outstanding balance from customer</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">रु</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-3 rounded-xl bg-background border border-border text-sm font-semibold outline-none focus:border-primary transition"
              />
            </div>
            <button 
              onClick={pay} 
              disabled={recordPayment.isPending} 
              className="px-5 py-3 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Save Payment
            </button>
          </div>
        </div>

        {/* WhatsApp Reminder Section */}
        <div className="rounded-3xl bg-card border border-border p-6 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-foreground">Quick Reminder</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Send a WhatsApp invoice statement</p>
          </div>
          <button 
            onClick={() => toast.success("Reminder sent via WhatsApp", { description: `Balance: ${formatNPR(customer.balance)}` })} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25d366]/10 text-[#128c7e] hover:bg-[#25d366]/20 font-semibold text-sm transition"
          >
            <MessageCircle className="w-4 h-4 text-[#128c7e]" /> Send WhatsApp Statement
          </button>
        </div>
      </div>

      {/* Ledger History */}
      <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-foreground">Ledger Activity</h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{entries.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/40 font-semibold">
              <tr>
                <th className="text-left px-6 py-4 font-semibold">Date</th>
                <th className="text-left px-4 py-4 font-semibold">Note / Transaction Details</th>
                <th className="text-right px-4 py-4 font-semibold">Borrowed (Debit)</th>
                <th className="text-right px-6 py-4 font-semibold">Paid (Credit)</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-border/80 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{e.date}</td>
                  <td className="px-4 py-4 font-medium text-foreground">{e.note}</td>
                  <td className="px-4 py-4 text-right">
                    {e.type === "debit" ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 font-semibold text-xs">
                        {formatNPR(e.amount)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {e.type === "credit" ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-xs">
                        {formatNPR(e.amount)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                    No credit activities recorded for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
