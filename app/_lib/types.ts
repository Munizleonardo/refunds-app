export type TransactionType = "SALE" | "RFND" | "CHBK";

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
  /** All orders matching the active filters (SALE + RFND + CHBK). */
  totalOrders: number;
  /** How many of those were refunded or charged back. */
  refundedCount: number;
  /** Sum of `revenue` for RFND/CHBK rows only. */
  totalRefunded: number;
  /** Average refunded amount (totalRefunded / refundedCount). */
  averageRefund: number;
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
  /**
   * When the order/sale was recorded. The source table updates a row's
   * `transaction_type` in place when a refund/chargeback happens, without
   * recording when that happened — so this is NOT a refund date, even for
   * RFND/CHBK rows. There is currently no reliable refund-date field.
   */
  createdAt: string;
}
