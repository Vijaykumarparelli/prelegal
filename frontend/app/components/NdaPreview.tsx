"use client";

import { useRef } from "react";
import { NdaFormData } from "./NdaForm";

const today = new Date().toISOString().split("T")[0];

const DEFAULTS: NdaFormData = {
  purpose: "[ purpose not yet specified ]",
  effectiveDate: today,
  mndaTermYears: "1",
  mndaTermType: "fixed",
  confidentialityTermYears: "1",
  confidentialityTermType: "fixed",
  governingLaw: "[ governing law not yet specified ]",
  jurisdiction: "[ jurisdiction not yet specified ]",
  party1: { name: "[ Party 1 name ]", title: "[ title ]", company: "[ company ]", noticeAddress: "[ address ]" },
  party2: { name: "[ Party 2 name ]", title: "[ title ]", company: "[ company ]", noticeAddress: "[ address ]" },
  modifications: "",
};

interface Props {
  data: Partial<NdaFormData>;
  onBack?: () => void;
  showActions?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildMarkdown(d: NdaFormData): string {
  const mndaTerm =
    d.mndaTermType === "fixed"
      ? `Expires ${d.mndaTermYears} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityTerm =
    d.confidentialityTermType === "fixed"
      ? `${d.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  return `# Mutual Non-Disclosure Agreement

## USING THIS MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page ("**Cover Page**") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 ("**Standard Terms**") identical to those posted at commonpaper.com/standards/mutual-nda/1.0. Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.

---

### Purpose

${d.purpose}

### Effective Date

${formatDate(d.effectiveDate)}

### MNDA Term

${mndaTerm}

### Term of Confidentiality

${confidentialityTerm}

### Governing Law & Jurisdiction

**Governing Law:** ${d.governingLaw}

**Jurisdiction:** ${d.jurisdiction}

### MNDA Modifications

${d.modifications || "None."}

---

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

|  | PARTY 1 | PARTY 2 |
|:---|:---|:---|
| **Print Name** | ${d.party1.name} | ${d.party2.name} |
| **Title** | ${d.party1.title} | ${d.party2.title} |
| **Company** | ${d.party1.company} | ${d.party2.company} |
| **Notice Address** | ${d.party1.noticeAddress} | ${d.party2.noticeAddress} |
| **Date** | ${formatDate(d.effectiveDate)} | ${formatDate(d.effectiveDate)} |
| **Signature** | ________________________ | ________________________ |

---

## Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the **Purpose** which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("**Cover Page**"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the **Purpose**; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the **Purpose**, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the **Effective Date** (${formatDate(d.effectiveDate)}) and expires at the end of the **MNDA Term** (${mndaTerm}). Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the **Term of Confidentiality** (${confidentialityTerm}), despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of **${d.governingLaw}**, without regard to the conflict of laws provisions of such governing law. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in **${d.jurisdiction}**. Each party irrevocably submits to the exclusive jurisdiction of such courts in any such suit, action, or proceeding.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.

---

*Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
`;
}

export default function NdaPreview({ data, onBack, showActions = true }: Props) {
  const docRef = useRef<HTMLDivElement>(null);

  const d: NdaFormData = {
    ...DEFAULTS,
    ...data,
    party1: { ...DEFAULTS.party1, ...data.party1 },
    party2: { ...DEFAULTS.party2, ...data.party2 },
  };

  const mndaTerm =
    d.mndaTermType === "fixed"
      ? `Expires ${d.mndaTermYears} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityTerm =
    d.confidentialityTermType === "fixed"
      ? `${d.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  const handleDownload = () => {
    const md = buildMarkdown(d);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mutual-NDA-${d.party1.company || "Party1"}-${d.party2.company || "Party2"}-${d.effectiveDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto">
      {showActions && (
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Back to form
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
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
        </div>
      )}

      <div
        ref={docRef}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-gray-800 text-sm leading-relaxed print:shadow-none print:border-none print:p-0"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Mutual Non-Disclosure Agreement</h1>
        <p className="text-center text-gray-500 text-xs mb-8">
          CommonPaper Standard Terms Version 1.0 · CC BY 4.0
        </p>

        <div className="border border-gray-300 rounded-lg p-6 mb-8 space-y-5">
          <h2 className="font-semibold text-base border-b pb-2">Cover Page</h2>

          <Row label="Purpose" value={d.purpose} />
          <Row label="Effective Date" value={formatDate(d.effectiveDate)} />
          <Row label="MNDA Term" value={mndaTerm} />
          <Row label="Term of Confidentiality" value={confidentialityTerm} />
          <Row label="Governing Law" value={d.governingLaw} />
          <Row label="Jurisdiction" value={d.jurisdiction} />
          {d.modifications && <Row label="MNDA Modifications" value={d.modifications} />}

          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-3">
              By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600 w-36"></th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-700 border-b border-gray-200">Party 1</th>
                  <th className="text-left py-2 font-medium text-gray-700 border-b border-gray-200">Party 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <SignatureRow label="Print Name" v1={d.party1.name} v2={d.party2.name} />
                <SignatureRow label="Title" v1={d.party1.title} v2={d.party2.title} />
                <SignatureRow label="Company" v1={d.party1.company} v2={d.party2.company} />
                <SignatureRow label="Notice Address" v1={d.party1.noticeAddress} v2={d.party2.noticeAddress} />
                <SignatureRow label="Date" v1={formatDate(d.effectiveDate)} v2={formatDate(d.effectiveDate)} />
                <tr>
                  <td className="py-3 pr-4 text-gray-600 font-medium">Signature</td>
                  <td className="py-3 pr-4 border-b border-gray-400 w-48">&nbsp;</td>
                  <td className="py-3 border-b border-gray-400 w-48">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="font-semibold text-base border-b pb-2 mb-4">Standard Terms</h2>

        <ol className="list-decimal list-outside space-y-4 pl-5">
          <li>
            <strong>Introduction.</strong> This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the <Pill>{d.purpose}</Pill> which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.
          </li>
          <li>
            <strong>Use and Protection of Confidential Information.</strong> The Receiving Party shall: (a) use Confidential Information solely for the <Pill>{d.purpose}</Pill>; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.
          </li>
          <li>
            <strong>Exceptions.</strong> The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.
          </li>
          <li>
            <strong>Disclosures Required by Law.</strong> The Receiving Party may disclose Confidential Information to the extent required by law, provided it gives the Disclosing Party reasonable advance notice of the required disclosure.
          </li>
          <li>
            <strong>Term and Termination.</strong> This MNDA commences on the Effective Date (<Pill>{formatDate(d.effectiveDate)}</Pill>) and the MNDA Term is: <Pill>{mndaTerm}</Pill>. The Receiving Party's confidentiality obligations survive for the Term of Confidentiality: <Pill>{confidentialityTerm}</Pill>
          </li>
          <li>
            <strong>Return or Destruction of Confidential Information.</strong> Upon expiration or termination, the Receiving Party will cease using, and promptly destroy or return, all Confidential Information in its possession or control.
          </li>
          <li>
            <strong>Proprietary Rights.</strong> The Disclosing Party retains all intellectual property rights in its Confidential Information; disclosure grants no license.
          </li>
          <li>
            <strong>Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </li>
          <li>
            <strong>Governing Law and Jurisdiction.</strong> This MNDA is governed by the laws of the State of <Pill>{d.governingLaw}</Pill>. Any legal proceedings must be instituted in <Pill>{d.jurisdiction}</Pill>.
          </li>
          <li>
            <strong>Equitable Relief.</strong> A breach of this MNDA may cause irreparable harm; the Disclosing Party is entitled to seek equitable relief, including an injunction.
          </li>
          <li>
            <strong>General.</strong> Neither party may assign this MNDA without prior written consent except in connection with a merger or acquisition. This MNDA constitutes the entire agreement of the parties with respect to its subject matter.
          </li>
        </ol>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="col-span-2 text-gray-900">{value}</span>
    </div>
  );
}

function SignatureRow({ label, v1, v2 }: { label: string; v1: string; v2: string }) {
  return (
    <tr>
      <td className="py-2 pr-4 text-gray-600 font-medium align-top">{label}</td>
      <td className="py-2 pr-4 text-gray-900 align-top">{v1}</td>
      <td className="py-2 text-gray-900 align-top">{v2}</td>
    </tr>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline bg-blue-50 text-blue-800 rounded px-1 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}
