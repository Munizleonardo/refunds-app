import "server-only";
import { getRefundsSnapshot } from "./refunds-cache";
import type { Refund, RefundFilterState, RefundStats } from "./types";

type CommonFilters = Pick<
  RefundFilterState,
  "search" | "transactionType" | "country" | "dateFrom" | "dateTo"
>;

function matchesFilters(refund: Refund, filters: CommonFilters): boolean {
  if (
    filters.transactionType !== "all" &&
    refund.transactionType !== filters.transactionType
  ) {
    return false;
  }

  if (filters.country !== "all" && refund.country !== filters.country) {
    return false;
  }

  const createdAt = new Date(refund.createdAt);
  if (filters.dateFrom && createdAt < new Date(`${filters.dateFrom}T00:00:00.000Z`)) {
    return false;
  }
  if (filters.dateTo && createdAt > new Date(`${filters.dateTo}T23:59:59.999Z`)) {
    return false;
  }

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    const haystack = `${refund.email} ${refund.receipt} ${refund.firstName} ${refund.lastName}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}

export async function getRefundCountries(): Promise<string[]> {
  const { countries } = await getRefundsSnapshot();
  return countries;
}

export async function getRefundsFreshness(): Promise<number> {
  const { fetchedAt } = await getRefundsSnapshot();
  return fetchedAt;
}

export async function getRefundStats(filters: CommonFilters): Promise<RefundStats> {
  const { refunds } = await getRefundsSnapshot();
  const matched = refunds.filter((refund) => matchesFilters(refund, filters));

  const refundedRows = matched.filter(
    (refund) => refund.transactionType === "RFND" || refund.transactionType === "CHBK"
  );
  const totalRefunded = refundedRows.reduce((sum, refund) => sum + refund.revenue, 0);
  const chargebacks = matched.filter(
    (refund) => refund.transactionType === "CHBK"
  ).length;

  return {
    totalOrders: matched.length,
    refundedCount: refundedRows.length,
    totalRefunded,
    averageRefund: refundedRows.length > 0 ? totalRefunded / refundedRows.length : 0,
    chargebacks,
  };
}

export async function getRefundsPage(
  filters: CommonFilters,
  page: number,
  pageSize: number
): Promise<{ refunds: Refund[]; totalCount: number }> {
  const { refunds } = await getRefundsSnapshot();
  const matched = refunds.filter((refund) => matchesFilters(refund, filters));

  const start = (page - 1) * pageSize;
  return {
    refunds: matched.slice(start, start + pageSize),
    totalCount: matched.length,
  };
}
