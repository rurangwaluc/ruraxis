"use client";

import { Globe, Mail, Phone } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { DocumentData } from "@/lib/types";

type DocumentPreviewProps = {
  data: DocumentData;
  subtotal: number;
  balance: number;
};

export function DocumentPreview({
  data,
  subtotal,
  balance,
}: DocumentPreviewProps) {
  const isDeliveryNote = data.documentType === "DELIVERY_NOTE";
  const isProforma = data.documentType === "PROFORMA";
  const isReceipt = data.documentType === "RECEIPT";

  return (
    <article className="invoice-a4 mx-auto overflow-hidden bg-white text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.18)] print:shadow-none">
      <div className="bg-[linear-gradient(135deg,#12345E_0%,#193E70_55%,#244E85_100%)] px-[24px] py-[18px] text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {data.company.logoUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.company.logoUrl}
                alt={`${data.company.name} logo`}
                className="h-[54px] w-[54px] rounded-[10px] object-cover"
              />
            ) : (
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[10px] border border-white/25 bg-white/10 text-[28px] font-bold leading-none">
                R
              </div>
            )}

            <div className="leading-tight">
              <div className="text-[31px] font-bold tracking-[0.02em]">
                {data.company.name || "RURAXIS"}
              </div>
              <div className="mt-[3px] text-[13px] font-medium text-white/90">
                {data.company.tagline || "Run Smarter. Grow Faster."}
              </div>
            </div>
          </div>

          <div className="pt-[4px] text-right">
            <div className="text-[38px] font-semibold uppercase tracking-[0.06em]">
              {titleForDoc(data.documentType)}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[4px] bg-[#58B6F3]" />

      <div className="border-b border-slate-300 bg-white">
        <div className="flex min-h-[50px] items-stretch">
          <div className="relative flex w-[395px] items-center border-r border-slate-300 bg-slate-50 pl-[24px] pr-[44px]">
            <div className="absolute right-[-24px] top-0 h-full w-[48px] skew-x-[-36deg] border-r border-slate-300 bg-slate-100" />
            <div className="relative z-10 text-[14px] font-semibold text-slate-900">
              {metaNumberLabel(data.documentType)}{" "}
              <span className="font-bold">{data.documentNumber}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end px-[24px] text-[14px] font-medium text-slate-800">
            <span>{metaRightLabel(data.documentType)}:</span>
            <span className="ml-2 font-semibold">{metaRightValue(data) || "—"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[24px] pb-[18px] pt-[22px]">
        <div className="grid grid-cols-[1.5fr_0.8fr] gap-8">
          <div>
            <div className="grid grid-cols-[108px_1fr] gap-4">
              <div className="pt-[2px] text-[19px] font-bold text-slate-900">
                {isDeliveryNote ? "Deliver To:" : "Bill To:"}
              </div>

              <div>
                <div className="text-[19px] font-semibold text-slate-900">
                  {data.customer.name || "John Doe"}
                </div>

                <div className="mt-[5px] space-y-[2px] text-[14px] leading-[1.5] text-slate-900">
                  {data.customer.phone ? (
                    <div>
                      <span className="font-medium">Phone:</span> {data.customer.phone}
                    </div>
                  ) : null}

                  {data.customer.companyName ? (
                    <div>
                      <span className="font-medium">Company Name:</span>{" "}
                      {data.customer.companyName}
                    </div>
                  ) : null}

                  {data.customer.address ? (
                    <div>
                      <span className="font-medium">Address:</span> {data.customer.address}
                    </div>
                  ) : null}

                  {data.customer.email ? (
                    <div>
                      <span className="font-medium">Email:</span> {data.customer.email}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="justify-self-end">
            <div className="space-y-[8px] pt-[6px] text-[14px] text-slate-900">
              <ContactLine
                icon={<Globe className="h-[14px] w-[14px]" />}
                text={data.company.website}
              />
              <ContactLine
                icon={<Mail className="h-[14px] w-[14px]" />}
                text={data.company.emails.primary}
              />
              <ContactLine
                icon={<Phone className="h-[14px] w-[14px]" />}
                text={data.company.phone}
              />
            </div>
          </div>
        </div>

        <div className="mt-[24px] overflow-hidden border border-slate-300">
          <table className="w-full border-collapse text-[14px]">
            <thead className="bg-[linear-gradient(135deg,#163960_0%,#1D4679_100%)] text-white">
              <tr>
                <th className="w-[8%] border-r border-white/10 px-[12px] py-[12px] text-left text-[13px] font-semibold uppercase">
                  NO.
                </th>
                <th className="w-[41%] border-r border-white/10 px-[12px] py-[12px] text-left text-[13px] font-semibold uppercase">
                  {isDeliveryNote ? "ITEM DESCRIPTION" : "DESCRIPTION"}
                </th>
                <th className="w-[9%] border-r border-white/10 px-[12px] py-[12px] text-center text-[13px] font-semibold uppercase">
                  {isDeliveryNote ? "QTY ORDERED" : "QTY"}
                </th>
                <th className="w-[21%] border-r border-white/10 px-[12px] py-[12px] text-center text-[13px] font-semibold uppercase">
                  {isDeliveryNote
                    ? "QTY DELIVERED"
                    : `UNIT PRICE (${data.currency})`}
                </th>
                <th className="w-[21%] px-[12px] py-[12px] text-center text-[13px] font-semibold uppercase">
                  {isDeliveryNote ? "REMARKS" : `AMOUNT (${data.currency})`}
                </th>
              </tr>
            </thead>

            <tbody>
              {data.items.length > 0 ? (
                data.items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;

                  return (
                    <tr key={item.id} className="border-t border-slate-300">
                      <td className="border-r border-slate-200 px-[12px] py-[12px] text-center text-slate-900">
                        {index + 1}
                      </td>
                      <td className="border-r border-slate-200 px-[12px] py-[12px] text-slate-900">
                        {item.description || "—"}
                      </td>
                      <td className="border-r border-slate-200 px-[12px] py-[12px] text-center text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="border-r border-slate-200 px-[12px] py-[12px] text-center text-slate-900">
                        {isDeliveryNote
                          ? item.quantity
                          : formatMoney(item.unitPrice, data.currency)}
                      </td>
                      <td className="px-[12px] py-[12px] text-center text-slate-900">
                        {isDeliveryNote
                          ? "Delivered"
                          : formatMoney(lineTotal, data.currency)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-t border-slate-300">
                  <td colSpan={5} className="px-[12px] py-[18px] text-center text-slate-500">
                    No line items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-[24px] grid grid-cols-[1fr_320px] gap-8">
          {!isDeliveryNote ? (
            <>
              <div className="self-start">
                <div className="w-[300px] text-[14px] text-slate-900">
                  <ApprovalValue label="Signed By" value={data.signedBy || ""} />
                  <ApprovalValue label="Signature" value="" />
                  <ApprovalValue label="Stamp" value="" />
                </div>

                {isProforma ? (
                  <div className="mt-[10px] max-w-[360px] text-[13px] leading-[1.5] text-slate-600">
                    This document is a quotation and does not confirm payment.
                  </div>
                ) : null}
              </div>

              <div className="justify-self-end">
                <div className="space-y-[6px] text-[14px]">
                  <AmountLine
                    label={isReceipt ? "Total Amount:" : "Subtotal:"}
                    value={formatMoney(subtotal, data.currency)}
                  />

                  {!isProforma ? (
                    <AmountLine
                      label={isReceipt ? "Amount Received:" : "Amount Paid:"}
                      value={formatMoney(data.amountPaid ?? 0, data.currency)}
                    />
                  ) : null}

                  {!isProforma ? (
                    <AmountLine
                      label={isReceipt ? "Balance:" : "Balance Due:"}
                      value={formatMoney(balance, data.currency)}
                    />
                  ) : null}
                </div>

                <div className="mt-[12px] flex h-[48px] items-center justify-between bg-[linear-gradient(135deg,#163960_0%,#1D4679_100%)] px-[16px] text-white">
                  <span className="text-[15px] font-semibold">
                    {isProforma ? "Quoted Total:" : "Grand Total:"}
                  </span>
                  <span className="text-[17px] font-bold">
                    {formatMoney(subtotal, data.currency)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 grid grid-cols-2 gap-10 text-[14px] text-slate-900">
              <div>
                <ApprovalValue label="Delivered By" value={data.deliveredBy || ""} />
                <ApprovalValue label="Signature" value="" />
                <ApprovalValue label="Stamp" value="" />
              </div>

              <div>
                <ApprovalValue label="Received By" value={data.receivedBy || ""} />
                <ApprovalValue label="Signature" value="" />
                <ApprovalValue label="Stamp" value="" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-[16px]">
          <div className="border-t border-slate-200 pt-[9px] text-[13px] text-slate-600">
            {data.notes?.trim() ? data.notes : "Thank you for doing business with us."}
          </div>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#12345E_0%,#193E70_55%,#244E85_100%)] px-[22px] py-[12px] text-white">
        <div className="grid grid-cols-3 items-center gap-3 text-[13px]">
          <FooterContact
            icon={<Globe className="h-[13px] w-[13px]" />}
            text={data.company.website || "ruraxis.com"}
          />
          <FooterContact
            icon={<Mail className="h-[13px] w-[13px]" />}
            text={data.company.emails.primary || "info@ruraxis.com"}
          />
          <FooterContact
            icon={<Mail className="h-[13px] w-[13px]" />}
            text={
              data.company.emails.secondary?.trim()
                ? data.company.emails.secondary
                : "support@ruraxis.com"
            }
          />
        </div>
      </div>
    </article>
  );
}

function titleForDoc(documentType: DocumentData["documentType"]) {
  if (documentType === "RECEIPT") return "RECEIPT";
  if (documentType === "PROFORMA") return "PROFORMA";
  if (documentType === "DELIVERY_NOTE") return "DELIVERY NOTE";
  return "INVOICE";
}

function metaNumberLabel(documentType: DocumentData["documentType"]) {
  if (documentType === "RECEIPT") return "Receipt#";
  if (documentType === "PROFORMA") return "Proforma#";
  if (documentType === "DELIVERY_NOTE") return "Delivery Note#";
  return "Invoice#";
}

function metaRightLabel(documentType: DocumentData["documentType"]) {
  if (documentType === "INVOICE") return "Due";
  if (documentType === "PROFORMA") return "Valid Until";
  return "Date";
}

function metaRightValue(data: DocumentData) {
  if (data.documentType === "INVOICE") return data.dueDate || data.issueDate;
  if (data.documentType === "PROFORMA") return data.validUntil || data.issueDate;
  return data.issueDate;
}

function ContactLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text?: string;
}) {
  if (!text?.trim()) return null;

  return (
    <div className="flex items-center gap-[9px]">
      <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#17345C] text-white">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

function AmountLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-900">{label}</span>
      <span className="min-w-[136px] border-b border-slate-200 pb-[1px] text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ApprovalValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-[9px]">
      <div className="text-[13px] font-medium text-slate-900">{label}</div>
      <div className="mt-[4px] min-h-[24px] border-b border-slate-300 pb-[2px]">
        {value || " "}
      </div>
    </div>
  );
}

function FooterContact({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text?: string;
}) {
  if (!text?.trim()) return null;

  return (
    <div className="flex items-center justify-center gap-[7px] border-r border-white/20 last:border-r-0">
      <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full border border-white/45">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}