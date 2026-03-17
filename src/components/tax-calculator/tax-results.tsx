"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RegimeBadge } from "./regime-badge";
import type { TaxCalculationResult } from "@/lib/tax-types";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  Lightbulb,
  Receipt,
  Calculator,
  Percent,
  Info,
} from "lucide-react";

interface TaxResultsProps {
  result: TaxCalculationResult;
}

function ResultRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between py-2 ${highlight ? "font-semibold" : ""}`}
    >
      <div>
        <p className={`text-sm ${highlight ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span
        className={`text-sm tabular-nums ${highlight ? "text-foreground" : "text-muted-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function TaxResults({ result }: TaxResultsProps) {
  const {
    regime,
    annualRevenue,
    tps,
    vat,
    incomeTax,
    patente,
    cnss,
    totalTaxBurden,
    effectiveTaxRate,
    warnings,
    tips,
  } = result;

  return (
    <div className="space-y-4">
      {/* Régime & résumé */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Résultat fiscal
            </CardTitle>
            <RegimeBadge regime={regime} />
          </div>
          <CardDescription>
            CA annuel : <strong>{formatCurrency(annualRevenue)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-background border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Charge fiscale totale</p>
              <p className="text-2xl font-bold">{formatCurrency(totalTaxBurden)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                <Percent className="h-3 w-3" />
                Taux effectif
              </p>
              <p className="text-2xl font-bold">{effectiveTaxRate.toFixed(1)} %</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détail TPS */}
      {tps && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Taxe Professionnelle Synthétique (TPS)
              <Badge variant="success" className="text-xs">Libératoire</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <ResultRow
              label="Taux applicable"
              value={`${(tps.rate * 100).toFixed(0)} %`}
              sub="sur le chiffre d'affaires"
            />
            <ResultRow
              label="TPS calculée"
              value={formatCurrency(tps.calculated)}
              sub={`${formatCurrency(tps.base)} × ${(tps.rate * 100).toFixed(0)} %`}
            />
            <ResultRow
              label="Minimum de perception"
              value={formatCurrency(tps.minimum)}
            />
            <ResultRow
              label="TPS due"
              value={formatCurrency(tps.due)}
              sub="max(calculée, minimum)"
              highlight
            />
          </CardContent>
        </Card>
      )}

      {/* Détail TVA */}
      {vat && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              TVA (18 %)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <ResultRow
              label="TVA collectée sur ventes"
              value={formatCurrency(vat.collectedVAT)}
              sub={`${formatCurrency(result.annualRevenue)} × 18 %`}
            />
            <ResultRow
              label="TVA déductible sur achats"
              value={`- ${formatCurrency(vat.deductibleVAT)}`}
              sub={`Base HT achats : ${formatCurrency(vat.purchasesExcludingVAT)}`}
            />
            <ResultRow
              label="TVA nette à reverser"
              value={formatCurrency(vat.netVATDue)}
              highlight
            />
          </CardContent>
        </Card>
      )}

      {/* Détail IRPP / IS */}
      {incomeTax && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {incomeTax.method === "IRPP" ? "IRPP (Barème progressif)" : "IS (30 %)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <ResultRow
              label="Bénéfice imposable"
              value={formatCurrency(incomeTax.taxableIncome)}
              sub="CA − charges déductibles"
            />
            {incomeTax.brackets && incomeTax.brackets.length > 0 && (
              <div className="py-2 space-y-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">Tranches IRPP</p>
                {incomeTax.brackets.map((b, i) => (
                  <div key={i} className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Jusqu'à {formatCurrency(b.max)} × {(b.rate * 100).toFixed(0)} %
                    </span>
                    <span>{formatCurrency(b.tax)}</span>
                  </div>
                ))}
              </div>
            )}
            <ResultRow
              label="Impôt calculé (IRPP)"
              value={formatCurrency(incomeTax.isAmount)}
            />
            <ResultRow
              label="Minimum de perception (1 % CA)"
              value={formatCurrency(incomeTax.minimumPerception)}
            />
            <ResultRow
              label="IRPP / IS dû"
              value={formatCurrency(incomeTax.due)}
              sub="max(impôt calculé, minimum)"
              highlight
            />
          </CardContent>
        </Card>
      )}

      {/* Patente */}
      {patente && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Patente / Taxe Professionnelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <ResultRow
              label="Taux"
              value={`${(patente.rate * 100).toFixed(1)} % du CA`}
            />
            <ResultRow label="Calculé" value={formatCurrency(patente.calculated)} />
            <ResultRow label="Patente due" value={formatCurrency(patente.due)} highlight />
          </CardContent>
        </Card>
      )}

      {/* CNSS */}
      {cnss && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Cotisations CNSS (TNS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <ResultRow
              label="Assiette mensuelle"
              value={formatCurrency(cnss.monthlyBase)}
            />
            <ResultRow
              label="Assiette annuelle"
              value={formatCurrency(cnss.annualBase)}
            />
            <ResultRow
              label="Taux"
              value={`${(cnss.rate * 100).toFixed(0)} %`}
            />
            <ResultRow
              label="Cotisation annuelle"
              value={formatCurrency(cnss.annualContribution)}
              highlight
            />
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif global */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Récapitulatif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y">
          {tps && <ResultRow label="TPS" value={formatCurrency(tps.due)} />}
          {vat && <ResultRow label="TVA nette" value={formatCurrency(vat.netVATDue)} />}
          {incomeTax && <ResultRow label="IRPP / IS" value={formatCurrency(incomeTax.due)} />}
          {patente && <ResultRow label="Patente" value={formatCurrency(patente.due)} />}
          {cnss && <ResultRow label="CNSS" value={formatCurrency(cnss.annualContribution)} />}
          <Separator className="my-1" />
          <ResultRow
            label="TOTAL charges fiscales & sociales"
            value={formatCurrency(totalTaxBurden)}
            highlight
          />
          <ResultRow
            label="Revenu net estimé"
            value={formatCurrency(annualRevenue - totalTaxBurden)}
            sub="CA − total impôts"
            highlight
          />
        </CardContent>
      </Card>

      {/* Avertissements */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Points d'attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-700 flex gap-2">
                  <span>•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Conseils */}
      {tips.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-4 w-4" />
              Conseils & rappels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {tips.map((t, i) => (
                <li key={i} className="text-sm text-blue-700 flex gap-2">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
