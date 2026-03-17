import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TAX_THRESHOLDS, TVA_RATE } from "@/lib/tax-constants";
import { formatCurrency } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function RegimeInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          Régimes fiscaux au Bénin
        </CardTitle>
        <CardDescription>
          Basé sur le Code Général des Impôts (CGI) du Bénin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* TPS */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">TPS</Badge>
            <span className="font-medium">Taxe Professionnelle Synthétique</span>
          </div>
          <p className="text-muted-foreground">
            CA annuel <strong>≤ {formatCurrency(TAX_THRESHOLDS.TPS_MAX)}</strong>
          </p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Commerce / achat-revente : <strong>2 %</strong> du CA</li>
            <li>Services & professions libérales : <strong>5 %</strong> du CA</li>
            <li>Artisanat / travaux : <strong>1 %</strong> du CA</li>
            <li>TPS libératoire : remplace IS/IRPP et TVA</li>
            <li>Pas de collecte de TVA sur les ventes</li>
            <li>Déclaration et paiement trimestriels</li>
          </ul>
        </div>

        {/* Réel Simplifié */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Réel Simplifié</Badge>
            <span className="font-medium">Régime Réel Simplifié</span>
          </div>
          <p className="text-muted-foreground">
            CA entre <strong>{formatCurrency(TAX_THRESHOLDS.TPS_MAX + 1)}</strong> et{" "}
            <strong>{formatCurrency(TAX_THRESHOLDS.REEL_SIMPLIFIE_MAX)}</strong>
          </p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>TVA <strong>{TVA_RATE * 100} %</strong> à collecter sur les ventes</li>
            <li>IRPP progressif ou IS 30 % sur le bénéfice</li>
            <li>Minimum de perception IS : 1 % du CA</li>
            <li>Comptabilité simplifiée obligatoire</li>
            <li>Déclaration annuelle + TVA mensuelle / trimestrielle</li>
          </ul>
        </div>

        {/* Réel Normal */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="info">Réel Normal</Badge>
            <span className="font-medium">Régime Réel Normal</span>
          </div>
          <p className="text-muted-foreground">
            CA <strong>&gt; {formatCurrency(TAX_THRESHOLDS.REEL_SIMPLIFIE_MAX)}</strong>
          </p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>TVA <strong>{TVA_RATE * 100} %</strong> obligatoire</li>
            <li>IS 30 % sur le bénéfice (min. 1 % du CA)</li>
            <li>Comptabilité complète (plan OHADA)</li>
            <li>Commissaire aux comptes selon seuils</li>
            <li>Déclarations mensuelles TVA + bilan annuel</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground border-t pt-3">
          ⚠️ Ces informations sont indicatives. Consultez un expert-comptable ou la Direction
          Générale des Impôts du Bénin (DGID) pour votre situation personnelle.
        </p>
      </CardContent>
    </Card>
  );
}
