import {
  Wheat,
  Milk,
  CupSoda,
  Soup,
  Cookie,
  Droplets,
  SprayCan,
  Candy,
  Egg,
  Sandwich,
} from "lucide-react";

export const products = [
  { name: "Coca-Cola (500ml)", cat: "Beverages", price: 80, stock: 42, icon: CupSoda },
  { name: "Basmati Rice (1kg)", cat: "Food", price: 95, stock: 18, icon: Wheat },
  { name: "Wai Wai (Pack)", cat: "Snacks", price: 25, stock: 5, icon: Soup },
  { name: "Sunlight Soap", cat: "Household", price: 45, stock: 12, icon: SprayCan },
  { name: "Milk (Pouch)", cat: "Dairy", price: 60, stock: 27, icon: Milk },
  { name: "Cooking Oil (1L)", cat: "Household", price: 160, stock: 2, icon: Droplets },
  { name: "Sugar (1kg)", cat: "Food", price: 90, stock: 15, icon: Candy },
  { name: "Toothpaste (Closeup)", cat: "Personal Care", price: 85, stock: 1, icon: SprayCan },
  { name: "Tide Detergent (1kg)", cat: "Household", price: 320, stock: 7, icon: SprayCan },
  { name: "Red Bull (250ml)", cat: "Beverages", price: 160, stock: 9, icon: CupSoda },
  { name: "Biscuit (Parle)", cat: "Snacks", price: 20, stock: 34, icon: Cookie },
  { name: "Eggs (Tray)", cat: "Dairy", price: 420, stock: 8, icon: Egg },
  { name: "Bread (Large)", cat: "Bakery", price: 70, stock: 11, icon: Sandwich },
] as const;

export const categories = [
  "All",
  "Beverages",
  "Snacks",
  "Food",
  "Household",
  "Personal Care",
  "Dairy",
  "Bakery",
];

export const customers = [
  { id: "ram-bahadur", name: "Ram Bahadur", phone: "9841234567", balance: 2450, status: "Overdue" },
  { id: "hari-family", name: "Hari Family", phone: "9812345678", balance: 5620, status: "Overdue" },
  { id: "sita-sharma", name: "Sita Sharma", phone: "9861234567", balance: 1180, status: "Due Soon" },
  { id: "ganesh-store", name: "Ganesh Store", phone: "9801234567", balance: 850, status: "Current" },
  { id: "maya-tamang", name: "Maya Tamang", phone: "9851234567", balance: 250, status: "Current" },
  { id: "ramesh-thapa", name: "Ramesh Thapa", phone: "9821234567", balance: 0, status: "Current" },
];

export const transactions = [
  { id: "INV-00123", date: "May 20, 2025", time: "10:32 AM", customer: "Walk-in", items: 3, amount: 680, method: "Cash" },
  { id: "INV-00122", date: "May 20, 2025", time: "10:15 AM", customer: "Sita Sharma", items: 2, amount: 950, method: "QR" },
  { id: "INV-00121", date: "May 20, 2025", time: "09:58 AM", customer: "Walk-in", items: 5, amount: 275, method: "Cash" },
  { id: "INV-00120", date: "May 18, 2025", time: "05:12 PM", customer: "Ram Bahadur", items: 4, amount: 420, method: "Khata" },
  { id: "INV-00119", date: "May 18, 2025", time: "01:40 PM", customer: "Hari Family", items: 6, amount: 1350, method: "Khata" },
  { id: "INV-00118", date: "May 17, 2025", time: "11:05 AM", customer: "Walk-in", items: 1, amount: 160, method: "QR" },
  { id: "INV-00117", date: "May 17, 2025", time: "09:22 AM", customer: "Ganesh Store", items: 8, amount: 2340, method: "Cash" },
];

export const rs = (n: number) => `रु ${n.toLocaleString("en-IN")}`;
