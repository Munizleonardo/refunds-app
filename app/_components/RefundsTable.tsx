import type { Refund } from "../_lib/types";
import { formatCurrency, formatDate, fullName } from "../_lib/format";
import { StatusBadge } from "./StatusBadge";

interface RefundsTableProps {
  refunds: Refund[];
}

const COLUMNS = [
  "Recibo",
  "Cliente",
  "Produto",
  "Valor",
  "País",
  "Vendor / Afiliado",
  "Tipo",
  "Data",
];

export function RefundsTable({ refunds }: RefundsTableProps) {
  if (refunds.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-surface py-10 text-sm text-muted">
        Nenhum refund encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {refunds.map((refund) => (
          <div
            key={refund.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">
                  {fullName(refund.firstName, refund.lastName)}
                </span>
                <span className="text-xs text-muted truncate">
                  {refund.email}
                </span>
              </div>
              <StatusBadge type={refund.transactionType} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{refund.productName}</span>
              <span className="font-medium text-danger whitespace-nowrap">
                {formatCurrency(refund.revenue, refund.currency)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="font-mono">{refund.receipt}</span>
              <span>{refund.country}</span>
              <span>
                {refund.vendor} / {refund.affiliate}
              </span>
              <span>{formatDate(refund.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-xl border border-border bg-surface overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-muted text-left">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 font-medium text-muted whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr
                  key={refund.id}
                  className="border-t border-border hover:bg-surface-muted transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {refund.receipt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {fullName(refund.firstName, refund.lastName)}
                      </span>
                      <span className="text-xs text-muted">
                        {refund.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {refund.productName}
                  </td>
                  <td className="px-4 py-3 font-medium text-danger whitespace-nowrap">
                    {formatCurrency(refund.revenue, refund.currency)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {refund.country}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span>{refund.vendor}</span>
                      <span className="text-xs text-muted">
                        {refund.affiliate}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge type={refund.transactionType} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDate(refund.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
