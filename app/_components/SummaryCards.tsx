import type { RefundStats } from "../_lib/types";
import { formatCurrency } from "../_lib/format";
import { StatCard } from "./StatCard";

interface SummaryCardsProps {
  stats: RefundStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Total de pedidos" value={String(stats.totalOrders)} />
      <StatCard
        label="Valor total reembolsado"
        value={formatCurrency(stats.totalRefunded, "USD")}
        tone="danger"
      />
      <StatCard
        label="Ticket médio (reembolso)"
        value={formatCurrency(stats.averageRefund, "USD")}
      />
      <StatCard label="Chargebacks" value={String(stats.chargebacks)} />
    </div>
  );
}
