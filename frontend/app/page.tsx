"use client";

import { useState } from "react";
import NdaForm, { NdaFormData } from "./components/NdaForm";
import NdaPreview from "./components/NdaPreview";

export default function Home() {
  const [formData, setFormData] = useState<NdaFormData | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Mutual NDA Creator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate a Mutual Non-Disclosure Agreement from the CommonPaper standard template
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {formData ? (
          <NdaPreview data={formData} onBack={() => setFormData(null)} />
        ) : (
          <NdaForm onSubmit={setFormData} />
        )}
      </div>
    </main>
  );
}
