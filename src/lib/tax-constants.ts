/**
 * Constantes fiscales pour les auto-entrepreneurs au Bénin
 * Source : Code Général des Impôts du Bénin (CGI), Lois de Finances
 *
 * Régimes fiscaux :
 * - TPS (Taxe Professionnelle Synthétique) : CA ≤ 50 000 000 FCFA
 * - Réel Simplifié : 50 000 001 ≤ CA ≤ 100 000 000 FCFA
 * - Réel Normal   : CA > 100 000 000 FCFA
 */

// ─── Seuils de régimes (FCFA) ────────────────────────────────────────────────
export const TAX_THRESHOLDS = {
  TPS_MAX: 50_000_000,
  REEL_SIMPLIFIE_MAX: 100_000_000,
} as const;

// ─── TVA ─────────────────────────────────────────────────────────────────────
export const TVA_RATE = 0.18; // 18 %
export const TVA_THRESHOLD = TAX_THRESHOLDS.TPS_MAX; // TVA obligatoire au-delà de 50 M FCFA

// ─── TPS – Taxe Professionnelle Synthétique ──────────────────────────────────
// Taux appliqués sur le chiffre d'affaires annuel
export const TPS_RATES: Record<ActivityType, number> = {
  commerce: 0.02,        // 2 % – commerce de biens
  services: 0.05,        // 5 % – prestations de services
  artisanat: 0.01,       // 1 % – artisanat / travaux
  liberal: 0.05,         // 5 % – professions libérales
};

// Montants minimaux de TPS (FCFA)
export const TPS_MINIMUMS: Record<ActivityType, number> = {
  commerce: 50_000,
  services: 50_000,
  artisanat: 25_000,
  liberal: 100_000,
};

// ─── IS – Impôt sur les Sociétés / IRPP ──────────────────────────────────────
// Régime réel : taux normal + minimum de perception
export const IS_RATE = 0.30;                       // 30 % sur le bénéfice imposable
export const IS_MINIMUM_RATE = 0.01;               // 1 % du CA (minimum de perception)

// Barème progressif IRPP (personnes physiques sous régime réel, FCFA)
export const IRPP_BRACKETS = [
  { min: 0,          max: 600_000,     rate: 0 },
  { min: 600_001,    max: 1_200_000,   rate: 0.10 },
  { min: 1_200_001,  max: 3_000_000,   rate: 0.15 },
  { min: 3_000_001,  max: 6_000_000,   rate: 0.19 },
  { min: 6_000_001,  max: 12_000_000,  rate: 0.25 },
  { min: 12_000_001, max: Infinity,    rate: 0.35 },
] as const;

// ─── Patente / Taxe Professionnelle ──────────────────────────────────────────
// Applicable à tous les régimes ; montant indicatif (varie selon commune)
export const PATENTE_BASE_RATE = 0.005;            // 0,5 % du CA (base approximative)
export const PATENTE_MINIMUM = 20_000;             // Minimum 20 000 FCFA
export const PATENTE_MAXIMUM = 3_000_000;          // Plafond indicatif

// ─── CNSS – Cotisations sociales ─────────────────────────────────────────────
// Travailleur indépendant (TNS)
export const CNSS_RATE_INDEPENDENT = 0.14;        // ~14 % sur la rémunération déclarée
export const CNSS_MIN_BASE = 50_000;              // Assiette minimale mensuelle (FCFA)

// ─── Types ───────────────────────────────────────────────────────────────────
export type ActivityType = "commerce" | "services" | "artisanat" | "liberal";
export type TaxRegime = "TPS" | "REEL_SIMPLIFIE" | "REEL_NORMAL";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  commerce: "Commerce (achat/revente de biens)",
  services: "Prestations de services",
  artisanat: "Artisanat / Travaux",
  liberal: "Profession libérale",
};

export const REGIME_LABELS: Record<TaxRegime, string> = {
  TPS: "Taxe Professionnelle Synthétique (TPS)",
  REEL_SIMPLIFIE: "Régime Réel Simplifié",
  REEL_NORMAL: "Régime Réel Normal",
};
