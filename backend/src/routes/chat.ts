import { Router, Request, Response } from "express";
import OpenAI from "openai";

const router = Router();

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Prelegal",
      },
    });
  }
  return _openai;
}

const SUPPORTED_DOCS = [
  { id: "mutual_nda", name: "Mutual Non-Disclosure Agreement", description: "For sharing confidential information between two parties" },
  { id: "cloud_service_agreement", name: "Cloud Service Agreement", description: "For SaaS/cloud software subscriptions" },
  { id: "design_partner_agreement", name: "Design Partner Agreement", description: "For early-access design partner programs" },
  { id: "service_level_agreement", name: "Service Level Agreement", description: "For uptime and response-time guarantees" },
  { id: "professional_services_agreement", name: "Professional Services Agreement", description: "For professional services engagements and SOW delivery" },
  { id: "data_processing_agreement", name: "Data Processing Agreement", description: "GDPR-compliant DPA for processing personal data" },
  { id: "software_license_agreement", name: "Software License Agreement", description: "For on-premise software licenses" },
  { id: "partnership_agreement", name: "Partnership Agreement", description: "For business partnership arrangements" },
  { id: "pilot_agreement", name: "Pilot Agreement", description: "For short-term product evaluation/trial periods" },
  { id: "business_associate_agreement", name: "Business Associate Agreement", description: "HIPAA-compliant BAA for handling Protected Health Information" },
  { id: "ai_addendum", name: "AI Addendum", description: "Addendum for AI/ML service usage terms" },
];

const DISCOVERY_PROMPT = `You are a legal document assistant. Your first job is to understand which legal document the user needs.

Supported document types:
${SUPPORTED_DOCS.map((d) => `- ${d.name} (id: ${d.id}): ${d.description}`).join("\n")}

Guidelines:
- Greet the user warmly and ask what legal document they need
- If they describe a document type you support, set documentType to the matching id
- If they ask for something not in the list (e.g. employment contract, terms of service), explain you can't generate that document, and suggest the closest supported alternative
- Once you identify the document type, confirm it with the user before proceeding
- Keep responses concise and friendly

ALWAYS respond with valid JSON:
{
  "message": "your response here",
  "documentType": null,
  "fields": {},
  "isComplete": false
}

Set documentType to the document id once you've identified and confirmed what the user needs. Leave it null until then.`;

const DOCUMENT_PROMPTS: Record<string, string> = {
  mutual_nda: `You are a legal document assistant helping users create a Mutual Non-Disclosure Agreement (NDA).

Fields to collect:
- purpose: What is the confidential information being shared for?
- effectiveDate: When does the NDA start? (YYYY-MM-DD, default today)
- mndaTermType: "fixed" (N years) or "until_terminated"
- mndaTermYears: years as string (only if mndaTermType is "fixed", default "1")
- confidentialityTermType: "fixed" or "perpetual"
- confidentialityTermYears: years as string (only if fixed, default "1")
- governingLaw: Which US state governs?
- jurisdiction: Which courts? (e.g. "courts located in San Francisco, CA")
- party1: { name, title, company, noticeAddress }
- party2: { name, title, company, noticeAddress }
- modifications: Any standard term modifications (optional)

Ask naturally, 1-2 questions at a time. Set isComplete to true when you have all required fields (purpose, effectiveDate, mndaTermType, confidentialityTermType, governingLaw, jurisdiction, party1 all 4 fields, party2 all 4 fields).

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "mutual_nda",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  cloud_service_agreement: `You are a legal document assistant helping users create a Cloud Service Agreement (CSA).

Fields to collect:
- providerName, providerAddress: The company providing the cloud service
- customerName, customerAddress: The customer company
- effectiveDate: When does the agreement start? (YYYY-MM-DD)
- orderDate: When is the first order placed? (YYYY-MM-DD, can be same as effective date)
- subscriptionPeriod: How long is each subscription period? (e.g. "1 year", "12 months")
- nonRenewalNoticeDate: Days before renewal to give non-renewal notice (e.g. "30 days")
- fees: Fee structure description (e.g. "$500/month", "as per Order Form")
- paymentProcess: How are payments made? (e.g. "monthly invoice", "annual prepay")
- technicalSupport: What technical support is included? (e.g. "email support during business hours")
- useLimitations: Any usage restrictions? (e.g. "up to 10 users", "internal use only")
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts? (e.g. "courts located in San Francisco, CA")
- generalCapAmount: Liability cap (e.g. "fees paid in prior 12 months", "$10,000")
- providerCoveredClaims: What does Provider indemnify against? (e.g. "IP infringement claims")
- customerCoveredClaims: What does Customer indemnify against? (e.g. "Customer Content claims")
- additionalWarranties: Any additional warranties? (optional)

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "cloud_service_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  pilot_agreement: `You are a legal document assistant helping users create a Pilot Agreement for a product evaluation period.

Fields to collect:
- providerName, providerAddress: The company providing the product
- customerName, customerAddress: The company evaluating the product
- effectiveDate: When does the pilot start? (YYYY-MM-DD)
- pilotPeriod: How long is the pilot? (e.g. "30 days", "3 months ending December 31, 2026")
- generalCapAmount: Liability cap (e.g. "$5,000", "fees paid under this agreement")
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts? (e.g. "courts located in San Francisco, CA")
- noticeAddress: Notice address if different from party addresses (optional)

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "pilot_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  design_partner_agreement: `You are a legal document assistant helping users create a Design Partner Agreement.

Fields to collect:
- providerName, providerAddress: The company providing the product
- partnerName, partnerAddress: The design partner company
- effectiveDate: When does the agreement start? (YYYY-MM-DD)
- term: How long does the agreement last? (e.g. "6 months", "until December 31, 2026")
- program: Brief description of the design partner program
- fees: Any fees the partner pays (optional, enter "none" if free)
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "design_partner_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  service_level_agreement: `You are a legal document assistant helping users create a Service Level Agreement (SLA).

Fields to collect:
- providerName: The service provider
- customerName: The customer
- effectiveDate: When does the SLA start? (YYYY-MM-DD)
- targetUptime: Uptime guarantee (e.g. "99.9%")
- targetResponseTime: Response time target (e.g. "< 200ms p95")
- supportChannel: How to report issues (e.g. "support@company.com", "ticketing portal")
- scheduledDowntime: When is maintenance allowed? (e.g. "Sundays 2–4 AM UTC")
- uptimeCredit: Service credit for uptime breaches (e.g. "10% of monthly fee per 1% below target")
- responseTimeCredit: Credit for response time breaches (e.g. "5% of monthly fee")
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "service_level_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  professional_services_agreement: `You are a legal document assistant helping users create a Professional Services Agreement (PSA).

Fields to collect:
- providerName, providerAddress: The professional services provider
- customerName, customerAddress: The customer company
- effectiveDate: When does the agreement start? (YYYY-MM-DD)
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?
- additionalWarranties: Any additional warranties beyond standard? (optional)
- dpa: Is a Data Processing Agreement needed? (yes/no)

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "professional_services_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  data_processing_agreement: `You are a legal document assistant helping users create a Data Processing Agreement (DPA).

Fields to collect:
- providerName, providerAddress: The data processor (provider)
- customerName, customerAddress: The data controller (customer)
- effectiveDate: When does the DPA start? (YYYY-MM-DD)
- categoriesOfPersonalData: What types of personal data will be processed? (e.g. "names, email addresses, IP addresses")
- categoriesOfDataSubjects: Who are the data subjects? (e.g. "employees", "end users", "customers")
- purposeOfProcessing: Why is the data being processed? (e.g. "to provide cloud software services")
- durationOfProcessing: How long will data be processed?
- governingLaw: Which jurisdiction's laws govern?
- chosenCourts: Which courts?

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "data_processing_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  software_license_agreement: `You are a legal document assistant helping users create a Software License Agreement.

Fields to collect:
- providerName, providerAddress: The software licensor
- customerName, customerAddress: The licensee
- effectiveDate: When does the license start? (YYYY-MM-DD)
- subscriptionPeriod: License term (e.g. "1 year", "perpetual")
- fees: License fee (e.g. "$10,000 per year")
- paymentProcess: Payment method (e.g. "annual invoice")
- permittedUses: What is the software licensed for? (e.g. "internal business purposes")
- licenseLimits: Any restrictions on use? (e.g. "up to 50 seats")
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?
- generalCapAmount: Liability cap (e.g. "fees paid in prior 12 months")

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "software_license_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  partnership_agreement: `You are a legal document assistant helping users create a Partnership Agreement.

Fields to collect:
- party1Name, party1Address: First partner company
- party2Name, party2Address: Second partner company
- effectiveDate: When does the partnership start? (YYYY-MM-DD)
- endDate: When does it end? (YYYY-MM-DD, or "ongoing" if no fixed end)
- obligations: What are the key obligations of each party?
- paymentSchedule: Any payment arrangements? (optional)
- territory: Geographic territory covered (e.g. "worldwide", "North America")
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "partnership_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  business_associate_agreement: `You are a legal document assistant helping users create a Business Associate Agreement (BAA) for HIPAA compliance.

Fields to collect:
- providerName, providerAddress: The Business Associate (handles PHI on behalf of covered entity)
- coveredEntityName, coveredEntityAddress: The Covered Entity (healthcare provider, health plan, etc.)
- effectiveDate: When does the BAA start? (YYYY-MM-DD)
- services: What services does the Business Associate provide that involve PHI?
- breachNotificationPeriod: How many days after discovery must a breach be reported? (default: "60 days")
- permittedUses: Any permitted uses of PHI beyond the primary service? (optional)
- limitations: Any limitations on use of PHI? (optional)

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "business_associate_agreement",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,

  ai_addendum: `You are a legal document assistant helping users create an AI Addendum to a base agreement.

Fields to collect:
- providerName, providerAddress: The AI/ML service provider
- customerName, customerAddress: The customer using AI services
- effectiveDate: When does the addendum start? (YYYY-MM-DD)
- trainingRestrictions: Any restrictions on using Customer data for AI training? (e.g. "Provider may not use Customer data to train models")
- improvementRestrictions: Any restrictions on using data for service improvement? (optional)
- governingLaw: Which US state's laws govern?
- chosenCourts: Which courts?

Ask naturally, 1-2 questions at a time. Set isComplete true when you have all required fields.

ALWAYS respond with valid JSON:
{
  "message": "...",
  "documentType": "ai_addendum",
  "fields": { ...only new/updated fields... },
  "isComplete": false
}`,
};

function safeParseJSON(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, (c) => {
      if (c === "\n") return "\\n";
      if (c === "\r") return "\\r";
      if (c === "\t") return "\\t";
      return "";
    });
    return JSON.parse(cleaned);
  }
}

function getSystemPrompt(documentType: string | null | undefined, accumulatedFields: Record<string, unknown>): string {
  if (!documentType || !DOCUMENT_PROMPTS[documentType]) {
    return DISCOVERY_PROMPT;
  }
  const base = DOCUMENT_PROMPTS[documentType];
  if (Object.keys(accumulatedFields).length > 0) {
    return `${base}\n\nFields already collected:\n${JSON.stringify(accumulatedFields, null, 2)}\n\nOnly return NEW or UPDATED fields in "fields".`;
  }
  return base;
}

router.get("/greeting", async (_req: Request, res: Response) => {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DISCOVERY_PROMPT },
        { role: "user", content: "Hi, I need help with a legal document." },
      ],
    } as any);

    const content = completion.choices[0].message.content ?? "{}";
    res.json(safeParseJSON(content));
  } catch (err) {
    console.error("Chat greeting error:", err);
    res.status(500).json({ error: "Failed to get AI greeting" });
  }
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

router.post("/message", async (req: Request, res: Response) => {
  const { messages, accumulatedFields, documentType } = req.body as {
    messages: ChatMessage[];
    accumulatedFields?: Record<string, unknown>;
    documentType?: string | null;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const systemContent = getSystemPrompt(documentType, accumulatedFields ?? {});

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemContent }, ...messages],
    } as any);

    const content = completion.choices[0].message.content ?? "{}";
    res.json(safeParseJSON(content));
  } catch (err) {
    console.error("Chat message error:", err);
    res.status(500).json({ error: "Failed to process message" });
  }
});

export default router;
