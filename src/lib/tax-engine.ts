/**
 * Moteur de calcul fiscal – Auto-entrepreneur au Bénin
 * Basé sur le Code Général des Impôts (CGI) du Bénin
 */

import {
  TAX_THRESHOLDS,
  TVA_RATE,
  TPS_RATES,
  TPS_MINIMUMS,
  IS_RATE,
  IS_MINIMUM_RATE,
  IRPP_BRACKETS,
  PATENTE_BASE_RATE,
  PATENTE_MINIMUM,
  PATENTE_MAXIMUM,
  CNSS_RATE_INDEPENDENT,
  CNSS_MIN_BASE,
  type ActivityType,
  type TaxRegime,
} from "./tax-constants";

import type {
  TaxFormInput,
  TaxCalculationResult,
  TPSResult,
  VATResult,
  IncomeTaxResult,
  PatenteResult,
  CNSSResult,
  IRPPBracket,
} from "./tax-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function determineRegime(revenue: number): TaxRegime {
  if (revenue <= TAX_THRESHOLDS.TPS_MAX) return "TPS";
  if (revenue <= TAX_THRESHOLDS.REEL_SIMPLIFIE_MAX) return "REEL_SIMPLIFIE";
  return "REEL_NORMAL";
}

function calculateTPS(revenue: number, activityType: ActivityType): TPSResult {
  const rate = TPS_RATES[activityType];
  const minimum = TPS_MINIMUMS[activityType];
  const calculated = revenue * rate;
  const due = Math.max(calculated, minimum);
  return { rate, base: revenue, calculated, minimum, due };
}

function calculateVAT(
  revenue: number,
  purchases: TaxFormInput["purchases"]
): VATResult {
  const collectedVAT = revenue * TVA_RATE;

  const deductibleVAT = purchases
    .filter((p) => p.vatDeductible)
    .reduce((sum, p) => {
      // TVA déductible = montant TTC × (TVA_RATE / (1 + TVA_RATE))
      return sum + p.amountTTC * (TVA_RATE / (1 + TVA_RATE));
    }, 0);

  const purchasesExcludingVAT = purchases
    .filter((p) => p.vatDeductible)
    .reduce((sum, p) => sum + p.amountTTC / (1 + TVA_RATE), 0);

  const netVATDue = Math.max(0, collectedVAT - deductibleVAT);

  return {
    collectedVAT,
    deductibleVAT,
    netVATDue,
    purchasesExcludingVAT,
  };
}

function calculateIRPP(taxableIncome: number): {
  total: number;
  brackets: IRPPBracket[];
} {
  let total = 0;
  const brackets: IRPPBracket[] = [];

  for (const bracket of IRPP_BRACKETS) {
    if (taxableIncome <= bracket.min) break;
    const taxableAmount = Math.min(taxableIncome, bracket.max) - bracket.min;
    const tax = taxableAmount * bracket.rate;
    total += tax;
    brackets.push({
      min: bracket.min,
      max: bracket.max === Infinity ? taxableIncome : bracket.max,
      rate: bracket.rate,
      taxableAmount,
      tax,
    });
  }

  return { total, brackets };
}

function calculateIncomeTax(
  revenue: number,
  expenses: number,
  activityType: ActivityType
): IncomeTaxResult {
  const taxableIncome = Math.max(0, revenue - expenses);
  const minimumPerception = revenue * IS_MINIMUM_RATE;

  // Les sociétés → IS ; les personnes physiques → IRPP
  // Pour les auto-entrepreneurs (personnes physiques) on applique l'IRPP
  const { total: irppAmount, brackets } = calculateIRPP(taxableIncome);
  const isAmount = taxableIncome * IS_RATE;

  // On présente les deux, l'auto-entrepreneur choisit en fonction de son statut
  // Pour la simulation on retient l'IRPP (personne physique)
  const due = Math.max(irppAmount, minimumPerception);

  return {
    taxableIncome,
    isAmount,
    minimumPerception,
    due,
    method: "IRPP",
    brackets,
  };
}

function calculatePatente(revenue: number): PatenteResult {
  const rate = PATENTE_BASE_RATE;
  const calculated = revenue * rate;
  const due = Math.min(
    Math.max(calculated, PATENTE_MINIMUM),
    PATENTE_MAXIMUM
  );
  return { base: revenue, rate, calculated, due };
}

function calculateCNSS(monthlyBase: number): CNSSResult {
  const effectiveBase = Math.max(monthlyBase, CNSS_MIN_BASE);
  const annualBase = effectiveBase * 12;
  const annualContribution = annualBase * CNSS_RATE_INDEPENDENT;
  return {
    monthlyBase: effectiveBase,
    annualBase,
    rate: CNSS_RATE_INDEPENDENT,
    annualContribution,
  };
}

// ─── Calcul principal ─────────────────────────────────────────────────────────

export function calculateTaxes(input: TaxFormInput): TaxCalculationResult {
  const {
    annualRevenue,
    activityType,
    annualExpenses,
    purchases,
    hasEmployees,
    employeeSalaries,
    includePatente,
    includeCNSS,
    cnssMonthlyBase,
  } = input;

  const regime = determineRegime(annualRevenue);
  const warnings: string[] = [];
  const tips: string[] = [];

  // ── TPS ────────────────────────────────────────────────────────────────────
  const tps = regime === "TPS" ? calculateTPS(annualRevenue, activityType) : undefined;

  // ── TVA ────────────────────────────────────────────────────────────────────
  const vat = regime !== "TPS" ? calculateVAT(annualRevenue, purchases) : undefined;

  // Si proche du seuil TPS, avertir
  if (regime === "TPS" && annualRevenue > TAX_THRESHOLDS.TPS_MAX * 0.85) {
    warnings.push(
      `Votre CA est proche du seuil TPS (50 000 000 FCFA). Au-delà, vous passez au régime Réel Simplifié avec TVA à 18 %.`
    );
  }

  // ── IRPP / IS ──────────────────────────────────────────────────────────────
  let incomeTax: IncomeTaxResult | undefined;
  let totalExpenses = annualExpenses;

  if (hasEmployees) {
    totalExpenses += employeeSalaries;
  }

  if (regime !== "TPS") {
    incomeTax = calculateIncomeTax(annualRevenue, totalExpenses, activityType);
    if (incomeTax.taxableIncome === 0) {
      tips.push("Votre résultat est nul ou déficitaire. Seul le minimum de perception est dû.");
    }
  }

  // ── Patente ────────────────────────────────────────────────────────────────
  const patente = includePatente ? calculatePatente(annualRevenue) : undefined;

  // ── CNSS ───────────────────────────────────────────────────────────────────
  const cnss =
    includeCNSS ? calculateCNSS(cnssMonthlyBase) : undefined;

  // ── Total ──────────────────────────────────────────────────────────────────
  const totalTaxBurden =
    (tps?.due ?? 0) +
    (vat?.netVATDue ?? 0) +
    (incomeTax?.due ?? 0) +
    (patente?.due ?? 0) +
    (cnss?.annualContribution ?? 0);

  const effectiveTaxRate =
    annualRevenue > 0 ? (totalTaxBurden / annualRevenue) * 100 : 0;

  // ── Conseils automatiques ──────────────────────────────────────────────────
  if (regime === "TPS") {
    tips.push(
      "La TPS est libératoire : elle remplace l'IS/IRPP et la TVA. Vous n'avez pas à collecter la TVA sur vos ventes."
    );
    tips.push(
      "La TPS se déclare et se paye trimestriellement à la Direction des Impôts."
    );
  }

  if (regime !== "TPS") {
    tips.push(
      "Conservez toutes vos factures d'achat pour déduire la TVA payée en amont."
    );
    tips.push(
      "Déposez votre déclaration TVA mensuellement ou trimestriellement selon votre régime."
    );
  }

  if (purchases.length === 0 && regime !== "TPS") {
    tips.push(
      "Pensez à saisir vos achats professionnels pour calculer la TVA déductible."
    );
  }

  return {
    regime,
    annualRevenue,
    activityType,
    tps,
    vat,
    incomeTax,
    patente,
    cnss,
    totalTaxBurden,
    effectiveTaxRate,
    warnings,
    tips,
  };
}
