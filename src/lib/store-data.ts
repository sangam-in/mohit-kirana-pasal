import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  products as seedProducts,
  customers as seedCustomers,
  type PaymentMethod,
  type SaleItem,
} from "@/lib/mock/data";

export type { PaymentMethod, SaleItem };

export interface Product {
  id: string;
  name: string;
  nameNp?: string;
  category: string;
  barcode: string;
  price: number;
  packStock: number;
  looseUnitsPerPack?: number;
  looseUnits?: number;
  lowStockAt: number;
  emoji: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  lastActivity: string;
  avatarColor: string;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  method: PaymentMethod;
  customerId?: string;
  items: SaleItem[];
}

export interface KhataEntry {
  id: string;
  customerId: string;
  date: string;
  type: "debit" | "credit";
  amount: number;
  note: string;
}

export function formatNPR(n: number) {
  return "रु " + Math.round(n).toLocaleString("en-IN");
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d}d ago`;
}

async function requireUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ---------------- products ---------------- */

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        nameNp: p.name_np ?? undefined,
        category: p.category,
        barcode: p.barcode ?? "",
        price: Number(p.price),
        packStock: p.pack_stock,
        looseUnitsPerPack: p.loose_units_per_pack ?? undefined,
        looseUnits: p.loose_units ?? undefined,
        lowStockAt: p.low_stock_at,
        emoji: p.emoji,
      }));
    },
  });
}

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<Product> & { name: string }) => {
      const user_id = await requireUserId();
      const row = {
        ...(p.id ? { id: p.id } : {}),
        user_id,
        name: p.name,
        name_np: p.nameNp ?? null,
        category: p.category ?? "Grocery",
        barcode: p.barcode ?? null,
        price: p.price ?? 0,
        pack_stock: p.packStock ?? 0,
        loose_units_per_pack: p.looseUnitsPerPack ?? null,
        loose_units: p.looseUnits ?? null,
        low_stock_at: p.lowStockAt ?? 5,
        emoji: p.emoji ?? "📦",
      };
      const { error } = await supabase.from("products").upsert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useSetPackStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, packStock }: { id: string; packStock: number }) => {
      const { error } = await supabase
        .from("products")
        .update({ pack_stock: packStock })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

/* ---------------- customers + khata ---------------- */

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const [{ data: cs, error }, { data: ks, error: kErr }] = await Promise.all([
        supabase.from("customers").select("*").order("name"),
        supabase.from("khata_entries").select("customer_id, type, amount"),
      ]);
      if (error) throw error;
      if (kErr) throw kErr;
      const balances = new Map<string, number>();
      for (const k of ks ?? []) {
        const delta = (k.type === "debit" ? 1 : -1) * Number(k.amount);
        balances.set(k.customer_id, (balances.get(k.customer_id) ?? 0) + delta);
      }
      return (cs ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone ?? "",
        balance: balances.get(c.id) ?? 0,
        lastActivity: relative(c.last_activity),
        avatarColor: c.avatar_color,
      }));
    },
  });
}

export function useAddCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone?: string }) => {
      const user_id = await requireUserId();
      const hues = [30, 340, 250, 160, 60, 300];
      const { error } = await supabase.from("customers").insert({
        user_id,
        name,
        phone: phone ?? null,
        avatar_color: `oklch(0.68 0.16 ${hues[Math.floor(Math.random() * hues.length)]})`,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useKhataEntries(customerId?: string) {
  return useQuery({
    queryKey: ["khata", customerId ?? "all"],
    queryFn: async (): Promise<KhataEntry[]> => {
      let q = supabase.from("khata_entries").select("*").order("entry_date", { ascending: false });
      if (customerId) q = q.eq("customer_id", customerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((k) => ({
        id: k.id,
        customerId: k.customer_id,
        date: new Date(k.entry_date).toISOString().slice(0, 10),
        type: k.type as "debit" | "credit",
        amount: Number(k.amount),
        note: k.note ?? "",
      }));
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, amount, note }: { customerId: string; amount: number; note?: string }) => {
      const user_id = await requireUserId();
      const { error } = await supabase.from("khata_entries").insert({
        user_id,
        customer_id: customerId,
        type: "credit",
        amount,
        note: note ?? "Payment received",
      });
      if (error) throw error;
      await supabase
        .from("customers")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", customerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["khata"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

/* ---------------- sales ---------------- */

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, sale_items(*)")
        .order("sold_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((s) => ({
        id: s.id,
        date: new Date(s.sold_at).toLocaleString("en-GB", {
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
        }),
        total: Number(s.total),
        method: s.method as PaymentMethod,
        customerId: s.customer_id ?? undefined,
        items: (s.sale_items ?? []).map((i: { product_id: string | null; name: string; qty: number | string; unit: string; price: number | string }) => ({
          productId: i.product_id ?? "",
          name: i.name,
          qty: Number(i.qty),
          unit: i.unit as "pack" | "piece",
          price: Number(i.price),
        })),
      }));
    },
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      total,
      method,
      customerId,
    }: {
      items: SaleItem[];
      total: number;
      method: PaymentMethod;
      customerId?: string;
    }) => {
      const user_id = await requireUserId();
      const { data: sale, error } = await supabase
        .from("sales")
        .insert({ user_id, total, method, customer_id: customerId ?? null })
        .select()
        .single();
      if (error) throw error;

      const { error: itemErr } = await supabase.from("sale_items").insert(
        items.map((i) => ({
          user_id,
          sale_id: sale.id,
          product_id: i.productId || null,
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          price: i.price,
        })),
      );
      if (itemErr) throw itemErr;

      if (method === "khata" && customerId) {
        await supabase.from("khata_entries").insert({
          user_id,
          customer_id: customerId,
          sale_id: sale.id,
          type: "debit",
          amount: total,
          note: items.map((i) => i.name).join(", ").slice(0, 120),
        });
        await supabase
          .from("customers")
          .update({ last_activity: new Date().toISOString() })
          .eq("id", customerId);
      }

      // decrement pack stock
      for (const i of items) {
        if (!i.productId || i.unit !== "pack") continue;
        const { data: p } = await supabase
          .from("products")
          .select("pack_stock")
          .eq("id", i.productId)
          .maybeSingle();
        if (p) {
          await supabase
            .from("products")
            .update({ pack_stock: Math.max(0, p.pack_stock - i.qty) })
            .eq("id", i.productId);
        }
      }
      return sale.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["khata"] });
    },
  });
}

/* ---------------- starter data ---------------- */

export function useSeedStarterData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const user_id = await requireUserId();
      const { error } = await supabase.from("products").insert(
        seedProducts.map((p) => ({
          user_id,
          name: p.name,
          name_np: p.nameNp ?? null,
          category: p.category,
          barcode: p.barcode,
          price: p.price,
          pack_stock: p.packStock,
          loose_units_per_pack: p.looseUnitsPerPack ?? null,
          loose_units: p.looseUnits ?? null,
          low_stock_at: p.lowStockAt,
          emoji: p.emoji,
        })),
      );
      if (error) throw error;
      const { error: cErr } = await supabase.from("customers").insert(
        seedCustomers.map((c) => ({
          user_id,
          name: c.name,
          phone: c.phone,
          avatar_color: c.avatarColor,
        })),
      );
      if (cErr) throw cErr;
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };
}
