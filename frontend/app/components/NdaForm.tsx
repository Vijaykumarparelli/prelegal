"use client";

import { useState } from "react";

export interface PartyInfo {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export interface NdaFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermYears: string;
  mndaTermType: "fixed" | "until_terminated";
  confidentialityTermYears: string;
  confidentialityTermType: "fixed" | "perpetual";
  governingLaw: string;
  jurisdiction: string;
  party1: PartyInfo;
  party2: PartyInfo;
  modifications: string;
}

const today = new Date().toISOString().split("T")[0];

const defaultForm: NdaFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: today,
  mndaTermYears: "1",
  mndaTermType: "fixed",
  confidentialityTermYears: "1",
  confidentialityTermType: "fixed",
  governingLaw: "",
  jurisdiction: "",
  party1: { name: "", title: "", company: "", noticeAddress: "" },
  party2: { name: "", title: "", company: "", noticeAddress: "" },
  modifications: "",
};

interface Props {
  onSubmit: (data: NdaFormData) => void;
}

function PartyFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PartyInfo;
  onChange: (v: PartyInfo) => void;
}) {
  const field = (key: keyof PartyInfo, placeholder: string, multiline?: boolean) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
      {multiline ? (
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder={placeholder}
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        />
      ) : (
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-800">{label}</h3>
      {field("name", "Full name")}
      {field("title", "Job title")}
      {field("company", "Company name")}
      {field("noticeAddress", "Email or postal address", true)}
    </div>
  );
}

export default function NdaForm({ onSubmit }: Props) {
  const [form, setForm] = useState<NdaFormData>(defaultForm);

  const set = (key: keyof NdaFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setParty = (party: "party1" | "party2", value: PartyInfo) =>
    setForm((prev) => ({ ...prev, [party]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Agreement Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <textarea
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How Confidential Information may be used…"
            value={form.purpose}
            onChange={(e) => set("purpose", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
          <input
            required
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MNDA Term</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mndaTermType"
                  checked={form.mndaTermType === "fixed"}
                  onChange={() => set("mndaTermType", "fixed")}
                />
                Expires after
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={form.mndaTermYears}
                  onChange={(e) => set("mndaTermYears", e.target.value)}
                  disabled={form.mndaTermType !== "fixed"}
                />
                year(s) from Effective Date
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mndaTermType"
                  checked={form.mndaTermType === "until_terminated"}
                  onChange={() => set("mndaTermType", "until_terminated")}
                />
                Continues until terminated
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term of Confidentiality</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  checked={form.confidentialityTermType === "fixed"}
                  onChange={() => set("confidentialityTermType", "fixed")}
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={form.confidentialityTermYears}
                  onChange={(e) => set("confidentialityTermYears", e.target.value)}
                  disabled={form.confidentialityTermType !== "fixed"}
                />
                year(s) from Effective Date
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  checked={form.confidentialityTermType === "perpetual"}
                  onChange={() => set("confidentialityTermType", "perpetual")}
                />
                In perpetuity
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Governing Law (State)</label>
            <input
              required
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Delaware"
              value={form.governingLaw}
              onChange={(e) => set("governingLaw", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <input
              required
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. courts located in New Castle, DE"
              value={form.jurisdiction}
              onChange={(e) => set("jurisdiction", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MNDA Modifications (optional)</label>
          <textarea
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List any modifications to the standard MNDA terms…"
            value={form.modifications}
            onChange={(e) => set("modifications", e.target.value)}
          />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Parties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PartyFields label="Party 1" value={form.party1} onChange={(v) => setParty("party1", v)} />
          <PartyFields label="Party 2" value={form.party2} onChange={(v) => setParty("party2", v)} />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Generate NDA →
        </button>
      </div>
    </form>
  );
}
