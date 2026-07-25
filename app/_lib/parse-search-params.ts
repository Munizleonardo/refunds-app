import type { PageSize, RefundQueryState, TransactionType } from "./types";

export const PAGE_SIZES: readonly PageSize[] = [10, 15, 20];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

type RawSearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseSearchParams(raw: RawSearchParams): RefundQueryState {
  const search = first(raw.q).slice(0, 200);

  const rawType = first(raw.type);
  const transactionType: "all" | TransactionType =
    rawType === "SALE" || rawType === "RFND" || rawType === "CHBK"
      ? rawType
      : "all";

  const country = first(raw.country) || "all";

  const rawFrom = first(raw.from);
  const dateFrom = isValidDate(rawFrom) ? rawFrom : "";

  const rawTo = first(raw.to);
  const dateTo = isValidDate(rawTo) ? rawTo : "";

  const rawPageSize = Number(first(raw.pageSize));
  const pageSize = PAGE_SIZES.includes(rawPageSize as PageSize)
    ? (rawPageSize as PageSize)
    : DEFAULT_PAGE_SIZE;

  const rawPage = Number(first(raw.page));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  return { search, transactionType, country, dateFrom, dateTo, page, pageSize };
}
