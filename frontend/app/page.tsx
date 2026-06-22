"use client";

import { useCallback, useEffect, useState } from "react";
import ChatPane, { ChatMessage } from "./components/ChatPane";
import NdaPreview from "./components/NdaPreview";
import { NdaFormData } from "./components/NdaForm";

interface AiResponse {
  message: string;
  fields: Partial<NdaFormData>;
  isComplete: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [extractedFields, setExtractedFields] = useState<Partial<NdaFormData>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mergeFields = (prev: Partial<NdaFormData>, next: Partial<NdaFormData>): Partial<NdaFormData> => {
    const merged = { ...prev, ...next };
    if (prev.party1 || next.party1) {
      merged.party1 = { ...prev.party1, ...next.party1 } as NdaFormData["party1"];
    }
    if (prev.party2 || next.party2) {
      merged.party2 = { ...prev.party2, ...next.party2 } as NdaFormData["party2"];
    }
    return merged;
  };

  useEffect(() => {
    fetch("/api/chat/greeting")
      .then((r) => r.json())
      .then((data: AiResponse) => {
        setMessages([{ role: "assistant", content: data.message }]);
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
              "Hello! I'm here to help you create a Mutual NDA. What is the purpose of this agreement — what are you sharing confidential information for?",
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
          }),
        });

        const data: AiResponse = await res.json();

        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);

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
    [messages, extractedFields]
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">Mutual NDA Creator</h1>
          <p className="text-sm text-[#888888] mt-0.5">
            Chat with AI to generate your Mutual Non-Disclosure Agreement
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
            <button
              onClick={() => {
                const fields = extractedFields as NdaFormData;
                const today = new Date().toISOString().split("T")[0];
                const lines = [
                  `# Mutual Non-Disclosure Agreement`,
                  ``,
                  `**Purpose:** ${fields.purpose ?? ""}`,
                  `**Effective Date:** ${fields.effectiveDate ?? today}`,
                  `**Governing Law:** ${fields.governingLaw ?? ""}`,
                  `**Jurisdiction:** ${fields.jurisdiction ?? ""}`,
                ];
                const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Mutual-NDA-${fields.party1?.company ?? "Party1"}-${fields.party2?.company ?? "Party2"}-${fields.effectiveDate ?? today}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-[#209dd7] hover:bg-[#1886ba] text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Download .md
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
              All fields collected — your NDA is ready to download.
            </div>
          )}
          <NdaPreview data={extractedFields} showActions={false} />
        </div>
      </div>
    </main>
  );
}
