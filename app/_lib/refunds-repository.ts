import "server-only";
import { createSupabaseServerClient } from "./supabase-server";
import type { Refund, RefundFilterState, RefundStats } from "./types";

const TABLE = "clickbank_orders_email_us";
const REFUND_TYPES = ["RFND", "CHBK"] as const;

// Only the columns the UI actually renders. `raw_payload` is deliberately
// excluded — it's a heavy jsonb blob (~1.7KB/row) not shown anywhere here.
const DISPLAY_COLUMNS =
  "id, created_at, email, first_name, last_name, country, receipt, transaction_type, vendor, product_name, product_id, revenue, currency, affiliate, ac_contact_id" as const;

type CommonFilters = Pick<
  RefundFilterState,
  "search" | "transactionType" | "country" | "dateFrom" | "dateTo"
>;

// PostgREST requires values used inside `.or()` to be double-quoted, with
// embedded quotes/backslashes escaped, so a search term can't break out of
// its filter and smuggle in extra conditions.
function escapeIlikeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toRefund(row: Record<string, unknown>): Refund {
  return {
    id: String(row.id),
    receipt: (row.receipt as string) ?? "",
    transactionType: row.transaction_type as Refund["transactionType"],
    email: (row.email as string) ?? "",
    firstName: (row.first_name as string) ?? "",
    lastName: (row.last_name as string) ?? "",
    country: (row.country as string) ?? "",
    productName: (row.product_name as string) ?? "",
    productId: (row.product_id as string) ?? "",
    revenue: Number(row.revenue) || 0,
    currency: (row.currency as string) ?? "USD",
    vendor: (row.vendor as string) ?? "",
    affiliate: (row.affiliate as string) ?? "",
    acContactId: (row.ac_contact_id as string) ?? "",
    createdAt: row.created_at as string,
  };
}

/**
 * Distinct countries available for the filter dropdown. Deliberately scoped
 * only to the RFND/CHBK baseline (not the other active filters), so the
 * dropdown always shows the full set of valid options.
 */
export async function getRefundCountries(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("country")
    .in("transaction_type", REFUND_TYPES);

  if (error) throw new Error(`Falha ao buscar países: ${error.message}`);

  const unique = new Set(
    (data ?? [])
      .map((row) => row.country as string | null)
      .filter((country): country is string => Boolean(country))
  );
  return Array.from(unique).sort();
}

/**
 * Aggregate stats for the summary cards. Selects only `revenue` and
 * `transaction_type` — never the full row — for every record matching the
 * active filters, then sums/averages/counts in memory.
 */
export async function getRefundStats(filters: CommonFilters): Promise<RefundStats> {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from(TABLE)
    .select("revenue, transaction_type")
    .in("transaction_type", REFUND_TYPES);

  if (filters.transactionType !== "all") {
    query = query.eq("transaction_type", filters.transactionType);
  }
  if (filters.country !== "all") {
    query = query.eq("country", filters.country);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }
  if (filters.search.trim()) {
    const value = escapeIlikeValue(filters.search.trim());
    query = query.or(
      `email.ilike."%${value}%",receipt.ilike."%${value}%",first_name.ilike."%${value}%",last_name.ilike."%${value}%"`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao calcular estatísticas: ${error.message}`);

  const rows = data ?? [];
  const count = rows.length;
  const totalValue = rows.reduce((sum, row) => sum + (Number(row.revenue) || 0), 0);
  const chargebacks = rows.filter((row) => row.transaction_type === "CHBK").length;

  return {
    count,
    totalValue,
    average: count > 0 ? totalValue / count : 0,
    chargebacks,
  };
}

/**
 * The actual table rows for the current page — always exactly `pageSize`
 * rows (or fewer on the last page), via `.range()`. `count: "exact"` rides
 * along on the same request to also report the total matching rows, so
 * pagination never needs a second count query.
 */
export async function getRefundsPage(
  filters: CommonFilters,
  page: number,
  pageSize: number
): Promise<{ refunds: Refund[]; totalCount: number }> {
  const supabase = createSupabaseServerClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select(DISPLAY_COLUMNS, { count: "exact" })
    .in("transaction_type", REFUND_TYPES);

  if (filters.transactionType !== "all") {
    query = query.eq("transaction_type", filters.transactionType);
  }
  if (filters.country !== "all") {
    query = query.eq("country", filters.country);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }
  if (filters.search.trim()) {
    const value = escapeIlikeValue(filters.search.trim());
    query = query.or(
      `email.ilike."%${value}%",receipt.ilike."%${value}%",first_name.ilike."%${value}%",last_name.ilike."%${value}%"`
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) throw new Error(`Falha ao buscar refunds: ${error.message}`);

  return {
    refunds: (data ?? []).map((row) => toRefund(row as Record<string, unknown>)),
    totalCount: count ?? 0,
  };
}
