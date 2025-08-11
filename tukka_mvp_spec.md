# Tukka — MVP Specification (Web + Capacitor)

Spec version: 0.1.0
Last updated: 2025-08-11

## 1) Overview
Tukka is a cross-platform **recipes + meal planning + shopping list** app.  
**MVP approach:** build a **web app first** (Next.js PWA), then package it for iOS/Android using **Capacitor**.  
Design the codebase so we can later add native features, sync, supermarket integrations, OCR, and nutrition without major rewrites.

---

## 2) Architecture & Tech

### 2.1 High-level
- **Web-first:** Next.js 14 (App Router, TypeScript) with PWA offline cache.
- **Mobile packaging:** Capacitor (iOS/Android) wrapping the web build, plus selected native plugins to reduce “just a website” risk (Camera later, Share, Filesystem, Haptics).
- **Shared core:** All business logic in `@tukka/core` (pure TypeScript, no DOM).

### 2.2 Monorepo layout
```
tukka/
  apps/
    web/            # Next.js 14 PWA (runs in browser and inside Capacitor)
    mobile-shell/   # Capacitor iOS/Android projects + config
  packages/
    core/           # domain models, storage interfaces, services (no-ops for deferred features)
    theme/          # tokens: colors, spacing, typography
    ui/             # shared React components where possible
```

### 2.3 Key libraries
- **TypeScript**, **React**, **Next.js 14**.
- **State:** Zustand + React Query.
- **Forms:** React Hook Form + Zod.
- **Storage (web):** IndexedDB via `localforage` behind a storage repo in `@tukka/core`.
- **PWA:** Service Worker + offline caching (recipes, planner, lists data).
- **Capacitor plugins (MVP minimal):** App, Browser, Share, Haptics, Filesystem, HTTP (for mobile import; camera/OCR deferred).

---

## 3) MVP — Build Now

### 3.1 Scope (explicit)
- **Recipes**
  - Manual add/edit/delete.
  - **URL import: JSON‑LD only**. If JSON‑LD is missing or the site blocks access (CORS/anti-bot), show a clear message and route to **manual add**.
  - Search/filter by title/tags.
- **Meal Planner**
  - Week view (Mon–Sun), slots: breakfast/lunch/dinner/snack.
  - Assign recipes; adjust servings per meal.
- **Shopping Lists**
  - Generate from week plan.
  - **Merge by ingredient name only** using simple normalization (trim, lower-case, collapse whitespace, strip punctuation/diacritics). Keep **original text as a note** on list items.
  - Manual add/edit/delete; check-off items.
- **Settings**
  - Theme toggle (light/dark).
  - About page (version, brand).
  - Metric/imperial display toggle (display only; labels/formatting only; **no numeric conversions in MVP**).

### 3.2 Data models (MVP simplified)
```ts
// Recipe
type IngredientLine = {
  id: string;                 // UUID
  originalText: string;       // exact line as entered/imported
  name: string;               // parsed simple name used for list merging
  qty?: string;               // free text ("1", "1 1/2", "a pinch")
  unit?: string;              // free text ("g", "cup", "tbsp")
  note?: string;
};

type Recipe = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  ingredients: IngredientLine[];
  steps: string[];
  servings: number;
  image?: string;
  updatedAt: string;
  source?: { type: 'manual'|'url'; url?: string };
  sourceFingerprint?: string; // optional stable hash to assist dedupe later
  // Nutrition intentionally omitted from acceptance criteria in MVP
};

// Meal Plan
type MealPlan = {
  id: string;
  weekStart: string; // ISO date (Monday)
  items: { day: number; slot: 'breakfast'|'lunch'|'dinner'|'snack'; recipeId: string; servings: number }[];
};

// Shopping List
type ShoppingList = {
  id: string;
  title: string;
  items: { id: string; name: string; note?: string; checked: boolean }[]; // name merged by string match
  createdAt: string;
};
```

### 3.3 Services (interfaces now, no‑ops for deferred features)
Create interfaces in `@tukka/core/services` so future phases drop in real implementations without refactors:
```ts
export interface ImportService {
  importFromUrl(url: string): Promise<Recipe | null>; // MVP: JSON-LD only; null if absent
}
export interface UnitConversionService {
  toCanonical(line: IngredientLine): IngredientLine; // MVP: return line unchanged
}
export interface NutritionService {
  estimate(recipe: Recipe): Promise<null>; // MVP: no-op, returns null
}
export interface OcrService {
  recognize(fileOrUri: string): Promise<string[]>; // MVP: throw "not implemented"
}
export interface SmartEngine {
  suggest(_: unknown): Promise<null>; // MVP: no-op
}
```

### 3.4 Storage & migrations
- IndexedDB via `localforage` with a thin repository layer.
- Versioned schema + migration helpers in `@tukka/core/storage` (IDs as UUIDv4, createdAt/updatedAt).
- Deterministic data export/import (JSON) to future-proof migrations.

### 3.5 PWA & Capacitor specifics
- PWA: installable, offline cache for app shell + user data.
- Capacitor shell:
  - Embed the built web assets locally.
  - Use native splash, icon, proper app metadata.
  - Include Share, Haptics, Filesystem for native feel (no IAP/Camera yet).
  - Use Capacitor HTTP plugin for mobile URL imports to bypass CORS and improve success rate.

### 3.6 Acceptance criteria (MVP)
- Users can:
  - Create, edit, delete recipes and see them offline.
  - Import a recipe by URL **only if JSON‑LD present**; if blocked (CORS/anti-bot) or missing, show clear error and route to manual add.
  - Plan a week of meals, adjust servings.
  - Generate a shopping list merged **by ingredient name string**; original ingredient text visible as a note.
  - Toggle theme and metric/imperial **display**.
  - Install PWA; run the same UX inside Capacitor app.
  - Work offline after the first successful load (app shell cached; user data persisted in IndexedDB).
- **Out of scope (MVP):**
  - Nutrition pipeline (optional manual entry field allowed: per‑serve kJ/kcal/macros).
  - OCR import.
  - HTML fallback parser and social import.
  - Canonical unit/density conversions.
  - Any AI/LLM/NER features.

---

## 4) Roadmap — Context Only (Do Not Build Now)

### Phase 2
- **HTML fallback import** (Readability/Cheerio) + correction UI for ingredients.
- **Unit canonicalization** with densities (g/ml/count) & conversions.
- **Nutrition estimation** with small, curated macro dataset (AUSNUT/USDA subset).

### Phase 3
- **OCR import**: native Vision/ML Kit on mobile, Tesseract.js on web.
- **CORS proxy** for web imports (serverless, toggle-able).

### Phase 4
- **Local AI pack** (optional, on-device): small models for smarter parsing (NER), ingredient canonicalization hints, heuristic ranking.

*(Supermarket SKU mapping & sharing/sync remain later phases outside this document.)*

---

## 5) UX Notes
- Ingredient editor shows **original line** + simple **name** field (used for merging).
- Import flow: paste URL → success if JSON‑LD → preview → save; else show “manual add” path.
- Shopping list groups by simple name; tap item → show original lines that contributed.
- Metric default; imperial is display-only (no conversions guaranteed in MVP).
 - If web import fails due to site restrictions (CORS/anti-bot), show a friendly message with guidance and offer manual add. On mobile, imports use native HTTP for better success.

---

## 6) Tooling & Dev Order
**Milestone 0 — Foundations**
- Monorepo + Next.js app + Capacitor shell.
- `@tukka/core` with models, storage repo, service interfaces (no‑ops).

**Milestone 1 — Recipes**
- CRUD UI, images, tags, search.
- JSON‑LD URL import (happy-path only).

**Milestone 2 — Planner & Lists**
- Week planner UI, servings.
- Generate list, merge by name string, show notes.

**Milestone 3 — PWA & Mobile**
- PWA installability + offline verification.
- Capacitor build for iOS/Android; native splash/icon; Share/Haptics/Filesystem.

**Milestone 4 — Polish**
- Accessibility pass (labels, focus order, contrast).
- Settings (theme + unit display).

---

## 7) Compliance & Privacy
- All processing local-first; no external calls beyond user-initiated URL import.
- URL validation (https/http only), sanitized parsing, and user warnings for sites that block access.
- Clarify that the PWA caches app shell; user data is stored in IndexedDB (and may be cleared by the browser under extreme conditions). Encourage periodic export.
- On iOS, WKWebView storage may be purged in low-space scenarios; recommend backups via export.
- Provide data export (JSON) from Filesystem in Capacitor and download on web.
- Set conservative CSP (including `connect-src`) and only allow connections to user-entered origins (and optional proxy, when introduced).

---

## 8) Summary
- **Build now:** Web PWA + Capacitor shell with manual recipes, planner, list merging by name, and **JSON‑LD‑only** URL import.
- **Defer:** nutrition pipeline, OCR, HTML/social import, canonical units/densities, and any local AI/LLM parsing.
- **Prepare for later:** service interfaces in place (no‑ops), storage/migrations ready, portable core for native evolution.
