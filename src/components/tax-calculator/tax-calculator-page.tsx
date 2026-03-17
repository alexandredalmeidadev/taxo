"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueForm } from "./revenue-form";
import { PurchasesForm } from "./purchases-form";
import { TaxResults } from "./tax-results";
import { RegimeInfo } from "./regime-info";
import { calculateTaxes } from "@/lib/tax-engine";
import type { TaxFormInput } from "@/lib/tax-types";
import type { Purchase } from "@/lib/tax-types";
import { FileText, ShoppingCart, Calculator, BookOpen } from "lucide-react";

const DEFAULT_FORM: TaxFormInput = {
  annualRevenue: 0,
  activityType: "services",
  annualExpenses: 0,
  purchases: [],
  hasEmployees: false,
  employeeSalaries: 0,
  includePatente: false,
  includeCNSS: false,
  cnssMonthlyBase: 50_000,
};

export function TaxCalculatorPage() {
  const [form, setForm] = useState<TaxFormInput>(DEFAULT_FORM);

  const handleChange = (field: string, value: number | string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPurchase = (purchase: Purchase) => {
    setForm((prev) => ({
      ...prev,
      purchases: [...prev.purchases, purchase],
    }));
  };

  const handleRemovePurchase = (id: string) => {
    setForm((prev) => ({
      ...prev,
      purchases: prev.purchases.filter((p) => p.id !== id),
    }));
  };

  const result = useMemo(() => {
    if (form.annualRevenue <= 0) return null;
    return calculateTaxes(form);
  }, [form]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">
              Calculateur Fiscal Bénin
            </h1>
            <p className="text-xs text-muted-foreground">
              Auto-entrepreneur · Régimes TPS, Réel Simplifié, Réel Normal
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-muted-foreground">
              🇧🇯 FCFA · CGI Bénin
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
            <TabsTrigger value="calculator" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Calcul
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              Guide fiscal
            </TabsTrigger>
          </TabsList>

          {/* Onglet Calcul */}
          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche : Formulaires */}
              <div className="space-y-4">
                <RevenueForm
                  annualRevenue={form.annualRevenue}
                  activityType={form.activityType}
                  annualExpenses={form.annualExpenses}
                  hasEmployees={form.hasEmployees}
                  employeeSalaries={form.employeeSalaries}
                  includePatente={form.includePatente}
                  includeCNSS={form.includeCNSS}
                  cnssMonthlyBase={form.cnssMonthlyBase}
                  onChange={handleChange}
                />
                <PurchasesForm
                  purchases={form.purchases}
                  onAdd={handleAddPurchase}
                  onRemove={handleRemovePurchase}
                />
              </div>

              {/* Colonne droite : Résultats */}
              <div>
                {result ? (
                  <TaxResults result={result} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center h-64">
                    <Calculator className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Entrez votre chiffre d'affaires pour voir le calcul fiscal
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Guide */}
          <TabsContent value="guide">
            <div className="max-w-2xl">
              <RegimeInfo />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Outil indicatif · Basé sur le CGI du Bénin · Consultez la DGID ou un expert-comptable pour un conseil personnalisé
        </div>
      </footer>
    </div>
  );
}
