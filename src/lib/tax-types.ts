import type { ActivityType, TaxRegime } from "./tax-constants";

// ─── Formulaire d'entrée ──────────────────────────────────────────────────────
export interface TaxFormInput {
  annualRevenue: number;
  activityType: ActivityType;
  annualExpenses: number;        // Charges déductibles totales
  purchases: Purchase[];         // Achats avec TVA pour déduction
  hasEmployees: boolean;
  employeeSalaries: number;      // Masse salariale annuelle brute
  includePatente: boolean;
  includeCNSS: boolean;
  cnssMonthlyBase: number;       // Assiette mensuelle déclarée CNSS
}

// ─── Objet / achat déductible ─────────────────────────────────────────────────
export interface Purchase {
  id: string;
  description: string;
  amountTTC: number;             // Montant TTC payé
  vatDeductible: boolean;        // La TVA est-elle déductible ?
}

// ─── Résultat du calcul ───────────────────────────────────────────────────────
export interface TaxCalculationResult {
  regime: TaxRegime;
  annualRevenue: number;
  activityType: ActivityType;

  // TPS (régime simplifié)
  tps?: TPSResult;

  // TVA
  vat?: VATResult;

  // IS / IRPP (régimes réels)
  incomeTax?: IncomeTaxResult;

  // Patente
  patente?: PatenteResult;

  // CNSS
  cnss?: CNSSResult;

  // Totaux
  totalTaxBurden: number;
  effectiveTaxRate: number;      // %

  // Avertissements / informations
  warnings: string[];
  tips: string[];
}

export interface TPSResult {
  rate: number;
  base: number;
  calculated: number;
  minimum: number;
  due: number;                   // max(calculated, minimum)
}

export interface VATResult {
  collectedVAT: number;          // TVA collectée sur les ventes
  deductibleVAT: number;         // TVA déductible sur les achats
  netVATDue: number;             // TVA nette à reverser
  purchasesExcludingVAT: number; // Base HT des achats
}

export interface IncomeTaxResult {
  taxableIncome: number;
  isAmount: number;
  minimumPerception: number;
  due: number;
  method: "IS" | "IRPP";
  brackets?: IRPPBracket[];
}

export interface IRPPBracket {
  min: number;
  max: number;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface PatenteResult {
  base: number;
  rate: number;
  calculated: number;
  due: number;
}

export interface CNSSResult {
  monthlyBase: number;
  annualBase: number;
  rate: number;
  annualContribution: number;
}
