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
    <article className="invoice-a4 mx-auto w-full overflow-hidden bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.16)] print:shadow-none">
      <div className="bg-[linear-gradient(135deg,#12345E_0%,#193E70_55%,#244E85_100%)] px-[28px] py-[22px] text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {data.company.logoUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.company.logoUrl}
                alt={`${data.company.name} logo`}
                className="h-[58px] w-[58px] rounded-[10px] object-cover"
              />
            ) : (
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[10px] border border-white/25 bg-white/10 text-[30px] font-bold leading-none">
                R
              </div>
            )}

            <div className="leading-tight">
              <div className="text-[34px] font-bold tracking-[0.02em]">
                {data.company.name || "RURAXIS"}
              </div>
              <div className="mt-[4px] text-[14px] font-medium text-white/90">
                {data.company.tagline || "Run Smarter. Grow Faster."}
              </div>
            </div>
          </div>

          <div className="pt-[6px] text-right">
            <div className="text-[42px] font-semibold uppercase tracking-[0.06em]">
              {titleForDoc(data.documentType)}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[4px] bg-[#58B6F3]" />

      <div className="border-b border-slate-300 bg-white">
        <div className="flex min-h-[54px] items-stretch">
          <div className="relative flex w-[430px] items-center border-r border-slate-300 bg-slate-50 pl-[28px] pr-[48px]">
            <div className="absolute right-[-26px] top-0 h-full w-[52px] skew-x-[-36deg] border-r border-slate-300 bg-slate-100" />
            <div className="relative z-10 text-[15px] font-semibold text-slate-900">
              {metaNumberLabel(data.documentType)}{" "}
              <span className="font-bold">{data.documentNumber}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end px-[28px] text-[15px] font-medium text-slate-800">
            <span>{metaRightLabel(data.documentType)}:</span>
            <span className="ml-2 font-semibold">{metaRightValue(data) || "—"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[28px] pt-[24px] pb-[20px]">
        <div className="grid grid-cols-[1.45fr_0.85fr] gap-8">
          <div>
            <div className="grid grid-cols-[118px_1fr] gap-4">
              <div className="pt-[2px] text-[20px] font-bold text-slate-900">
                {isDeliveryNote ? "Deliver To:" : "Bill To:"}
              </div>

              <div>
                <div className="text-[20px] font-semibold text-slate-900">
                  {data.customer.name || "John Doe"}
                </div>

              <div className="mt-[6px] space-y-[2px] text-[15px] leading-[1.55] text-slate-900">
                {data.customer.phone ? (
                    <div>
                    <span className="font-medium">Phone:</span> {data.customer.phone}
                    </div>
                ) : null}

                {data.customer.companyName ? (
                    <div>
                    <span className="font-medium">Company Name:</span> {data.customer.companyName}
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
            <div className="space-y-[8px] pt-[8px] text-[15px] text-slate-900">
              <ContactLine
                icon={<Globe className="h-[15px] w-[15px]" />}
                text={data.company.website}
              />
              <ContactLine
                icon={<Mail className="h-[15px] w-[15px]" />}
                text={data.company.emails.primary}
              />
              {/* <ContactLine
                icon={<Mail className="h-[15px] w-[15px]" />}
                text={data.company.emails.secondary}
              /> */}
              <ContactLine
                icon={<Phone className="h-[15px] w-[15px]" />}
                text={data.company.phone}
              />
            </div>
          </div>
        </div>

        <div className="mt-[28px] overflow-hidden border border-slate-300">
          <table className="w-full border-collapse text-[15px]">
            <thead className="bg-[linear-gradient(135deg,#163960_0%,#1D4679_100%)] text-white">
              <tr>
                <th className="w-[9%] border-r border-white/10 px-[14px] py-[13px] text-left text-[14px] font-semibold uppercase">
                  NO.
                </th>
                <th className="w-[39%] border-r border-white/10 px-[14px] py-[13px] text-left text-[14px] font-semibold uppercase">
                  {isDeliveryNote ? "ITEM DESCRIPTION" : "DESCRIPTION"}
                </th>
                <th className="w-[9%] border-r border-white/10 px-[14px] py-[13px] text-center text-[14px] font-semibold uppercase">
                  {isDeliveryNote ? "QTY ORDERED" : "QTY"}
                </th>
                <th className="w-[22%] border-r border-white/10 px-[14px] py-[13px] text-center text-[14px] font-semibold uppercase">
                  {isDeliveryNote ? "QTY DELIVERED" : `UNIT PRICE (${data.currency})`}
                </th>
                <th className="w-[21%] px-[14px] py-[13px] text-center text-[14px] font-semibold uppercase">
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
                      <td className="border-r border-slate-200 px-[14px] py-[14px] text-center text-slate-900">
                        {index + 1}
                      </td>
                      <td className="border-r border-slate-200 px-[14px] py-[14px] text-slate-900">
                        {item.description || "—"}
                      </td>
                      <td className="border-r border-slate-200 px-[14px] py-[14px] text-center text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="border-r border-slate-200 px-[14px] py-[14px] text-center text-slate-900">
                        {isDeliveryNote
                          ? item.quantity
                          : formatMoney(item.unitPrice, data.currency)}
                      </td>
                      <td className="px-[14px] py-[14px] text-center text-slate-900">
                        {isDeliveryNote
                          ? "Delivered"
                          : formatMoney(lineTotal, data.currency)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-t border-slate-300">
                  <td colSpan={5} className="px-[14px] py-[20px] text-center text-slate-500">
                    No line items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-[28px] grid grid-cols-[1fr_345px] gap-8">
          {!isDeliveryNote ? (
            <>
              <div className="self-start">
                <div className="w-[320px] text-[15px] text-slate-900">
                  <ApprovalValue label="Signed By" value={data.signedBy || ""} />
                  <ApprovalValue label="Signature" value="" />
                  <ApprovalValue label="Stamp" value="" />
                </div>

                {isProforma ? (
                  <div className="mt-[12px] text-[14px] leading-[1.55] text-slate-600">
                    This document is a quotation and does not confirm payment.
                  </div>
                ) : null}
              </div>

              <div className="justify-self-end">
                <div className="space-y-[7px] text-[15px]">
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

                <div className="mt-[14px] flex h-[52px] items-center justify-between bg-[linear-gradient(135deg,#163960_0%,#1D4679_100%)] px-[18px] text-white">
                  <span className="text-[16px] font-semibold">
                    {isProforma ? "Quoted Total:" : "Grand Total:"}
                  </span>
                  <span className="text-[18px] font-bold">
                    {formatMoney(subtotal, data.currency)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 grid grid-cols-2 gap-10 text-[15px] text-slate-900">
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

        <div className="mt-auto pt-[18px]">
          <div className="border-t border-slate-200 pt-[10px] text-[14px] text-slate-600">
            {data.notes?.trim() ? data.notes : "Thank you for doing business with us."}
          </div>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#12345E_0%,#193E70_55%,#244E85_100%)] px-[26px] py-[14px] text-white">
        <div className="grid grid-cols-3 items-center gap-4 text-[15px]">
          <FooterContact
            icon={<Globe className="h-[15px] w-[15px]" />}
            text={data.company.website || "ruraxis.com"}
          />
          <FooterContact
            icon={<Mail className="h-[15px] w-[15px]" />}
            text={data.company.emails.primary || "info@ruraxis.com"}
          />
          <FooterContact
            icon={<Mail className="h-[15px] w-[15px]" />}
            text={data.company.emails.secondary?.trim() ? data.company.emails.secondary : "support@ruraxis.com"}
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
    <div className="flex items-center gap-[10px]">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#17345C] text-white">
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
      <span className="min-w-[145px] border-b border-slate-200 pb-[1px] text-right font-semibold text-slate-900">
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
    <div className="mb-[10px]">
      <div className="text-[14px] font-medium text-slate-900">{label}</div>
      <div className="mt-[4px] min-h-[26px] border-b border-slate-300 pb-[2px]">
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
    <div className="flex items-center justify-center gap-[8px] border-r border-white/20 last:border-r-0">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/45">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}