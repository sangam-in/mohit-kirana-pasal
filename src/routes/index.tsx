import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store, ShoppingCart, BookOpen, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mohit Kirana Pasal — Billing, Inventory & Khata" },
      { name: "description", content: "Run your Kirana store: quick-sale billing, live inventory and digital Khata credit records in one place." },
      { property: "og:title", content: "Mohit Kirana Pasal — Billing & Khata" },
      { property: "og:description", content: "Quick Sale POS with Cash / QR / Khata payments, live inventory and credit reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        <div className="w-14 h-14 rotate-45 bg-primary text-primary-foreground flex items-center justify-center shadow-soft">
          <Store className="w-6 h-6 -rotate-45" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Mohit Kirana Pasal</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Bikri, saman ra khata — one place. Fast billing with Cash / QR / Khata, live stock counts,
            and credit ledgers with reminders.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: ShoppingCart, t: "Quick Sale", d: "Scan or tap, bill in seconds" },
            { icon: Package, t: "Inventory", d: "Pack + loose unit tracking" },
            { icon: BookOpen, t: "Khata", d: "Credit ledger per customer" },
          ].map((f) => (
            <div key={f.t} className="bg-card border border-border p-4 clip-notch">
              <f.icon className="w-5 h-5 text-primary" />
              <div className="mt-3 font-medium">{f.t}</div>
              <div className="text-xs text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link
            to={signedIn ? "/dashboard" : "/auth"}
            className="px-5 py-3 bg-primary text-primary-foreground text-sm font-medium clip-notch"
          >
            {signedIn ? "Open dashboard" : "Sign in to your store"}
          </Link>
        </div>
      </div>
    </div>
  );
}
