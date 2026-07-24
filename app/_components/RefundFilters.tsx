"use client";

import { useRef, useState } from "react";
import type { RefundFilterState } from "../_lib/types";
import { RefreshButton } from "./RefreshButton";

interface RefundFiltersProps {
  filters: RefundFilterState;
  countries: string[];
  onFilterChange: (updates: Record<string, string | null>) => void;
  updatedLabel: string;
}

const SEARCH_DEBOUNCE_MS = 400;

export function RefundFilters({
  filters,
  countries,
  onFilterChange,
  updatedLabel,
}: RefundFiltersProps) {
  // Local, immediately-responsive copy of the search text. Only pushed to
  // the URL (and therefore only re-queries Supabase) after the user pauses
  // typing, so we don't fire a request on every keystroke.
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ q: value || null });
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <label className="flex flex-col gap-1 sm:flex-1 sm:min-w-55">
          <span className="text-sm text-muted">Buscar</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="E-mail, recibo ou nome do cliente"
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent sm:py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 sm:contents">
          <label className="flex flex-col gap-1 sm:min-w-37.5">
            <span className="text-sm text-muted">Tipo</span>
            <select
              value={filters.transactionType}
              onChange={(e) => onFilterChange({ type: e.target.value })}
              className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent sm:py-2"
            >
              <option value="all">Todos</option>
              <option value="RFND">Refund</option>
              <option value="CHBK">Chargeback</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 sm:min-w-37.5">
            <span className="text-sm text-muted">País</span>
            <select
              value={filters.country}
              onChange={(e) => onFilterChange({ country: e.target.value })}
              className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent sm:py-2"
            >
              <option value="all">Todos</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3 col-span-2 sm:contents">
            <label className="flex flex-col gap-1 sm:min-w-35">
              <span className="text-sm text-muted">De</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange({ from: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent sm:py-2"
              />
            </label>

            <label className="flex flex-col gap-1 sm:min-w-35">
              <span className="text-sm text-muted">Até</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange({ to: e.target.value })}
                className="w-full cursor-pointer rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent sm:py-2"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:items-end">
          <RefreshButton />
          <span className="text-xs text-muted whitespace-nowrap">
            Atualizado {updatedLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
