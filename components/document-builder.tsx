"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Plus, Printer, Trash2, Upload } from "lucide-react";

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
  const [fitPreview, setFitPreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);

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

  useEffect(() => {
    function computePreviewScale() {
      if (!fitPreview) {
        setPreviewScale(1);
        return;
      }

      const width = window.innerWidth;

      if (width < 480) return setPreviewScale(0.42);
      if (width < 640) return setPreviewScale(0.48);
      if (width < 768) return setPreviewScale(0.56);
      if (width < 1024) return setPreviewScale(0.66);
      if (width < 1280) return setPreviewScale(0.74);
      if (width < 1536) return setPreviewScale(0.82);

      setPreviewScale(0.9);
    }

    computePreviewScale();
    window.addEventListener("resize", computePreviewScale);
    return () => window.removeEventListener("resize", computePreviewScale);
  }, [fitPreview]);

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

  function handlePrint() {
    const previousTitle = document.title;
    document.title = `${data.documentType.toLowerCase()}-${data.documentNumber}`;
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  }

  function handleDownloadPdf() {
    const previousTitle = document.title;
    document.title = `${data.documentType.toLowerCase()}-${data.documentNumber}`;
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  }

  const previewStyle = {
    "--preview-scale": String(fitPreview ? previewScale : 1),
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="screen-shell mx-auto max-w-[1700px] p-3 sm:p-4 lg:p-6">
        <div className="screen-only mb-5 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-sm">
            Ruraxis Document System
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Enterprise-grade business document generator
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Generate premium invoices, receipts, proformas, and delivery notes
            with live preview, configurable brand identity, selectable currency,
            and print-ready layout.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 lg:gap-6 lg:grid-cols-[390px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)]">
          <section className="builder-panel screen-only min-w-0 rounded-3xl border border-slate-200 p-3 shadow-sm sm:p-5 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white/70 px-4 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Document Setup</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Edit the document with live feedback, premium branding, and export-ready formatting.
              </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
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
                      <SelectTrigger className="h-11 rounded-xl bg-white">
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
                      <SelectTrigger className="h-11 rounded-xl bg-white">
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
                        <SelectTrigger className="h-11 rounded-xl bg-white">
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
                          <SelectTrigger className="h-11 rounded-xl bg-white">
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
                        className="h-11 rounded-xl bg-white"
                        value={data.documentNumber}
                        onChange={(e) => updateRoot("documentNumber", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Issue Date</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
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
                          className="h-11 rounded-xl bg-white"
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
                          <SelectTrigger className="h-11 rounded-xl bg-white">
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
                        className="h-11 rounded-xl bg-white"
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
                        className="h-11 rounded-xl bg-white"
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
                      className="h-11 rounded-xl bg-white"
                      value={data.company.name}
                      onChange={(e) => updateCompany("name", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Tagline</Label>
                    <Input
                      className="h-11 rounded-xl bg-white"
                      value={data.company.tagline || ""}
                      onChange={(e) => updateCompany("tagline", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Website</Label>
                    <Input
                      className="h-11 rounded-xl bg-white"
                      value={data.company.website}
                      onChange={(e) => updateCompany("website", e.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Primary Email</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.company.emails.primary}
                        onChange={(e) => updateCompanyEmail("primary", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Secondary Email</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.company.emails.secondary || ""}
                        onChange={(e) => updateCompanyEmail("secondary", e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Phone</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.company.phone || ""}
                        onChange={(e) => updateCompany("phone", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>TIN</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.company.tin || ""}
                        onChange={(e) => updateCompany("tin", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field>
                    <Label>Registration Number</Label>
                    <Input
                      className="h-11 rounded-xl bg-white"
                      value={data.company.registrationNumber || ""}
                      onChange={(e) =>
                        updateCompany("registrationNumber", e.target.value)
                      }
                    />
                  </Field>

                  <Field>
                    <Label>Upload Logo</Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                        className="h-11 w-full rounded-xl gap-2 bg-white sm:w-auto"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Select Logo From Device
                      </Button>
                      {data.company.logoUrl ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-11 w-full rounded-xl sm:w-auto"
                          onClick={clearLogo}
                        >
                          Remove Logo
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      The uploaded file is used directly in the printable preview.
                    </p>
                  </Field>

                  <Field>
                    <Label>Address</Label>
                    <Textarea
                      className="min-h-[104px] rounded-2xl bg-white"
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
                    <Label>
                      {data.documentType === "DELIVERY_NOTE"
                        ? "Receiver Name"
                        : "Customer Name"}
                    </Label>
                    <Input
                      className="h-11 rounded-xl bg-white"
                      value={data.customer.name}
                      onChange={(e) => updateCustomer("name", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <Label>Company Name</Label>
                    <Input
                      className="h-11 rounded-xl bg-white"
                      value={data.customer.companyName || ""}
                      onChange={(e) => updateCustomer("companyName", e.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <Label>Phone</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.customer.phone || ""}
                        onChange={(e) => updateCustomer("phone", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Email</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.customer.email || ""}
                        onChange={(e) => updateCustomer("email", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field>
                    <Label>Address</Label>
                    <Textarea
                      className="min-h-[104px] rounded-2xl bg-white"
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
                      <div key={item.id} className="builder-item-card rounded-2xl p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {data.businessSide === "SOFTWARE"
                              ? `Service ${index + 1}`
                              : `Item ${index + 1}`}
                          </p>

                          {data.items.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>

                        <div className="grid gap-4">
                          <Field>
                            <Label>
                              {data.businessSide === "SOFTWARE"
                                ? "Service Description"
                                : "Item Description"}
                            </Label>
                            <Input
                              className="h-11 rounded-xl bg-white"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(item.id, "description", e.target.value)
                              }
                            />
                          </Field>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field>
                              <Label>
                                {data.businessSide === "SOFTWARE"
                                  ? "Units / Phases"
                                  : "Quantity"}
                              </Label>
                              <Input
                                className="h-11 rounded-xl bg-white"
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
                                  className="h-11 rounded-xl bg-white"
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
                                <Input
                                  className="h-11 rounded-xl bg-white"
                                  value="Delivered"
                                  readOnly
                                />
                              </Field>
                            )}
                          </div>

                          {!["DELIVERY_NOTE"].includes(data.documentType) ? (
                            <div className="builder-summary-card rounded-xl px-4 py-3 text-sm">
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

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-xl gap-2 bg-white"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4" />
                    {data.businessSide === "SOFTWARE" ? "Add Service" : "Add Item"}
                  </Button>
                </div>
              </BuilderSection>

              {!["DELIVERY_NOTE"].includes(data.documentType) ? (
                <BuilderSection
                  title={data.documentType === "PROFORMA" ? "Quotation Notes" : "Payment & Notes"}
                >
                  <div className="grid gap-4">
                    {!["PROFORMA"].includes(data.documentType) ? (
                      <Field>
                        <Label>
                          {data.documentType === "RECEIPT"
                            ? "Amount Received"
                            : "Amount Paid"}
                        </Label>
                        <Input
                          className="h-11 rounded-xl bg-white"
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
                      <Label>Signed By</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.signedBy || ""}
                        onChange={(e) => updateRoot("signedBy", e.target.value)}
                        placeholder="Enter signer name"
                      />
                    </Field>

                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        className="min-h-[110px] rounded-2xl bg-white"
                        rows={4}
                        value={data.notes || ""}
                        onChange={(e) => updateRoot("notes", e.target.value)}
                      />
                    </Field>

                    <div className="builder-summary-card rounded-2xl p-4 text-sm">
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
                              {data.documentType === "RECEIPT"
                                ? "Amount Received"
                                : "Amount Paid"}
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
                        className="h-11 rounded-xl bg-white"
                        value={data.deliveredBy || ""}
                        onChange={(e) => updateRoot("deliveredBy", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Received By</Label>
                      <Input
                        className="h-11 rounded-xl bg-white"
                        value={data.receivedBy || ""}
                        onChange={(e) => updateRoot("receivedBy", e.target.value)}
                      />
                    </Field>

                    <Field>
                      <Label>Notes</Label>
                      <Textarea
                        className="min-h-[110px] rounded-2xl bg-white"
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

          <section className="print-shell min-w-0 rounded-3xl border border-slate-200 bg-[#dfe6ef] p-3 shadow-sm sm:p-5 lg:p-6">
            <div className="screen-only mb-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-sm">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Live Preview</h3>
                  <p className="text-sm text-slate-500">
                    Real A4 document. Fit mode changes only the on-screen stage.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant={fitPreview ? "default" : "outline"}
                    onClick={() => setFitPreview((prev) => !prev)}
                    className="w-full rounded-xl sm:w-auto"
                  >
                    {fitPreview ? "Fit Preview: On" : "Fit Preview: Off"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    className="w-full rounded-xl gap-2 bg-white sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>

                  <Button
                    type="button"
                    onClick={handlePrint}
                    className="w-full rounded-xl gap-2 sm:w-auto"
                  >
                    <Printer className="h-4 w-4" />
                    Print Preview
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto lg:overflow-visible">
              <div className="flex justify-start lg:justify-center">
                <div
                  className={fitPreview ? "preview-fit-shell shrink-0" : "shrink-0"}
                  style={previewStyle}
                >
                  <div className={fitPreview ? "preview-fit-inner" : ""}>
                    <div
                      id="print-document"
                      className="w-[210mm] max-w-none"
                    >
                      <DocumentPreview
                        data={data}
                        subtotal={subtotal}
                        balance={balance}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="screen-only mt-3 text-xs text-slate-500">
              Download PDF opens the print dialog. Choose “Save as PDF” for a soft copy.
            </p>
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
    <section className="builder-section rounded-3xl">
      <div className="border-b border-slate-200/80 px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid min-w-0 gap-2.5">{children}</div>;
}