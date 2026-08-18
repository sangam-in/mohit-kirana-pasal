# CLAUDE.md — Project Context

## Project Overview
**Hamro Kirana Management** (Kirana Sahayog) is a web-based POS billing and ledger (Khata) application tailored for neighborhood Kirana stores in Nepal. It features a premium, warm-cream bento design system (Space Grotesk & DM Sans typography), real-time Supabase database hooks, and customized native audio confirmation.

---

## Core Commands

### Development
```bash
# Install dependencies
bun install   # or npm install

# Start the local development server
bun run dev   # or npm run dev
```

### Build & Production
```bash
# Build the production application bundle
bun run build # or npm run build

# Preview production build locally
bun run preview
```

---

## Technical Stack & Architecture

- **Frontend Core**: React, Vite, Tailwind CSS v4 (configured in `src/styles.css`).
- **Routing**: `@tanstack/react-router` (generated routes in `src/routes/` and compiled config in `src/routeTree.gen.ts`).
- **State & Database**: Supabase client queries & mutations declared in [`src/lib/store-data.ts`](file:///home/mohito/Downloads/friendly-ref-ui/src/lib/store-data.ts).
- **Icons**: `lucide-react` for clean, consistent interface glyphs.

---

## Key Custom Systems

### 🔊 Nepali Voice Payment Confirmation (`src/lib/audio.ts`)
- **Behaviors**: 
  - Plays a double POS beep chime first.
  - On **QR payments ONLY**, plays a native Nepali speech recording: `"भुक्तानी भएको छ"` (*Bhuktani bhayeko chha*).
  - Cash and Khata transactions play only the classic POS double chime.
- **Audio Assets**:
  - Female Voice: `/payment-success-ne-female.mp3` (default)
  - Male Voice: `/payment-success-ne.mp3`
- **Settings Toggle**: Reactive toggle in settings menu updates `localStorage.setItem("nepali_voice_gender", "female" | "male")`.

### 🛡️ Data Isolation & RLS
- Supabase Row-Level Security (RLS) restricts data access per user account using `auth.uid() = user_id`. Stores, transactions, inventory, and Khata ledger data are 100% isolated to the logged-in user email.

---

## Development Guidelines

1. **Design System & Aesthetics**: 
   - Keep styling consistent with the warm Sahayog palette: soft cards (`bg-card`, `border-border`), heavy rounded edges (`rounded-[2rem]`, `rounded-3xl`), and bold font-display sizes (`font-display`).
   - Use `formatNPR()` from `store-data.ts` to format currency into Nepali Rupees (`रु ...`).
2. **Git Workflow (Rule from AGENTS.md)**:
   - **Do not rewrite published git history** (no force pushing, squashing, or amending pushed commits). Lovable syncs with the current branch state directly.
3. **Adding Pages/Routes**:
   - Run `bun run dev` to let TanStack router auto-generate new route files under `src/routes/`.
