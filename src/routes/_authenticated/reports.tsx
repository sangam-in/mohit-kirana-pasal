import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatNPR, useSales } from "@/lib/store-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Hamro Kirana Management" },
      { name: "description", content: "Sales trends, payment mix, top sellers and shrinkage from Quick Count." },
      { property: "og:title", content: "Kirana Reports & Insights" },
      { property: "og:description", content: "Owner-level reporting for a neighborhood Kirana store." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { data: sales = [] } = useSales();

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth = new Map<number, number>();
  const mix = { cash: 0, qr: 0, khata: 0 };
  const sellers = new Map<string, { units: number; revenue: number }>();

  for (const s of sales) {
    const d = new Date(s.date.split(",")[0].split("/").reverse().join("-"));
    const m = isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
    byMonth.set(m, (byMonth.get(m) ?? 0) + s.total);
    mix[s.method] += s.total;
    for (const i of s.items) {
      const prev = sellers.get(i.name) ?? { units: 0, revenue: 0 };
      sellers.set(i.name, { units: prev.units + i.qty, revenue: prev.revenue + i.qty * i.price });
    }
  }

  const trend = monthNames.map((m, i) => ({ m, total: byMonth.get(i) ?? 0 }));
  const paymentMix = [
    { name: "Cash", value: Math.round(mix.cash), color: "oklch(0.68 0.15 155)" },
    { name: "QR / Digital", value: Math.round(mix.qr), color: "oklch(0.5 0.22 285)" },
    { name: "Khata", value: Math.round(mix.khata), color: "oklch(0.82 0.15 75)" },
  ].filter((p) => p.value > 0);
  const topSellers = [...sellers.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);


  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Sales insights and shrinkage analysis</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium shadow-soft">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-soft">
          <h3 className="font-display font-semibold mb-4">Sales trend (2026)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <XAxis dataKey="m" stroke="oklch(0.5 0.03 275)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="oklch(0.5 0.03 275)" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Line type="monotone" dataKey="total" stroke="oklch(0.5 0.22 285)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.5 0.22 285)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <h3 className="font-display font-semibold mb-4">Payment mix</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={paymentMix} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={4}>
                {paymentMix.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
        <h3 className="font-display font-semibold mb-4">Top selling items</h3>
        <div className="space-y-3">
          {topSellers.map((t, i) => {
            const max = Math.max(...topSellers.map((x) => x.units));
            return (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium"><span className="text-muted-foreground mr-2">#{i + 1}</span>{t.name}</span>
                  <span className="text-muted-foreground">{t.units} units · <span className="font-display font-semibold text-foreground">{formatNPR(t.revenue)}</span></span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${(t.units / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Loose-item shrinkage (Jul)", value: "रु 320", note: "Detected via Quick Count", color: "text-warning-foreground" },
          { label: "Avg. transaction time", value: "2.4 s", note: "Down from 18s (manual)", color: "text-success-foreground" },
          { label: "Khata collection rate", value: "84%", note: "+6% MoM", color: "text-success-foreground" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className={`mt-2 font-display font-bold text-2xl ${k.color}`}>{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
