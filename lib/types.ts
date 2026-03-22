export type DocumentType =
  | "INVOICE"
  | "RECEIPT"
  | "PROFORMA"
  | "DELIVERY_NOTE";

export type BusinessSide = "WHOLESALE" | "SOFTWARE";

export type CurrencyCode = "RWF" | "USD";

export type PaymentMethod = "CASH" | "CARD" | "MOMO" | "BANK";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type CompanyEmails = {
  primary: string;
  secondary?: string;
};

export type CompanyDetails = {
  name: string;
  tagline?: string;
  website: string;
  emails: CompanyEmails;
  phone?: string;
  address?: string;
  tin?: string;
  registrationNumber?: string;
  logoUrl?: string;
};

export type CustomerDetails = {
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type DocumentData = {
  documentType: DocumentType;
  businessSide: BusinessSide;
  currency: CurrencyCode;
  documentNumber: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  relatedInvoiceNumber?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  company: CompanyDetails;
  customer: CustomerDetails;
  items: LineItem[];
  notes?: string;
  signedBy?: string;
  deliveredBy?: string;
  receivedBy?: string;
};

