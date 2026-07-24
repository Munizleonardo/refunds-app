import "server-only";
import { createSupabaseServerClient } from "./supabase-server";
import type { Refund } from "./types";

const TABLE = "clickbank_orders_email_us";
const REFUND_TYPES = ["RFND", "CHBK"] as const;

// Only the columns the UI renders. `raw_payload` is deliberately excluded —
// it's a heavy jsonb blob (~1.7KB/row) not shown anywhere here.
const DISPLAY_COLUMNS =
  "id, created_at, email, first_name, last_name, country, receipt, transaction_type, vendor, product_name, product_id, revenue, currency, affiliate, ac_contact_id" as const;

// How long the shared snapshot is served before the next request triggers a
// fresh read from Supabase. Every request in this window — from any user,
// with any combination of filters — reuses the same in-memory copy instead
// of hitting the database again. Opening the page never queries Supabase
// on its own; only the shared refresh cycle (or the "Atualizar" button) does.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface RefundsSnapshot {
  refunds: Refund[];
  countries: string[];
  fetchedAt: number;
}

let snapshot: RefundsSnapshot | null = null;
let pending: Promise<RefundsSnapshot> | null = null;

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

async function fetchSnapshot(): Promise<RefundsSnapshot> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(DISPLAY_COLUMNS)
    .in("transaction_type", REFUND_TYPES)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao buscar refunds: ${error.message}`);

  const refunds = (data ?? []).map((row) =>
    toRefund(row as Record<string, unknown>)
  );
  const countries = Array.from(
    new Set(refunds.map((r) => r.country).filter(Boolean))
  ).sort();

  return { refunds, countries, fetchedAt: Date.now() };
}

/**
 * The one shared snapshot every request reads from. This is the single
 * point of contact with Supabase — filtering, pagination and stats are all
 * derived from this in-memory array, never from a fresh per-request query.
 */
export async function getRefundsSnapshot(): Promise<RefundsSnapshot> {
  const isFresh = snapshot && Date.now() - snapshot.fetchedAt < CACHE_TTL_MS;
  if (isFresh) return snapshot as RefundsSnapshot;

  // Concurrent requests hitting a cold/expired cache share the same
  // in-flight fetch instead of each starting their own.
  if (!pending) {
    pending = fetchSnapshot().finally(() => {
      pending = null;
    });
  }

  snapshot = await pending;
  return snapshot;
}

/** Forces the next read to hit Supabase again. Used by "Atualizar". */
export function invalidateRefundsSnapshot(): void {
  snapshot = null;
}
