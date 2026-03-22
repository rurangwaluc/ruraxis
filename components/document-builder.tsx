"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Printer, Trash2, Upload } from "lucide-react";

import { DocumentPreview } from "@/components/document-preview";
import { defaultDocumentData } from "@/lib/defaults";
import { calculateBalance, calculateSubtotal, formatMoney } from "@/lib/format";
import { DocumentData, DocumentType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentBuilder() {
  const [data, setData] = useState<DocumentData>(defaultDocumentData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const subtotal = useMemo(() => calculateSubtotal(data.items), [data.items]);
  const balance = useMemo(
    () => calculateBalance(subtotal, data.amountPaid ?? 0),
    [subtotal, data.amountPaid],
  );

  const allowedDocumentTypes: DocumentType[] =
    data.businessSide === "SOFTWARE"
      ? ["INVOICE", "RECEIPT", "PROFORMA"]
      : ["INVOICE", "RECEIPT", "PROFORMA", "DELIVERY_NOTE"];

  function updateRoot<K extends keyof DocumentData>(key: K, value: DocumentData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateCompany<K extends keyof DocumentData["company"]>(
    key: K,
    value: DocumentData["company"][K],
  ) {
    setData((prev) => ({
      ...prev,
      company: { ...prev.company, [key]: value },
    }));
  }

  function updateCompanyEmail(type: "primary" | "secondary", value: string) {
    setData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        emails: {
          ...prev.company.emails,
          [type]: value,
        },
      },
    }));
  }

  function updateCustomer<K extends keyof DocumentData["customer"]>(
    key: K,
    value: DocumentData["customer"][K],
  ) {
    setData((prev) => ({
      ...prev,
      customer: { ...prev.customer, [key]: value },
    }));
  }

  function updateItem(
    id: string,
    key: "description" | "quantity" | "unitPrice",
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Number.isFinite(Number(value))
                    ? Number(value)
                    : 0,
            }
          : item,
      ),
    }));
  }

  function addItem() {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  }

  function removeItem(id: string) {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }

  function handleBusinessSideChange(value: "WHOLESALE" | "SOFTWARE") {
    setData((prev) => {
      let nextType = prev.documentType;

      if (value === "SOFTWARE" && prev.documentType === "DELIVERY_NOTE") {
        nextType = "INVOICE";
      }

      return {
        ...prev,
        businessSide: value,
        documentType: nextType,
        items:
          value === "SOFTWARE"
            ? prev.items.map((item) => ({
                ...item,
                quantity: item.quantity || 1,
              }))
            : prev.items,
      };
    });
  }

  function handleDocumentTypeChange(value: DocumentType) {
    setData((prev) => {
      const next: DocumentData = {
        ...prev,
        documentType: value,
      };

      if (value === "PROFORMA") {
        next.amountPaid = 0;
        next.paymentStatus = "UNPAID";
      }

      if (value === "RECEIPT") {
        next.paymentStatus = "PAID";
      }

      if (value === "DELIVERY_NOTE") {
        next.amountPaid = 0;
        next.paymentStatus = "UNPAID";
      }

      return next;
    });
  }

  function handleLogoUpload(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        updateCompany("logoUrl", result);
      }
    };
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    updateCompany("logoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1700px] p-4 lg:p-6 screen-shell">
        <div className="mb-6 screen-only">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Ruraxis Document System
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Enterprise-grade business document generator
          </h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-600">
            Generate premium invoices, receipts, proformas, and delivery notes
            with live preview, configurable brand identity, selectable currency,
            and print-ready layout.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[430px_minmax(0,1fr)] xl:grid-cols-[470px_minmax(0,1fr)]">
          <section className="screen-only rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">Document Setup</h2>
              <p className="mt-1 text-sm text-slate-500">
                Edit the fields. The preview updates instantly.
              </p>
            </div>

            <div className="space-y-6">
              <BuilderSection title="Document Settings">
                <div className="grid gap-4">
                  <Field>
                    <Label>Business Side</Label>
                    <Select
                      value={data.businessSide}
                      onValueChange={(value: "WHOLESALE" | "SOFTWARE") =>
                        handleBusinessSideChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business side" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                        <SelectItem value="SOFTWARE">Software</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label>Document Type</Label>
                    <Select
                      value={data.documentType}
                      onValueChange={(value: DocumentType) =>
                        handleDocumentTypeChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedDocumentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Currency</Label>
                      <Select
                        value={data.currency}
                        onValueChange={(value: "RWF" | "USD") =>
                          updateRoot("currency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {!["PROFORMA", "DELIVERY_NOTE"].includes(data.documentType) ? (
                      <Field>
                        <Label>Payment Method</Label>
                        <Select
                          value={data.paymentMethod}
                          onValueChange={(value: "CASH" | "MOMO" | "BANK") =>
                            updateRoot("paymentMethod", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="MOMO">MoMo</SelectItem>
                            <SelectItem value="BANK">Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Document Number</Label>
                      <Input
                        value={data.documentNumber}
                        onChange={(e) => updateRoot("documentNumber", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={data.issueDate}
                        onChange={(e) => updateRoot("issueDate", e.target.value)}
                      />
                    </Field>
                  </div>

                  {data.documentType === "INVOICE" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={data.dueDate || ""}
                          onChange={(e) => updateRoot("dueDate", e.target.value)}
                        />
                      </Field>

                      <Field>
                        <Label>Payment Status</Label>
                        <Select
                          value={data.paymentStatus}
                          onValueChange={(value: "UNPAID" | "PARTIAL" | "PAID") =>
                            updateRoot("paymentStatus", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  ) : null}

                  {data.documentType === "PROFORMA" ? (
                    <Field>
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={data.validUntil || ""}
                        onChange={(e) => updateRoot("validUntil", e.target.value)}
                      />
                    </Field>
                  ) : null}

                  {data.documentType === "DELIVERY_NOTE" ? (
                    <Field>
                      <Label>Related Invoice Number</Label>
                      <Input
                        value={data.relatedInvoiceNumber || ""}
                        onChange={(e) =>
                          updateRoot("relatedInvoiceNumber", e.target.value)
                        }
                        placeholder="INV-2026-001"
                      />
                    </Field>
                  ) : null}
                </div>
              </BuilderSection>

              <BuilderSection title="Company Details">
                <div className="grid gap-4">
                  <Field>
                    <Label>Company Name</Label>
                    <Input
                      value={data.company.name}
                      onChange={(e) => updateCompany("name", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Tagline</Label>
                    <Input
                      value={data.company.tagline || ""}
                      onChange={(e) => updateCompany("tagline", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Website</Label>
                    <Input
                      value={data.company.website}
                      onChange={(e) => updateCompany("website", e.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Primary Email</Label>
                      <Input
                        value={data.company.emails.primary}
                        onChange={(e) => updateCompanyEmail("primary", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Secondary Email</Label>
                      <Input
                        value={data.company.emails.secondary || ""}
                        onChange={(e) => updateCompanyEmail("secondary", e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Phone</Label>
                      <Input
                        value={data.company.phone || ""}
                        onChange={(e) => updateCompany("phone", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>TIN</Label>
                      <Input
                        value={data.company.tin || ""}
                        onChange={(e) => updateCompany("tin", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field>
                    <Label>Registration Number</Label>
                    <Input
                      value={data.company.registrationNumber || ""}
                      onChange={(e) =>
                        updateCompany("registrationNumber", e.target.value)
                      }
                    />
                  </Field>

                  <Field>
                    <Label>Upload Logo</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Select Logo From Device
                      </Button>
                      {data.company.logoUrl ? (
                        <Button type="button" variant="ghost" onClick={clearLogo}>
                          Remove Logo
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      The uploaded file is used directly in the printable preview.
                    </p>
                  </Field>

                  <Field>
                    <Label>Address</Label>
                    <Textarea
                      value={data.company.address || ""}
                      onChange={(e) => updateCompany("address", e.target.value)}
                      rows={3}
                    />
                  </Field>
                </div>
              </BuilderSection>

              <BuilderSection title="Customer Details">
                <div className="grid gap-4">
                  <Field>
                    <Label>{data.documentType === "DELIVERY_NOTE" ? "Receiver Name" : "Customer Name"}</Label>
                    <Input
                      value={data.customer.name}
                      onChange={(e) => updateCustomer("name", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Company Name</Label>
                    <Input
                      value={data.customer.companyName || ""}
                      onChange={(e) => updateCustomer("companyName", e.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Phone</Label>
                      <Input
                        value={data.customer.phone || ""}
                        onChange={(e) => updateCustomer("phone", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Email</Label>
                      <Input
                        value={data.customer.email || ""}
                        onChange={(e) => updateCustomer("email", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field>
                    <Label>Address</Label>
                    <Textarea
                      value={data.customer.address || ""}
                      onChange={(e) => updateCustomer("address", e.target.value)}
                      rows={3}
                    />
                  </Field>
                </div>
              </BuilderSection>

              <BuilderSection title={data.businessSide === "SOFTWARE" ? "Services" : "Items"}>
                <div className="space-y-4">
                  {data.items.map((item, index) => {
                    const amount = item.quantity * item.unitPrice;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {data.businessSide === "SOFTWARE" ? `Service ${index + 1}` : `Item ${index + 1}`}
                          </p>

                          {data.items.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>

                        <div className="grid gap-4">
                          <Field>
                            <Label>
                              {data.businessSide === "SOFTWARE" ? "Service Description" : "Item Description"}
                            </Label>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateItem(item.id, "description", e.target.value)
                              }
                            />
                          </Field>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                              <Label>
                                {data.businessSide === "SOFTWARE" ? "Units / Phases" : "Quantity"}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.id, "quantity", e.target.value)
                                }
                              />
                            </Field>

                            {!["DELIVERY_NOTE"].includes(data.documentType) ? (
                              <Field>
                                <Label>Unit Price</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItem(item.id, "unitPrice", e.target.value)
                                  }
                                />
                              </Field>
                            ) : (
                              <Field>
                                <Label>Remarks</Label>
                                <Input value="Delivered" readOnly />
                              </Field>
                            )}
                          </div>

                          {!["DELIVERY_NOTE"].includes(data.documentType) ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-600">Line Total</span>
                                <span className="font-semibold text-slate-950">
                                  {formatMoney(amount, data.currency)}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  <Button type="button" variant="outline" className="w-full gap-2" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                    {data.businessSide === "SOFTWARE" ? "Add Service" : "Add Item"}
                  </Button>
                </div>
              </BuilderSection>

              {!["DELIVERY_NOTE"].includes(data.documentType) ? (
                <BuilderSection title={data.documentType === "PROFORMA" ? "Quotation Notes" : "Payment & Notes"}>
                  <div className="grid gap-4">
                    {!["PROFORMA"].includes(data.documentType) ? (
                      <Field>
                        <Label>{data.documentType === "RECEIPT" ? "Amount Received" : "Amount Paid"}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={data.amountPaid ?? 0}
                          onChange={(e) =>
                            updateRoot("amountPaid", Number(e.target.value || 0))
                          }
                        />
                      </Field>
                    ) : null}

                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        rows={4}
                        value={data.notes || ""}
                        onChange={(e) => updateRoot("notes", e.target.value)}
                      />
                    </Field>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-semibold text-slate-950">
                            {formatMoney(subtotal, data.currency)}
                          </span>
                        </div>

                        {!["PROFORMA"].includes(data.documentType) ? (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-600">
                              {data.documentType === "RECEIPT" ? "Amount Received" : "Amount Paid"}
                            </span>
                            <span className="font-semibold text-slate-950">
                              {formatMoney(data.amountPaid ?? 0, data.currency)}
                            </span>
                          </div>
                        ) : null}

                        {!["PROFORMA"].includes(data.documentType) ? (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-600">Balance</span>
                            <span className="font-semibold text-slate-950">
                              {formatMoney(balance, data.currency)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </BuilderSection>
              ) : (
                <BuilderSection title="Delivery Approval">
                  <div className="grid gap-4">
                    <Field>
                      <Label>Delivered By</Label>
                      <Input
                        value={data.deliveredBy || ""}
                        onChange={(e) => updateRoot("deliveredBy", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Received By</Label>
                      <Input
                        value={data.receivedBy || ""}
                        onChange={(e) => updateRoot("receivedBy", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        rows={4}
                        value={data.notes || ""}
                        onChange={(e) => updateRoot("notes", e.target.value)}
                      />
                    </Field>
                  </div>
                </BuilderSection>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-200 p-4 shadow-sm lg:p-6 print-shell">
            <div className="mb-4 flex items-center justify-end screen-only">
              <Button type="button" onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Preview
              </Button>
            </div>

            <div className="overflow-auto">
              <div id="print-document">
                <DocumentPreview data={data} subtotal={subtotal} balance={balance} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function BuilderSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}