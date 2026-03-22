import { DocumentData } from "./types";

export const defaultDocumentData: DocumentData = {
  documentType: "INVOICE",
  businessSide: "WHOLESALE",
  currency: "RWF",
  documentNumber: "INV-2026-001",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  validUntil: "",
  relatedInvoiceNumber: "",
  paymentMethod: "CASH",
  paymentStatus: "UNPAID",
  amountPaid: 0,
  company: {
    name: "Ruraxis",
    tagline: "Run Smarter. Grow Faster.",
    website: "ruraxis.com",
    emails: {
      primary: "info@ruraxis.com",
      secondary: "ruraxis@gmail.com",
    },
    phone: "+250 785 587 830",
    address: "TCB, Town Center, Kigali",
    tin: "121608272",
    registrationNumber: "",
    logoUrl: "",
  },
  customer: {
    name: "Luc Rurangwa",
    companyName: "Gizmocean Ltd.",
    phone: "+250 783 344 482",
    email: "lucrurangwa@gmail.com",
    address: "Kigali, Rwanda",
  },
  items: [
    { id: "1", description: "Laptops: 1030 G3 i7", quantity: 1, unitPrice: 850000 },
    { id: "2", description: "Wireless Mouse", quantity: 1, unitPrice: 25000 },
  ],
  notes: "",
  signedBy: "",
  deliveredBy: "",
  receivedBy: "",
};