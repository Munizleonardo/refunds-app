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
  updatedLabel: string;
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
  updatedLabel,
}: RefundsDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Every filter/page-size change re-runs the Server Component with fresh
  // searchParams, which re-filters the shared in-memory snapshot — it does
  // NOT trigger a new Supabase query. The snapshot itself only refreshes on
  // its TTL or when "Atualizar" is clicked, so it's shared by every visitor.
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
        updatedLabel={updatedLabel}
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
