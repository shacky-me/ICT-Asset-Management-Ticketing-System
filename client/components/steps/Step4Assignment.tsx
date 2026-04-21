"use client";

import React from "react";
import {
  DEPARTMENTS,
  DISPOSAL_METHODS,
  Step4Data,
} from "@/types/assetRegistration";

interface Props {
  data: Step4Data;
  onChange: (field: keyof Step4Data, value: string) => void;
  errors?: Partial<Record<keyof Step4Data, string>>;
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
  hasError = false,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border ${hasError ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  hasError = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border ${hasError ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all appearance-none`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: "36px",
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
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

export default function Step4Assignment({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-8">
      {/* Location */}
      <div>
        <SectionHeading>Location</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel required>Department</FieldLabel>
            <SelectInput
              value={data.department}
              onChange={(v) => onChange("department", v)}
              options={DEPARTMENTS}
              placeholder="Select department..."
              hasError={Boolean(errors?.department)}
            />
            {errors?.department && (
              <p className="mt-1 text-xs text-red-600">{errors.department}</p>
            )}
          </div>
          <div>
            <FieldLabel>Floor / Level</FieldLabel>
            <TextInput
              placeholder="e.g. 4th Floor"
              value={data.floorLevel}
              onChange={(v) => onChange("floorLevel", v)}
              hasError={Boolean(errors?.floorLevel)}
            />
            {errors?.floorLevel && (
              <p className="mt-1 text-xs text-red-600">{errors.floorLevel}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <FieldLabel>Room / Office Number</FieldLabel>
          <TextInput
            placeholder="e.g. Room 412 — Director's Office"
            value={data.roomOfficeNumber}
            onChange={(v) => onChange("roomOfficeNumber", v)}
            hasError={Boolean(errors?.roomOfficeNumber)}
          />
          {errors?.roomOfficeNumber && (
            <p className="mt-1 text-xs text-red-600">
              {errors.roomOfficeNumber}
            </p>
          )}
        </div>
      </div>

      {/* Accessories & Notes */}
      <div>
        <SectionHeading>Handover &amp; Notes</SectionHeading>
        <div className="space-y-4">
          <div>
            <FieldLabel>Accessories / Items Included</FieldLabel>
            <textarea
              placeholder="e.g. Original charger, laptop bag, docking station, USB hub (list all items issued with the asset)"
              value={data.accessoriesIncluded}
              onChange={(e) => onChange("accessoriesIncluded", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2.5 rounded-lg border ${errors?.accessoriesIncluded ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${errors?.accessoriesIncluded ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all resize-none`}
            />
            {errors?.accessoriesIncluded && (
              <p className="mt-1 text-xs text-red-600">
                {errors.accessoriesIncluded}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Additional Notes / Remarks</FieldLabel>
            <textarea
              placeholder="Any pre-existing damage, special configurations, or additional information"
              value={data.additionalNotes}
              onChange={(e) => onChange("additionalNotes", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2.5 rounded-lg border ${errors?.additionalNotes ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${errors?.additionalNotes ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all resize-none`}
            />
            {errors?.additionalNotes && (
              <p className="mt-1 text-xs text-red-600">
                {errors.additionalNotes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Disposal / End-of-Life Planning */}
      <div>
        <SectionHeading>Disposal / End-of-Life Planning</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Scheduled Disposal / Replacement Date</FieldLabel>
            <input
              type="date"
              value={data.scheduledDisposalDate}
              onChange={(e) =>
                onChange("scheduledDisposalDate", e.target.value)
              }
              className={`w-full px-3 py-2.5 rounded-lg border ${errors?.scheduledDisposalDate ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors?.scheduledDisposalDate ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all`}
            />
            {errors?.scheduledDisposalDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.scheduledDisposalDate}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Planned Disposal Method</FieldLabel>
            <SelectInput
              value={data.plannedDisposalMethod}
              onChange={(v) => onChange("plannedDisposalMethod", v)}
              options={DISPOSAL_METHODS}
              hasError={Boolean(errors?.plannedDisposalMethod)}
            />
            {errors?.plannedDisposalMethod && (
              <p className="mt-1 text-xs text-red-600">
                {errors.plannedDisposalMethod}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
