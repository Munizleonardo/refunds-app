import "server-only";
import { createSupabaseServerClient } from "./supabase-server";
import type { Refund } from "./types";

const TABLE = "clickbank_orders_email_us";
// Real orders only — excludes ABANDONED_ORDER (carts that never became a
// sale, so they can't have a refund status).
const ORDER_TYPES = ["SALE", "RFND", "CHBK"] as const;

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

// ~30k rows include SALE, so an unbounded `select ... order by created_at`
// scans/sorts the whole table (no index on created_at) and hits Supabase's
// statement timeout. Fetching in small chunks ordered by the primary key
// (indexed, so each chunk is fast and — unlike an unindexed sort — stable
// across separate requests) avoids that. The chronological order the UI
// actually wants is applied once, in memory, after everything is in.
const FETCH_CHUNK_SIZE = 1000;
const MAX_CHUNKS = 200; // safety cap (~200k rows) against a runaway loop
const CHUNK_CONCURRENCY = 6; // avoid bursting the connection pool

async function fetchChunk(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  chunkIndex: number
): Promise<Refund[]> {
  const from = chunkIndex * FETCH_CHUNK_SIZE;
  const { data, error } = await supabase
    .from(TABLE)
    .select(DISPLAY_COLUMNS)
    .in("transaction_type", ORDER_TYPES)
    .order("id", { ascending: true })
    .range(from, from + FETCH_CHUNK_SIZE - 1);

  if (error) throw new Error(`Falha ao buscar pedidos: ${error.message}`);
  return (data ?? []).map((row) => toRefund(row as Record<string, unknown>));
}

async function fetchAllOrders(): Promise<Refund[]> {
  const supabase = createSupabaseServerClient();

  const { count, error: countError } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .in("transaction_type", ORDER_TYPES);

  if (countError) {
    throw new Error(
      `Falha ao contar pedidos: ${countError.message || "erro desconhecido ao contar"}`
    );
  }

  const totalChunks = Math.min(
    MAX_CHUNKS,
    Math.max(1, Math.ceil((count ?? 0) / FETCH_CHUNK_SIZE))
  );

  // The count is known upfront, so chunks can be requested concurrently
  // instead of one at a time — capped so a once-a-day refresh doesn't
  // burst the connection pool with dozens of simultaneous requests.
  const all: Refund[] = [];
  for (let start = 0; start < totalChunks; start += CHUNK_CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(CHUNK_CONCURRENCY, totalChunks - start) },
      (_, i) => fetchChunk(supabase, start + i)
    );
    const results = await Promise.all(batch);
    for (const rows of results) all.push(...rows);
  }

  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all;
}

async function fetchSnapshot(): Promise<RefundsSnapshot> {
  const refunds = await fetchAllOrders();
  const countries = Array.from(
    new Set(refunds.map((r) => r.country).filter(Boolean))
  ).sort();

  return { refunds, countries, fetchedAt: Date.now() };
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

/** This whole pipeline runs once a day at most — a couple of retries on transient failure is cheap insurance. */
async function fetchSnapshotWithRetry(): Promise<RefundsSnapshot> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchSnapshot();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw lastError;
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
    pending = fetchSnapshotWithRetry().finally(() => {
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
