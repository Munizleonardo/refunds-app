export type TransactionType = "RFND" | "CHBK";

export type PageSize = 10 | 15 | 20;

export interface RefundFilterState {
  search: string;
  transactionType: "all" | TransactionType;
  country: string;
  dateFrom: string;
  dateTo: string;
}

export interface RefundQueryState extends RefundFilterState {
  page: number;
  pageSize: PageSize;
}

export interface RefundStats {
  count: number;
  totalValue: number;
  average: number;
  chargebacks: number;
}

export interface Refund {
  id: string;
  receipt: string;
  transactionType: TransactionType;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  productName: string;
  productId: string;
  revenue: number;
  currency: string;
  vendor: string;
  affiliate: string;
  acContactId: string;
  createdAt: string;
}
