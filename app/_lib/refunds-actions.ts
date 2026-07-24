"use server";

import { invalidateRefundsSnapshot } from "./refunds-cache";

/** Forces the shared snapshot to be refetched from Supabase on next read. */
export async function refreshRefundsSnapshot(): Promise<void> {
  invalidateRefundsSnapshot();
}
