"use client";

export interface CsaFields {
  providerName?: string;
  providerAddress?: string;
  customerName?: string;
  customerAddress?: string;
  effectiveDate?: string;
  orderDate?: string;
  subscriptionPeriod?: string;
  nonRenewalNoticeDate?: string;
  fees?: string;
  paymentProcess?: string;
  technicalSupport?: string;
  useLimitations?: string;
  governingLaw?: string;
  chosenCourts?: string;
  generalCapAmount?: string;
  providerCoveredClaims?: string;
  customerCoveredClaims?: string;
  additionalWarranties?: string;
  dpa?: string;
}

interface Props {
  fields: CsaFields;
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="col-span-2 text-gray-900">{value}</span>
    </div>
  );
}

export default function CsaPreview({ fields: f }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const handleDownload = () => {
    const lines = [
      `# Cloud Service Agreement`,
      ``,
      `## Order Form`,
      ``,
      f.providerName ? `**Provider:** ${f.providerName}` : "",
      f.providerAddress ? `**Provider Address:** ${f.providerAddress}` : "",
      f.customerName ? `**Customer:** ${f.customerName}` : "",
      f.customerAddress ? `**Customer Address:** ${f.customerAddress}` : "",
      f.effectiveDate ? `**Effective Date:** ${f.effectiveDate}` : "",
      f.orderDate ? `**Order Date:** ${f.orderDate}` : "",
      f.subscriptionPeriod ? `**Subscription Period:** ${f.subscriptionPeriod}` : "",
      f.nonRenewalNoticeDate ? `**Non-Renewal Notice:** ${f.nonRenewalNoticeDate}` : "",
      f.fees ? `**Fees:** ${f.fees}` : "",
      f.paymentProcess ? `**Payment Process:** ${f.paymentProcess}` : "",
      f.technicalSupport ? `**Technical Support:** ${f.technicalSupport}` : "",
      f.useLimitations ? `**Use Limitations:** ${f.useLimitations}` : "",
      f.governingLaw ? `**Governing Law:** ${f.governingLaw}` : "",
      f.chosenCourts ? `**Chosen Courts:** ${f.chosenCourts}` : "",
      f.generalCapAmount ? `**General Cap Amount:** ${f.generalCapAmount}` : "",
      f.providerCoveredClaims ? `**Provider Covered Claims:** ${f.providerCoveredClaims}` : "",
      f.customerCoveredClaims ? `**Customer Covered Claims:** ${f.customerCoveredClaims}` : "",
      f.additionalWarranties ? `**Additional Warranties:** ${f.additionalWarranties}` : "",
      f.dpa ? `**DPA:** ${f.dpa}` : "",
      ``,
      `---`,
      `*Common Paper Cloud Service Agreement Standard Terms · CC BY 4.0*`,
    ];
    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CSA-${f.providerName ?? "Provider"}-${f.customerName ?? "Customer"}-${f.effectiveDate ?? today}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEmpty = !f.providerName && !f.customerName;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-gray-800 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-center text-[#032147] mb-2">Cloud Service Agreement</h1>
        <p className="text-center text-gray-500 text-xs mb-8">
          CommonPaper Standard Terms Version 1.1 · CC BY 4.0
        </p>

        {isEmpty ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            <p className="text-sm">Fields will appear here as you answer questions in the chat.</p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-6 mb-8 space-y-4">
            <h2 className="font-semibold text-base border-b pb-2">Order Form</h2>

            {(f.providerName || f.providerAddress) && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Provider</p>
                <div className="ml-4 space-y-1">
                  <Row label="Name" value={f.providerName} />
                  <Row label="Address" value={f.providerAddress} />
                </div>
              </div>
            )}
            {(f.customerName || f.customerAddress) && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Customer</p>
                <div className="ml-4 space-y-1">
                  <Row label="Name" value={f.customerName} />
                  <Row label="Address" value={f.customerAddress} />
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Row label="Effective Date" value={f.effectiveDate} />
              <Row label="Order Date" value={f.orderDate} />
              <Row label="Subscription Period" value={f.subscriptionPeriod} />
              <Row label="Non-Renewal Notice" value={f.nonRenewalNoticeDate} />
              <Row label="Fees" value={f.fees} />
              <Row label="Payment Process" value={f.paymentProcess} />
              <Row label="Technical Support" value={f.technicalSupport} />
              <Row label="Use Limitations" value={f.useLimitations} />
              <Row label="Governing Law" value={f.governingLaw} />
              <Row label="Chosen Courts" value={f.chosenCourts} />
              <Row label="General Cap Amount" value={f.generalCapAmount} />
              <Row label="Provider Covered Claims" value={f.providerCoveredClaims} />
              <Row label="Customer Covered Claims" value={f.customerCoveredClaims} />
              <Row label="Additional Warranties" value={f.additionalWarranties} />
              <Row label="DPA" value={f.dpa} />
            </div>
          </div>
        )}

        {!isEmpty && (
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={handleDownload}
              className="bg-[#209dd7] hover:bg-[#1886ba] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Download .md
            </button>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-400 text-center">
          Common Paper Cloud Service Agreement Standard Terms Version 1.1 — CC BY 4.0
        </p>
      </div>
    </div>
  );
}
