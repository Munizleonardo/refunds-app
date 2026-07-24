"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Refund, RefundFilterState, RefundStats } from "../_lib/types";
import { PAGE_SIZES } from "../_lib/parse-search-params";
import { SummaryCards } from "./SummaryCards";
import { RefundFilters } from "./RefundFilters";
import { RefundsTable } from "./RefundsTable";
import { Pagination } from "./Pagination";

interface RefundsDashboardProps {
  refunds: Refund[];
  stats: RefundStats;
  countries: string[];
  filters: RefundFilterState;
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
}

export function RefundsDashboard({
  refunds,
  stats,
  countries,
  filters,
  page,
  pageSize,
  pageCount,
  totalCount,
}: RefundsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Every filter/page-size change re-runs the Server Component with fresh
  // searchParams, which triggers a new (small, indexed) Supabase query —
  // never a client-side re-filter of already-downloaded data.
  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (resetPage) {
        params.delete("page");
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <>
      <SummaryCards stats={stats} />
      <RefundFilters
        filters={filters}
        countries={countries}
        onFilterChange={updateParams}
      />
      <RefundsTable refunds={refunds} />
      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizes={PAGE_SIZES}
        totalItems={totalCount}
        onPageChange={(nextPage) =>
          updateParams({ page: String(nextPage) }, false)
        }
        onPageSizeChange={(size) =>
          updateParams({ pageSize: String(size) })
        }
      />
    </>
  );
}
