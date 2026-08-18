import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Store,
  ShoppingCart,
  Package,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Users,
  HeartHandshake,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import heroAuthImg from "@/assets/hero-auth.png";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hamro Kirana Management — Bikri, Saman ra Khata" },
      {
        name: "description",
        content: "Bikri, saman ra khata — one place. Fast billing with Cash / QR / Khata, live stock counts, and credit ledgers.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="relative min-h-screen w-full bg-[#faf7f2] overflow-hidden flex flex-col justify-between p-4 sm:p-8 lg:p-12 font-sans">
      {/* Background Hero Image with Organic Wave Mask / Fade */}
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-full lg:w-[65%] z-0">
        <img
          src={heroAuthImg}
          alt="Golden Hour Himalayan Kirana Shop"
          className="h-full w-full object-cover object-right"
        />
        {/* Soft atmospheric gradient into left cream background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2] via-[#faf7f2]/80 lg:via-[#faf7f2]/40 to-transparent w-full lg:w-[50%]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col justify-center flex-1 my-auto py-8">
        {/* Logo Badge */}
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#ff5017] text-white shadow-md shadow-[#ff632b]/20">
          <Store className="h-8 w-8" />
        </div>

        {/* Hero Title */}
        <div className="mt-8">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#2b2520] tracking-tight leading-[1.1]">
            Hamro Kirana <br />
            <span className="text-[#ff632b]">Management</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm sm:text-base text-[#6b6255] leading-relaxed">
            Bikri, saman ra khata — one place. Fast billing with Cash / QR / Khata, live stock counts, and credit ledgers with reminders.
          </p>
        </div>

        {/* 3 Feature Pills */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
          {/* Quick Sale */}
          <div className="flex flex-col items-center text-center rounded-2xl bg-white/90 backdrop-blur-md border border-[#eee6d8] p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff632b]/10 text-[#ff632b]">
              <ShoppingCart className="h-6 w-6" />
            </span>
            <p className="mt-3.5 font-bold text-sm text-[#2b2520]">Quick Sale</p>
            <p className="mt-1 text-xs text-[#8e8578] leading-tight">Scan or tap, bill in seconds</p>
          </div>

          {/* Inventory */}
          <div className="flex flex-col items-center text-center rounded-2xl bg-white/90 backdrop-blur-md border border-[#eee6d8] p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#22c55e]/10 text-[#15803d]">
              <Package className="h-6 w-6" />
            </span>
            <p className="mt-3.5 font-bold text-sm text-[#2b2520]">Inventory</p>
            <p className="mt-1 text-xs text-[#8e8578] leading-tight">Pack + loose unit tracking</p>
          </div>

          {/* Khata */}
          <div className="flex flex-col items-center text-center rounded-2xl bg-white/90 backdrop-blur-md border border-[#eee6d8] p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#8b5cf6]/10 text-[#6d28d9]">
              <BookOpen className="h-6 w-6" />
            </span>
            <p className="mt-3.5 font-bold text-sm text-[#2b2520]">Khata</p>
            <p className="mt-1 text-xs text-[#8e8578] leading-tight">Credit ledger per customer</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 max-w-sm">
          <button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff632b] to-[#f4511e] px-8 py-4 font-display text-base font-bold text-white shadow-lg shadow-[#ff632b]/25 hover:opacity-95 transition cursor-pointer"
          >
            <span>Open dashboard</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>



      {/* Login / Sign Up Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#fcfaf6] border border-[#eee6d8] p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-sm font-bold text-[#8e8578] hover:text-[#2b2520] h-8 w-8 rounded-full bg-black/5 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff632b] text-white">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-[#2b2520]">
                  {mode === "signin" ? "Sign in to your store" : "Create store account"}
                </h2>
                <p className="text-xs text-[#8e8578]">Hamro Kirana Management</p>
              </div>
            </div>

            <button
              onClick={google}
              className="w-full py-3 rounded-2xl border border-[#eee6d8] bg-white text-sm font-bold text-[#2b2520] hover:bg-[#f6f2ea] shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase text-[#8e8578]">
              <div className="h-px flex-1 bg-[#eee6d8]" /> or <div className="h-px flex-1 bg-[#eee6d8]" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8e8578] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pasal@kirana.np"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#eee6d8] text-sm text-[#2b2520] outline-none focus:border-[#ff632b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8e8578] mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#eee6d8] text-sm text-[#2b2520] outline-none focus:border-[#ff632b]"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 bg-[#ff632b] text-white font-display text-sm font-bold rounded-2xl shadow-soft hover:bg-[#f0551e] disabled:opacity-60 transition"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-xs font-semibold text-[#ff632b] hover:underline"
              >
                {mode === "signin" ? "New store? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
