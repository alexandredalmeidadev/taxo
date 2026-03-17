# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Git
- user.email: alexandrepvdalmeida@gmail.com
- remote: https://github.com/alexandredalmeidadev/taxo.git



## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** — uses `@theme inline` blocks in CSS, not `tailwind.config.ts`
- **shadcn/ui** — installed **manually** (the `npx shadcn init` CLI could not detect Next.js 16). Components live in `src/components/ui/` and are hand-written following shadcn patterns with Radix UI primitives.

## Architecture

### Separation of concerns

The tax logic is completely decoupled from the UI:

```
src/lib/
  tax-constants.ts   ← All rates & thresholds (single source of truth)
  tax-types.ts       ← TypeScript interfaces (TaxFormInput, TaxCalculationResult, …)
  tax-engine.ts      ← Pure calculation functions, no React deps
  utils.ts           ← cn(), formatCurrency() (FCFA/XOF), formatNumber()
```

`tax-engine.ts` exports one main function: `calculateTaxes(input: TaxFormInput): TaxCalculationResult`. It is purely functional — no side effects, no React.

### UI layer

```
src/components/tax-calculator/
  tax-calculator-page.tsx   ← Single useState owner; passes slices to children
  revenue-form.tsx          ← Revenue, activity type, expenses, CNSS, Patente toggles
  purchases-form.tsx        ← Add/remove TTC purchases for VAT deduction
  tax-results.tsx           ← Read-only results display
  regime-info.tsx           ← Static guide (no state)
  regime-badge.tsx          ← Small visual for TaxRegime
```

State lives entirely in `tax-calculator-page.tsx`. Children receive only what they need and call `onChange(field, value)`.

### Tailwind v4 + shadcn CSS variables

`globals.css` defines HSL CSS variables in `@layer base` and maps them to Tailwind tokens via `@theme inline`. **Do not add a `tailwind.config.ts`** — Tailwind v4 uses the CSS file as config.

## Beninese Tax System (CGI Bénin)

### Régimes fiscaux (thresholds in `tax-constants.ts`)

| Régime | CA annuel | Key taxes |
|--------|-----------|-----------|
| **TPS** | ≤ 50 000 000 FCFA | TPS (libératoire: replaces IS/IRPP + TVA) |
| **Réel Simplifié** | 50 M – 100 M FCFA | TVA 18% + IRPP progressif (min 1% CA) |
| **Réel Normal** | > 100 M FCFA | TVA 18% + IS 30% (min 1% CA) |

### TPS rates by activity (`ActivityType`)

- `commerce` → 2% CA (min 50 000 FCFA)
- `services` → 5% CA (min 50 000 FCFA)
- `liberal` → 5% CA (min 100 000 FCFA)
- `artisanat` → 1% CA (min 25 000 FCFA)

### TVA

- Rate: 18%. Only applies above the TPS threshold (50 M FCFA).
- Déductible: `amountTTC × (0.18 / 1.18)` per purchase where `vatDeductible = true`.

### Other

- **Patente**: ~0.5% CA, min 20 000 FCFA, max 3 000 000 FCFA
- **CNSS** (independent): ~14% of declared monthly base (min 50 000 FCFA/month)
- **IRPP**: progressive brackets defined in `IRPP_BRACKETS` in `tax-constants.ts`

## Key conventions

- Currency formatting: always use `formatCurrency()` from `utils.ts` — renders FCFA (XOF locale `fr-BJ`).
- When updating tax rates or thresholds, **only edit `tax-constants.ts`** — the engine reads from it.
- New UI components that need Radix: install `@radix-ui/react-<name>` and hand-write the shadcn wrapper in `src/components/ui/`.
