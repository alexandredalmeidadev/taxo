"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ACTIVITY_LABELS, type ActivityType } from "@/lib/tax-constants";
import { formatNumber } from "@/lib/utils";
import { Building2, TrendingUp, Users } from "lucide-react";

interface RevenueFormProps {
  annualRevenue: number;
  activityType: ActivityType;
  annualExpenses: number;
  hasEmployees: boolean;
  employeeSalaries: number;
  includePatente: boolean;
  includeCNSS: boolean;
  cnssMonthlyBase: number;
  onChange: (field: string, value: number | string | boolean) => void;
}

export function RevenueForm({
  annualRevenue,
  activityType,
  annualExpenses,
  hasEmployees,
  employeeSalaries,
  includePatente,
  includeCNSS,
  cnssMonthlyBase,
  onChange,
}: RevenueFormProps) {
  const handleNumberInput = (field: string, raw: string) => {
    const cleaned = raw.replace(/\s/g, "").replace(/,/g, "");
    const value = parseFloat(cleaned) || 0;
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Chiffre d'affaires et activité
          </CardTitle>
          <CardDescription>
            Renseignez votre CA annuel prévisionnel ou réel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Chiffre d'affaires annuel (FCFA)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              placeholder="Ex : 25 000 000"
              value={annualRevenue || ""}
              onChange={(e) => handleNumberInput("annualRevenue", e.target.value)}
            />
            {annualRevenue > 0 && (
              <p className="text-xs text-muted-foreground">
                = {formatNumber(annualRevenue)} FCFA
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Type d'activité</Label>
            <Select
              value={activityType}
              onValueChange={(v) => onChange("activityType", v)}
            >
              <SelectTrigger id="activity">
                <SelectValue placeholder="Sélectionner votre activité" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenses">
              Charges déductibles annuelles (FCFA)
              <span className="ml-1 text-xs text-muted-foreground">
                (loyer, matériel, carburant, fournitures…)
              </span>
            </Label>
            <Input
              id="expenses"
              type="number"
              min="0"
              placeholder="Ex : 5 000 000"
              value={annualExpenses || ""}
              onChange={(e) => handleNumberInput("annualExpenses", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Options supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Options fiscales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Patente */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Inclure la Patente</Label>
              <p className="text-xs text-muted-foreground">
                Taxe professionnelle annuelle (~0,5 % du CA)
              </p>
            </div>
            <Switch
              checked={includePatente}
              onCheckedChange={(v) => onChange("includePatente", v)}
            />
          </div>

          {/* CNSS */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Inclure les cotisations CNSS</Label>
              <p className="text-xs text-muted-foreground">
                Caisse Nationale de Sécurité Sociale (~14 % du revenu déclaré)
              </p>
            </div>
            <Switch
              checked={includeCNSS}
              onCheckedChange={(v) => onChange("includeCNSS", v)}
            />
          </div>

          {includeCNSS && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="cnss-base">Assiette mensuelle déclarée (FCFA)</Label>
              <Input
                id="cnss-base"
                type="number"
                min="0"
                placeholder="Min. 50 000 FCFA"
                value={cnssMonthlyBase || ""}
                onChange={(e) => handleNumberInput("cnssMonthlyBase", e.target.value)}
              />
            </div>
          )}

          {/* Employés */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                J'ai des employés
              </Label>
              <p className="text-xs text-muted-foreground">
                La masse salariale réduit le bénéfice imposable
              </p>
            </div>
            <Switch
              checked={hasEmployees}
              onCheckedChange={(v) => onChange("hasEmployees", v)}
            />
          </div>

          {hasEmployees && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="salaries">Masse salariale brute annuelle (FCFA)</Label>
              <Input
                id="salaries"
                type="number"
                min="0"
                placeholder="Ex : 3 600 000"
                value={employeeSalaries || ""}
                onChange={(e) => handleNumberInput("employeeSalaries", e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
