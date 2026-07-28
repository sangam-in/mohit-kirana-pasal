
# Mohit Kirana Pasal — Frontend Plan

A complete demo frontend for the Kirana billing, inventory & Khata system, styled after the Zentra reference (purple gradient, sidebar, illustrated hero, soft cards). All data is mocked in-memory — no backend.

## Design system

- **Palette** (oklch tokens in `src/styles.css`): deep indigo/violet primary with a lighter violet glow for gradients (matches Zentra's `#4f46e5`-ish primary), soft neutral background (`#f6f5fb`), white cards, subtle lavender surface, success green, warning amber, destructive red. Status chips: Occupied→Paid, Idle→Due, plus Khata pill.
- **Typography**: Space Grotesk (headings) + DM Sans (body) via `<link>` in `__root.tsx`.
- **Reusable primitives**: gradient hero card, stat card, section card with search/filter, sidebar item, pill/badge variants, quick-sale tile.

## Routes

```
src/routes/
  __root.tsx              → sidebar layout + top header + Outlet
  index.tsx               → Dashboard
  pos.tsx                 → Quick Sale (billing counter)
  inventory.tsx           → Products & stock
  khata.tsx               → Credit customers list
  khata.$customerId.tsx   → Customer ledger detail
  transactions.tsx        → Sales history
  reports.tsx             → Charts & exports
  settings.tsx            → Store, printer, roles, language
```

Each route gets its own `head()` with title/description/og.

## Screens (all mock data)

1. **Dashboard** — Zentra-style hero card ("Namaste, Mohit Dai" + illustration), 4 stat cards: Today's Sales, Items Sold, Outstanding Khata, Low-Stock Alerts. Cash-flow bar chart (Cash / QR / Khata) + monthly summary. "Top Khata debtors" list + "Recent sales" list.
2. **Quick Sale (POS)** — left: Quick-Sale grid of frequent items + barcode search + "Single Unit" toggle for loose items. Right: running cart with live total, customer picker (Frequent list), payment method tabs (Cash / QR / Khata). QR tab shows dynamic QR mock + simulated "Payment bhayeko chha ✓" audio-confirmation toast after 3s. Print-receipt button.
3. **Inventory** — searchable/filterable product table (name, SKU/barcode, pack stock, loose units, price, status). Low-stock highlighted. Add/Edit product dialog, "Quick Count" mode dialog for weekly loose-item reconciliation.
4. **Khata list** — customers with outstanding balance, search, sort by balance/last activity, per-customer avatar + phone + total due.
5. **Khata detail** — customer summary card, itemized ledger (debits/credits), "Send reminder" button (SMS/WhatsApp mock), record-payment dialog.
6. **Transactions** — chronological sales, filter by day/payment method, expand row for line items, "Correction" action.
7. **Reports** — sales trend chart, payment-mix donut, top items, shrinkage from Quick Count, export buttons (mock).
8. **Settings** — store info, printer (Bluetooth mock), roles (Owner vs Cashier), language toggle stub, audio-cue toggle.

## Nepali phrases sprinkled through UI

- Sidebar: "Bikri (POS)", "Khata", "Saman (Inventory)"
- Hero greeting: "Namaste, Mohit Dai"
- Payment toast: "Payment bhayeko chha ✓"
- Empty states: "Aja ko bikri dekhaunu…"

## Mock data

`src/lib/mock/` — products, customers, sales, khata ledger, chart series. Deterministic seed so charts/tables look real.

## Assets

Generate one illustrated hero image (shopkeeper + storefront, purple sky) via imagegen for the dashboard hero card; small product placeholder images.

## Out of scope (frontend-only demo)

Real barcode scanning, real QR gateway, real SMS/WhatsApp, real printing, auth. All simulated with buttons/toasts.
