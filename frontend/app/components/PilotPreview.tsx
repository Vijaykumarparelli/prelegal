"use client";

export interface PilotFields {
  providerName?: string;
  providerAddress?: string;
  customerName?: string;
  customerAddress?: string;
  effectiveDate?: string;
  pilotPeriod?: string;
  generalCapAmount?: string;
  governingLaw?: string;
  chosenCourts?: string;
  noticeAddress?: string;
}

interface Props {
  fields: PilotFields;
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

export default function PilotPreview({ fields: f }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const handleDownload = () => {
    const lines = [
      `# Pilot Agreement`,
      ``,
      `## Order Form`,
      ``,
      f.providerName ? `**Provider:** ${f.providerName}` : "",
      f.providerAddress ? `**Provider Address:** ${f.providerAddress}` : "",
      f.customerName ? `**Customer:** ${f.customerName}` : "",
      f.customerAddress ? `**Customer Address:** ${f.customerAddress}` : "",
      f.effectiveDate ? `**Effective Date:** ${f.effectiveDate}` : "",
      f.pilotPeriod ? `**Pilot Period:** ${f.pilotPeriod}` : "",
      f.generalCapAmount ? `**General Cap Amount:** ${f.generalCapAmount}` : "",
      f.governingLaw ? `**Governing Law:** ${f.governingLaw}` : "",
      f.chosenCourts ? `**Chosen Courts:** ${f.chosenCourts}` : "",
      f.noticeAddress ? `**Notice Address:** ${f.noticeAddress}` : "",
      ``,
      `---`,
      `*Common Paper Pilot Agreement Standard Terms Version 1.1 · CC BY 4.0*`,
    ];
    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pilot-Agreement-${f.providerName ?? "Provider"}-${f.customerName ?? "Customer"}-${f.effectiveDate ?? today}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEmpty = !f.providerName && !f.customerName;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-gray-800 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold text-center text-[#032147] mb-2">Pilot Agreement</h1>
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
              <Row label="Pilot Period" value={f.pilotPeriod} />
              <Row label="General Cap Amount" value={f.generalCapAmount} />
              <Row label="Governing Law" value={f.governingLaw} />
              <Row label="Chosen Courts" value={f.chosenCourts} />
              <Row label="Notice Address" value={f.noticeAddress} />
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
          Common Paper Pilot Agreement Standard Terms Version 1.1 — CC BY 4.0
        </p>
      </div>
    </div>
  );
}
