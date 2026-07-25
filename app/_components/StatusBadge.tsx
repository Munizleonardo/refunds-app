import type { TransactionType } from "../_lib/types";

const LABELS: Record<TransactionType, string> = {
  SALE: "Sem reembolso",
  RFND: "Refund",
  CHBK: "Chargeback",
};

const STYLES: Record<TransactionType, string> = {
  SALE: "bg-surface-muted text-muted",
  RFND: "bg-accent-soft text-accent",
  CHBK: "bg-danger-soft text-danger",
};

export function StatusBadge({ type }: { type: TransactionType }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
