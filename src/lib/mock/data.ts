export type PaymentMethod = "cash" | "qr" | "khata";

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

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  unit: "pack" | "piece";
  price: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  method: PaymentMethod;
  customerId?: string;
}

export interface KhataEntry {
  id: string;
  customerId: string;
  date: string;
  type: "debit" | "credit";
  amount: number;
  note: string;
}

export const products: Product[] = [
  { id: "p1", name: "Wai Wai Noodles", nameNp: "वाइ वाइ", category: "Snacks", barcode: "8901491100013", price: 25, packStock: 42, lowStockAt: 20, emoji: "🍜" },
  { id: "p2", name: "Coca-Cola 500ml", category: "Drinks", barcode: "5449000000996", price: 80, packStock: 18, lowStockAt: 10, emoji: "🥤" },
  { id: "p3", name: "Surya Cigarette", category: "Tobacco", barcode: "8901234500012", price: 400, packStock: 6, looseUnitsPerPack: 20, looseUnits: 14, lowStockAt: 5, emoji: "🚬" },
  { id: "p4", name: "Basmati Rice 5kg", nameNp: "बासमती चामल", category: "Grocery", barcode: "8901012345678", price: 950, packStock: 8, lowStockAt: 4, emoji: "🍚" },
  { id: "p5", name: "Amul Milk 1L", category: "Dairy", barcode: "8901234100104", price: 90, packStock: 3, lowStockAt: 6, emoji: "🥛" },
  { id: "p6", name: "Britannia Biscuit", category: "Snacks", barcode: "8901063010102", price: 30, packStock: 55, lowStockAt: 15, emoji: "🍪" },
  { id: "p7", name: "Éclairs Candy", category: "Snacks", barcode: "8901058500017", price: 60, packStock: 4, looseUnitsPerPack: 40, looseUnits: 22, lowStockAt: 5, emoji: "🍬" },
  { id: "p8", name: "Dettol Soap", category: "Household", barcode: "8901396111117", price: 55, packStock: 22, lowStockAt: 10, emoji: "🧼" },
  { id: "p9", name: "Sunlight Detergent", category: "Household", barcode: "8901030826317", price: 120, packStock: 14, lowStockAt: 8, emoji: "🧴" },
  { id: "p10", name: "Maggi Masala", category: "Grocery", barcode: "8901058851234", price: 20, packStock: 78, lowStockAt: 25, emoji: "🌶️" },
  { id: "p11", name: "Dairy Milk Chocolate", category: "Snacks", barcode: "7622210411020", price: 50, packStock: 2, lowStockAt: 8, emoji: "🍫" },
  { id: "p12", name: "Bourn Vita 500g", category: "Dairy", barcode: "8901058999912", price: 320, packStock: 9, lowStockAt: 5, emoji: "🍯" },
];

export const customers: Customer[] = [
  { id: "c1", name: "Ram Bahadur", phone: "+977 98-4123-1122", balance: 2450, lastActivity: "2h ago", avatarColor: "oklch(0.72 0.15 30)" },
  { id: "c2", name: "Sita Sharma", phone: "+977 98-4200-7799", balance: 1180, lastActivity: "Yesterday", avatarColor: "oklch(0.65 0.18 340)" },
  { id: "c3", name: "Hari Family", phone: "+977 98-1234-5678", balance: 5620, lastActivity: "3d ago", avatarColor: "oklch(0.6 0.18 250)" },
  { id: "c4", name: "Krishna Tenant", phone: "+977 98-2233-4455", balance: 780, lastActivity: "6h ago", avatarColor: "oklch(0.7 0.15 160)" },
  { id: "c5", name: "Manoj Student", phone: "+977 98-6677-8899", balance: 320, lastActivity: "1d ago", avatarColor: "oklch(0.68 0.18 60)" },
  { id: "c6", name: "Gita Didi", phone: "+977 98-9988-1122", balance: 0, lastActivity: "5d ago", avatarColor: "oklch(0.68 0.14 300)" },
];

export const recentSales: Sale[] = [
  { id: "s1", date: "2026-07-28 09:12", total: 155, method: "qr", items: [{ productId: "p1", name: "Wai Wai Noodles", qty: 3, unit: "pack", price: 25 }, { productId: "p6", name: "Britannia Biscuit", qty: 1, unit: "pack", price: 30 }, { productId: "p11", name: "Dairy Milk", qty: 1, unit: "pack", price: 50 }] },
  { id: "s2", date: "2026-07-28 08:44", total: 90, method: "cash", items: [{ productId: "p5", name: "Amul Milk 1L", qty: 1, unit: "pack", price: 90 }] },
  { id: "s3", date: "2026-07-28 08:20", total: 400, method: "khata", customerId: "c1", items: [{ productId: "p4", name: "Basmati Rice", qty: 0, unit: "pack", price: 400 }] },
  { id: "s4", date: "2026-07-27 19:55", total: 60, method: "cash", items: [{ productId: "p3", name: "Surya (single)", qty: 3, unit: "piece", price: 20 }] },
  { id: "s5", date: "2026-07-27 18:30", total: 1120, method: "qr", items: [{ productId: "p4", name: "Basmati Rice 5kg", qty: 1, unit: "pack", price: 950 }, { productId: "p9", name: "Detergent", qty: 1, unit: "pack", price: 120 }] },
  { id: "s6", date: "2026-07-27 16:12", total: 240, method: "khata", customerId: "c3", items: [{ productId: "p1", name: "Wai Wai x 8", qty: 8, unit: "pack", price: 25 }] },
];

export const khataLedger: KhataEntry[] = [
  { id: "k1", customerId: "c1", date: "2026-07-28", type: "debit", amount: 400, note: "Basmati Rice 5kg" },
  { id: "k2", customerId: "c1", date: "2026-07-26", type: "debit", amount: 155, note: "Snacks & drinks" },
  { id: "k3", customerId: "c1", date: "2026-07-25", type: "credit", amount: 1000, note: "Payment received (cash)" },
  { id: "k4", customerId: "c1", date: "2026-07-22", type: "debit", amount: 2895, note: "Weekly grocery" },
  { id: "k5", customerId: "c3", date: "2026-07-27", type: "debit", amount: 240, note: "Wai Wai x 8 (son)" },
  { id: "k6", customerId: "c3", date: "2026-07-24", type: "debit", amount: 5380, note: "Monthly grocery" },
];

export const cashflowByMonth = [
  { m: "Jan", cash: 42, qr: 38, khata: 22 },
  { m: "Feb", cash: 40, qr: 45, khata: 18 },
  { m: "Mar", cash: 48, qr: 52, khata: 25 },
  { m: "Apr", cash: 44, qr: 58, khata: 20 },
  { m: "May", cash: 50, qr: 62, khata: 24 },
  { m: "Jun", cash: 46, qr: 68, khata: 28 },
  { m: "Jul", cash: 55, qr: 75, khata: 32 },
  { m: "Aug", cash: 60, qr: 82, khata: 30 },
  { m: "Sep", cash: 52, qr: 78, khata: 26 },
  { m: "Oct", cash: 58, qr: 84, khata: 29 },
  { m: "Nov", cash: 62, qr: 90, khata: 34 },
  { m: "Dec", cash: 68, qr: 96, khata: 38 },
];

export const paymentMix = [
  { name: "Cash", value: 42, color: "oklch(0.68 0.15 155)" },
  { name: "QR / Digital", value: 46, color: "oklch(0.5 0.22 285)" },
  { name: "Khata", value: 12, color: "oklch(0.82 0.15 75)" },
];

export const topSellers = [
  { name: "Wai Wai Noodles", units: 342, revenue: 8550 },
  { name: "Coca-Cola 500ml", units: 128, revenue: 10240 },
  { name: "Britannia Biscuit", units: 210, revenue: 6300 },
  { name: "Maggi Masala", units: 188, revenue: 3760 },
  { name: "Éclairs (single)", units: 456, revenue: 684 },
];

export function formatNPR(n: number) {
  return "रु " + n.toLocaleString("en-IN");
}
