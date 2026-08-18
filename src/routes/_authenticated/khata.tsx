import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, UserPlus, MoreHorizontal, MessageCircle, ChevronRight } from "lucide-react";
import { formatNPR, useAddCustomer, useCustomers } from "@/lib/store-data";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/khata")({
  head: () => ({
    meta: [
      { title: "Khata (Customers) — Hamro Kirana" },
      { name: "description", content: "Track customer credit, receivables and overdue khata balances for your shop." },
      { property: "og:title", content: "Khata (Customers) — Hamro Kirana" },
      { property: "og:description", content: "Track customer credit and payments." },
    ],
  }),
  component: KhataPage,
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

function Pill({ tone, children }: { tone: "success" | "primary" | "warning"; children: React.ReactNode }) {
  const map = {
    success: "bg-success/12 text-success",
    primary: "bg-primary/12 text-primary",
    warning: "bg-warning/25 text-accent-foreground",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

function KhataPage() {
  const { data: customers = [] } = useCustomers();
  const addCustomer = useAddCustomer();

  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const list = useMemo(() => 
    customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
  , [customers, q]);

  const totalReceivable = useMemo(() => 
    customers.reduce((s, c) => s + c.balance, 0)
  , [customers]);

  const overdueAmount = useMemo(() => 
    customers.filter(c => c.balance > 2000).reduce((s, c) => s + c.balance, 0)
  , [customers]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCustomer.mutateAsync({ name: form.name, phone: form.phone });
      setForm({ name: "", phone: "" });
      setAdding(false);
      toast.success("Customer added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add customer");
    }
  };

  const getStatus = (balance: number) => {
    if (balance > 2000) return "Overdue";
    if (balance > 0) return "Due Soon";
    return "Settled";
  };

  const getStatusTone = (balance: number) => {
    if (balance > 2000) return "primary";
    if (balance > 0) return "warning";
    return "success";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">Khata (Customers)</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage customer credit and payments</p>
          </div>
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
          >
            <UserPlus className="h-4 w-4" /> Add Customer
          </button>
        </header>

        {adding && (
          <Card className="mt-5">
            <form onSubmit={submit} className="flex flex-wrap gap-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" className="flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-background border border-border text-sm outline-none" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (e.g. 98xxxxxxxx)" className="flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-background border border-border text-sm outline-none" />
              <button type="submit" disabled={addCustomer.isPending} className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-2xl shadow-soft">Save Customer</button>
            </form>
          </Card>
        )}

        <Card className="mt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">All Customers</p>
              <p className="mt-2 font-display text-2xl font-bold">{customers.length}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-xs text-muted-foreground">Total Receivable</p>
              <p className="mt-2 font-display text-2xl font-bold">{formatNPR(totalReceivable)}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">{formatNPR(overdueAmount)}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/60 bg-surface px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search customers..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border/60">
                  <th className="py-3 font-semibold">Customer</th>
                  <th className="py-3 font-semibold">Phone</th>
                  <th className="py-3 font-semibold">Total Balance</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 hover:bg-muted/50">
                    <td className="py-3">
                      <Link
                        to="/khata/$customerId"
                        params={{ customerId: c.id }}
                        className="flex items-center gap-3"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {c.name.charAt(0)}
                        </span>
                        <span className="text-sm font-semibold hover:text-primary">{c.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{c.phone}</td>
                    <td className="py-3 font-display text-sm font-bold text-coral">{formatNPR(c.balance)}</td>
                    <td className="py-3">
                      <Pill tone={getStatusTone(c.balance)}>{getStatus(c.balance)}</Pill>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${c.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-xl border border-border/60 bg-surface text-success hover:border-success"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <Link
                          to="/khata/$customerId"
                          params={{ customerId: c.id }}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-border/60 bg-surface hover:border-primary"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
  );
}
