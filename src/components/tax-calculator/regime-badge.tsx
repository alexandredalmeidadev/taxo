import { Badge } from "@/components/ui/badge";
import { REGIME_LABELS, type TaxRegime } from "@/lib/tax-constants";
import { ShieldCheck, TrendingUp, Building2 } from "lucide-react";

interface RegimeBadgeProps {
  regime: TaxRegime;
  className?: string;
}

const REGIME_CONFIG: Record<TaxRegime, { icon: React.ComponentType<{ className?: string }>; variant: "success" | "warning" | "info" }> = {
  TPS: { icon: ShieldCheck, variant: "success" },
  REEL_SIMPLIFIE: { icon: TrendingUp, variant: "warning" },
  REEL_NORMAL: { icon: Building2, variant: "info" },
};

export function RegimeBadge({ regime, className }: RegimeBadgeProps) {
  const config = REGIME_CONFIG[regime];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {REGIME_LABELS[regime]}
    </Badge>
  );
}
