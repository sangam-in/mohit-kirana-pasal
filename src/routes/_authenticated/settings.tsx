import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Store, Printer, Users, Volume2, Languages } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mohit Kirana Pasal" },
      { name: "description", content: "Store info, thermal printer, cashier roles, audio cues and language." },
      { property: "og:title", content: "Kirana Settings" },
      { property: "og:description", content: "Configure your Kirana billing system." },
    ],
  }),
  component: Settings,
});

function Row({ icon: Icon, title, desc, children }: any) {
  return (
    <div className="flex items-start gap-4 p-5 border-b border-border last:border-b-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-soft flex items-center justify-center text-primary"><Icon className="w-5 h-5" /></div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ initial = false, onChange }: { initial?: boolean; onChange?: (v: boolean) => void }) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={() => { setOn(!on); onChange?.(!on); }} className={`w-11 h-6 rounded-full transition relative ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Settings() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Store, hardware and preferences</p>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <Row icon={Store} title="Store info" desc="Shown on receipts and reports">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input defaultValue="Mohit Kirana Pasal" className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
            <input defaultValue="Sandhikharka, Arghakhanchi" className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
            <input defaultValue="+977 98-1122-3344" className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
            <input defaultValue="PAN 601-234-567" className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary" />
          </div>
        </Row>

        <Row icon={Printer} title="Bluetooth thermal printer" desc="Auto-print receipt after each sale">
          <div className="flex items-center justify-between">
            <div className="text-sm text-success-foreground">✓ Xprinter XP-58 connected</div>
            <Toggle initial />
          </div>
        </Row>

        <Row icon={Volume2} title="Audio confirmation" desc={`"Payment bhayeko chha" cue on successful payment`}>
          <Toggle initial onChange={(v) => toast(v ? "Audio ON" : "Audio OFF")} />
        </Row>

        <Row icon={Languages} title="Language" desc="Interface language">
          <div className="flex gap-2">
            {["English", "नेपाली", "Hybrid"].map((l, i) => (
              <button key={l} className={`px-3 py-1.5 rounded-full text-xs ${i === 2 ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
            ))}
          </div>
        </Row>

        <Row icon={Users} title="Roles & access" desc="Owner sees profit; cashier sees only billing">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div><span className="font-medium">Mohit K.C.</span> <span className="text-xs text-muted-foreground ml-1">Owner</span></div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">Full access</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div><span className="font-medium">Bhai (staff)</span> <span className="text-xs text-muted-foreground ml-1">Cashier</span></div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground">Billing only</span>
            </div>
          </div>
        </Row>
      </div>
    </div>
  );
}
