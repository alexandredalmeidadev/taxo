"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Purchase } from "@/lib/tax-types";
import { formatCurrency } from "@/lib/utils";
import { PackagePlus, Trash2, ShoppingCart } from "lucide-react";

interface PurchasesFormProps {
  purchases: Purchase[];
  onAdd: (purchase: Purchase) => void;
  onRemove: (id: string) => void;
}

const emptyDraft = (): Omit<Purchase, "id"> => ({
  description: "",
  amountTTC: 0,
  vatDeductible: true,
});

export function PurchasesForm({ purchases, onAdd, onRemove }: PurchasesFormProps) {
  const [draft, setDraft] = useState(emptyDraft());

  const handleAdd = () => {
    if (!draft.description.trim() || draft.amountTTC <= 0) return;
    onAdd({
      ...draft,
      id: crypto.randomUUID(),
    });
    setDraft(emptyDraft());
  };

  const totalTTC = purchases.reduce((sum, p) => sum + p.amountTTC, 0);
  const totalDeductibleVAT = purchases
    .filter((p) => p.vatDeductible)
    .reduce((sum, p) => sum + p.amountTTC * (0.18 / 1.18), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4" />
          Achats professionnels
        </CardTitle>
        <CardDescription>
          Ajoutez vos achats TTC pour calculer la TVA déductible (régimes réels uniquement)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire ajout */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">Nouvel achat</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="purchase-desc" className="text-xs">Description</Label>
              <Input
                id="purchase-desc"
                placeholder="Ex : Ordinateur portable"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase-amount" className="text-xs">Montant TTC (FCFA)</Label>
              <Input
                id="purchase-amount"
                type="number"
                min="0"
                placeholder="Ex : 250 000"
                value={draft.amountTTC || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    amountTTC: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="vat-deductible"
                checked={draft.vatDeductible}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, vatDeductible: v }))}
              />
              <Label htmlFor="vat-deductible" className="text-xs cursor-pointer">
                TVA déductible (facture conforme)
              </Label>
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!draft.description.trim() || draft.amountTTC <= 0}
            >
              <PackagePlus className="h-3.5 w-3.5 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Liste des achats */}
        {purchases.length > 0 ? (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{purchase.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(purchase.amountTTC)} TTC
                    {purchase.vatDeductible && (
                      <span className="ml-1 text-green-600">
                        · TVA déduite : {formatCurrency(purchase.amountTTC * (0.18 / 1.18))}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant={purchase.vatDeductible ? "success" : "secondary"}>
                    {purchase.vatDeductible ? "TVA déduc." : "Sans TVA"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onRemove(purchase.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <Separator />
            <div className="flex justify-between text-sm px-1">
              <span className="text-muted-foreground">Total TTC</span>
              <span className="font-medium">{formatCurrency(totalTTC)}</span>
            </div>
            <div className="flex justify-between text-sm px-1">
              <span className="text-muted-foreground">TVA déductible totale</span>
              <span className="font-medium text-green-600">{formatCurrency(totalDeductibleVAT)}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucun achat saisi. Ajoutez vos achats professionnels pour optimiser votre TVA déductible.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
