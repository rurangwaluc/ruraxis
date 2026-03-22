import { CurrencyCode, LineItem } from "./types";

export function formatMoney(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  }).format(amount);
}

export function calculateLineTotal(item: LineItem) {
  return item.quantity * item.unitPrice;
}

export function calculateSubtotal(items: LineItem[]) {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

export function calculateBalance(subtotal: number, amountPaid: number = 0) {
  return subtotal - amountPaid;
}

export function formatDocumentTypeLabel(value: string) {
  return value.replaceAll("_", " ");
}