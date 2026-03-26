"use client";

import React from "react";
import {
  FUNDING_SOURCES,
  WARRANTY_TYPES,
  Step3Data,
} from "@/types/assetRegistration";

interface Props {
  data: Step3Data;
  onChange: (field: keyof Step3Data, value: string) => void;
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-1.5">
      {children}
      {required && <span className="text-blue-600 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: "36px",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default function Step3Procurement({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Procurement Details */}
      <div>
        <SectionHeading>Procurement Details</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel required>Procurement Date</FieldLabel>
            <DateInput
              value={data.procurementDate}
              onChange={(v) => onChange("procurementDate", v)}
            />
          </div>
          <div>
            <FieldLabel>Supplier / Vendor</FieldLabel>
            <TextInput
              placeholder="e.g. Safaricom Business"
              value={data.supplierVendor}
              onChange={(v) => onChange("supplierVendor", v)}
            />
          </div>
          <div>
            <FieldLabel>Invoice Number</FieldLabel>
            <TextInput
              placeholder="Supplier invoice ref"
              value={data.invoiceNumber}
              onChange={(v) => onChange("invoiceNumber", v)}
            />
          </div>
          <div>
            <FieldLabel>LPO / Order Number</FieldLabel>
            <TextInput
              placeholder="Local Purchase Order no."
              value={data.lpoOrderNumber}
              onChange={(v) => onChange("lpoOrderNumber", v)}
            />
          </div>
          <div>
            <FieldLabel>Purchase Price (KES)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={data.purchasePrice}
              onChange={(e) => onChange("purchasePrice", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="mt-4">
          <FieldLabel>Grant / Project Reference (If Applicable)</FieldLabel>
          <TextInput
            placeholder="e.g. EU-JTF-2023-KE-004"
            value={data.grantProjectReference}
            onChange={(v) => onChange("grantProjectReference", v)}
          />
        </div>
      </div>

      {/* Warranty */}
      <div>
        <SectionHeading>Warranty</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel>Warranty Start Date</FieldLabel>
            <DateInput
              value={data.warrantyStartDate}
              onChange={(v) => onChange("warrantyStartDate", v)}
            />
          </div>
          <div>
            <FieldLabel>Warranty End Date</FieldLabel>
            <DateInput
              value={data.warrantyEndDate}
              onChange={(v) => onChange("warrantyEndDate", v)}
            />
          </div>
          <div>
            <FieldLabel>Warranty Type</FieldLabel>
            <SelectInput
              value={data.warrantyType}
              onChange={(v) => onChange("warrantyType", v)}
              options={WARRANTY_TYPES}
              placeholder="Select..."
            />
          </div>
          <div>
            <FieldLabel>Warranty Provider</FieldLabel>
            <TextInput
              placeholder="e.g. Dell Kenya, HP East Africa"
              value={data.warrantyProvider}
              onChange={(v) => onChange("warrantyProvider", v)}
            />
          </div>
          <div className="col-span-2">
            <FieldLabel>Warranty Contact / Reference</FieldLabel>
            <TextInput
              placeholder="Support line or contract number"
              value={data.warrantyContactReference}
              onChange={(v) => onChange("warrantyContactReference", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
