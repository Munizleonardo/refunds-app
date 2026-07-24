import type { TransactionType } from "../_lib/types";

const LABELS: Record<TransactionType, string> = {
  RFND: "Refund",
  CHBK: "Chargeback",
};

export function StatusBadge({ type }: { type: TransactionType }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-soft text-accent">
      {LABELS[type]}
    </span>
  );
}
