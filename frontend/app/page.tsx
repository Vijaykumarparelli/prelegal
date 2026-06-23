"use client";

import { useCallback, useEffect, useState } from "react";
import ChatPane, { ChatMessage } from "./components/ChatPane";
import NdaPreview from "./components/NdaPreview";
import CsaPreview, { CsaFields } from "./components/CsaPreview";
import PilotPreview, { PilotFields } from "./components/PilotPreview";
import GenericPreview from "./components/GenericPreview";
import { NdaFormData } from "./components/NdaForm";

interface AiResponse {
  message: string;
  documentType?: string | null;
  fields: Record<string, unknown>;
  isComplete: boolean;
}

const DOC_NAMES: Record<string, string> = {
  mutual_nda: "Mutual Non-Disclosure Agreement",
  cloud_service_agreement: "Cloud Service Agreement",
  design_partner_agreement: "Design Partner Agreement",
  service_level_agreement: "Service Level Agreement",
  professional_services_agreement: "Professional Services Agreement",
  data_processing_agreement: "Data Processing Agreement",
  software_license_agreement: "Software License Agreement",
  partnership_agreement: "Partnership Agreement",
  pilot_agreement: "Pilot Agreement",
  business_associate_agreement: "Business Associate Agreement",
  ai_addendum: "AI Addendum",
};

function mergeFields(
  prev: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...prev };
  for (const [key, value] of Object.entries(next)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof merged[key] === "object" &&
      merged[key] !== null
    ) {
      merged[key] = { ...(merged[key] as object), ...(value as object) };
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [extractedFields, setExtractedFields] = useState<Record<string, unknown>>({});
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat/greeting")
      .then((r) => r.json())
      .then((data: AiResponse) => {
        setMessages([{ role: "assistant", content: data.message }]);
        if (data.documentType) setDocumentType(data.documentType);
        if (data.fields && Object.keys(data.fields).length > 0) {
          setExtractedFields((prev) => mergeFields(prev, data.fields));
        }
        if (data.isComplete) setIsComplete(true);
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm here to help you create a legal document. What type of agreement do you need? For example: an NDA, a Cloud Service Agreement, a Pilot Agreement, or any of our other supported document types.",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            accumulatedFields: extractedFields,
            documentType,
          }),
        });

        const data: AiResponse = await res.json();

        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

        if (data.documentType && !documentType) {
          setDocumentType(data.documentType);
        }

        if (data.fields && Object.keys(data.fields).length > 0) {
          setExtractedFields((prev) => mergeFields(prev, data.fields));
        }

        if (data.isComplete) setIsComplete(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, extractedFields, documentType]
  );

  const docName = documentType ? (DOC_NAMES[documentType] ?? documentType) : null;

  function renderPreview() {
    if (!documentType) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <div className="text-gray-400 text-sm space-y-2">
            <p className="text-2xl mb-4">📄</p>
            <p className="font-medium text-gray-600">Your document will appear here</p>
            <p>Tell the AI which document you need and it will guide you through creating it.</p>
          </div>
        </div>
      );
    }

    if (documentType === "mutual_nda") {
      return <NdaPreview data={extractedFields as Partial<NdaFormData>} showActions={false} />;
    }

    if (documentType === "cloud_service_agreement") {
      return <CsaPreview fields={extractedFields as CsaFields} />;
    }

    if (documentType === "pilot_agreement") {
      return <PilotPreview fields={extractedFields as PilotFields} />;
    }

    return (
      <GenericPreview
        documentType={documentType}
        documentName={docName ?? documentType}
        fields={extractedFields}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">
            {docName ?? "Legal Document Creator"}
          </h1>
          <p className="text-sm text-[#888888] mt-0.5">
            {docName
              ? `Chat with AI to fill in your ${docName}`
              : "Tell the AI which document you need — it supports 11 CommonPaper standard agreements"}
          </p>
        </div>
        {isComplete && (
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Print / Save as PDF
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 p-4 max-w-[1600px] mx-auto w-full">
        <div className="h-[calc(100vh-120px)] sticky top-4">
          <ChatPane messages={messages} isLoading={isLoading} onSend={handleSend} />
        </div>

        <div className="overflow-y-auto pb-4">
          {isComplete && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2.5 text-sm font-medium">
              All fields collected — your document is ready to download.
            </div>
          )}
          {renderPreview()}
        </div>
      </div>
    </main>
  );
}
