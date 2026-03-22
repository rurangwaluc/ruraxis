import { BusinessSide, CurrencyCode, DocumentType, PaymentMethod } from "./types";

export const DOCUMENT_TYPES: DocumentType[] = [
  "INVOICE",
  "RECEIPT",
  "PROFORMA",
  "DELIVERY_NOTE",
];

export const BUSINESS_SIDES: BusinessSide[] = ["WHOLESALE", "SOFTWARE"];

export const CURRENCIES: CurrencyCode[] = ["RWF", "USD"];

export const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CARD", "MOMO", "BANK"];