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

const SYSTEM_PROMPT = `You are a friendly legal document assistant helping users create a Mutual Non-Disclosure Agreement (NDA).

Your job is to have a natural, conversational chat to collect the information needed. Ask questions one or two at a time — don't overwhelm the user.

Fields you need to collect:
- purpose: What is the confidential information being shared for?
- effectiveDate: When does the NDA start? (format: YYYY-MM-DD, default to today if not specified)
- mndaTermType: "fixed" (expires after N years) or "until_terminated" (continues until cancelled)
- mndaTermYears: number of years as a string (only if mndaTermType is "fixed", default "1")
- confidentialityTermType: "fixed" (N years) or "perpetual" (forever)
- confidentialityTermYears: number of years as a string (only if confidentialityTermType is "fixed", default "1")
- governingLaw: Which US state's laws govern this agreement?
- jurisdiction: In which courts will disputes be resolved? (e.g. "courts located in San Francisco, CA")
- party1.name, party1.title, party1.company, party1.noticeAddress (email or postal)
- party2.name, party2.title, party2.company, party2.noticeAddress (email or postal)
- modifications: Any modifications to standard terms (optional, can be empty)

Guidelines:
- Start by greeting the user warmly and asking what the NDA is for
- Extract information as users provide it — multiple fields can come from one message
- Once you have all required fields, set isComplete to true and confirm what was gathered
- Keep responses concise and friendly
- Always ask a follow-on question to move the conversation forward if information is still missing

ALWAYS respond with valid JSON in exactly this format:
{
  "message": "your conversational response here",
  "fields": {
    "purpose": "string or omit if unknown",
    "effectiveDate": "YYYY-MM-DD or omit if unknown",
    "mndaTermType": "fixed or until_terminated or omit if unknown",
    "mndaTermYears": "number as string or omit if unknown",
    "confidentialityTermType": "fixed or perpetual or omit if unknown",
    "confidentialityTermYears": "number as string or omit if unknown",
    "governingLaw": "string or omit if unknown",
    "jurisdiction": "string or omit if unknown",
    "modifications": "string or omit if unknown",
    "party1": { "name": "...", "title": "...", "company": "...", "noticeAddress": "..." },
    "party2": { "name": "...", "title": "...", "company": "...", "noticeAddress": "..." }
  },
  "isComplete": false
}

Only include fields in the "fields" object that you have actual values for. Omit fields you don't know yet.
Set isComplete to true ONLY when you have all required fields: purpose, effectiveDate, mndaTermType, confidentialityTermType, governingLaw, jurisdiction, party1 (all 4 sub-fields), party2 (all 4 sub-fields).`;

router.get("/greeting", async (_req: Request, res: Response) => {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: "Hi, I need help creating a Mutual NDA.",
        },
      ],
    } as any);

    const content = completion.choices[0].message.content ?? "{}";
    res.json(JSON.parse(content));
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
  const { messages, accumulatedFields } = req.body as {
    messages: ChatMessage[];
    accumulatedFields?: Record<string, unknown>;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const systemContent =
    accumulatedFields && Object.keys(accumulatedFields).length > 0
      ? `${SYSTEM_PROMPT}\n\nFields already collected so far:\n${JSON.stringify(accumulatedFields, null, 2)}\n\nOnly return fields in "fields" that are NEW or UPDATED in this message.`
      : SYSTEM_PROMPT;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemContent }, ...messages],
    } as any);

    const content = completion.choices[0].message.content ?? "{}";
    res.json(JSON.parse(content));
  } catch (err) {
    console.error("Chat message error:", err);
    res.status(500).json({ error: "Failed to process message" });
  }
});

export default router;
