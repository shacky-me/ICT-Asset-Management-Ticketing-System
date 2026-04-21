"use client";

import React from "react";
import {
  ASSET_CATEGORIES,
  PHYSICAL_CONDITIONS,
  Step1Data,
} from "@/types/assetRegistration";

interface Props {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
  errors?: Partial<Record<keyof Step1Data, string>>;
}

// Reusable field components

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
      {required && <span className="text-red-700 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  className = "",
  readOnly = false,
  hasError = false,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  readOnly?: boolean;
  hasError?: boolean;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border ${hasError ? "border-red-400" : "border-slate-200"} bg-white
        text-sm text-slate-800 placeholder-slate-400
        focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"}
        transition-all ${readOnly ? "cursor-default select-all" : ""} ${className}`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  hasError = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2.5 rounded-lg border ${hasError ? "border-red-400" : "border-slate-200"} bg-white
        text-sm text-slate-800
        focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"}
        transition-all disabled:bg-slate-50 disabled:text-slate-400
        disabled:cursor-not-allowed appearance-none`}
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
      <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// Component

export default function Step1Identification({ data, onChange, errors }: Props) {
  const subCategories = data.category
    ? (ASSET_CATEGORIES[data.category] ?? [])
    : [];

  return (
    <div className="space-y-8 py-5">
      {/* ASSET IDENTITY */}
      <div>
        <SectionHeading>Asset Identity</SectionHeading>

        <div className="grid grid-cols-2 gap-4">
          {/* Asset Tag Number */}
          <div>
            <FieldLabel required>Asset Tag Number</FieldLabel>
            <TextInput
              placeholder="e.g. KE-ICT-L-042"
              value={data.assetTagNumber}
              onChange={(v) => onChange("assetTagNumber", v)}
              hasError={Boolean(errors?.assetTagNumber)}
            />
            {errors?.assetTagNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.assetTagNumber}
              </p>
            )}
          </div>

          {/* System Asset ID — read-only, auto-generated */}
          <div>
            <FieldLabel>System Asset ID</FieldLabel>
            <TextInput
              value={data.systemAssetId}
              onChange={() => {}}
              readOnly
              className="bg-blue-50 border-blue-200 text-blue-700 font-mono font-semibold"
              hasError={Boolean(errors?.systemAssetId)}
            />
            {errors?.systemAssetId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.systemAssetId}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <FieldLabel required>Category</FieldLabel>
            <SelectInput
              value={data.category}
              onChange={(v) => {
                onChange("category", v);
                onChange("subCategory", "");
              }}
              options={Object.keys(ASSET_CATEGORIES)}
              placeholder="Select Category ......"
              hasError={Boolean(errors?.category)}
            />
            {errors?.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Sub-Category */}
          <div>
            <FieldLabel>Sub-Category</FieldLabel>
            <SelectInput
              value={data.subCategory}
              onChange={(v) => onChange("subCategory", v)}
              options={subCategories}
              placeholder={
                data.category
                  ? "Select sub-category..."
                  : "Select Category First"
              }
              disabled={!data.category}
              hasError={Boolean(errors?.subCategory)}
            />
            {errors?.subCategory && (
              <p className="mt-1 text-xs text-red-600">{errors.subCategory}</p>
            )}
          </div>
        </div>

        {/* Asset Description */}
        <div className="mt-4">
          <FieldLabel>Asset Description</FieldLabel>
          <textarea
            placeholder="Brief description of the asset and its primary use"
            value={data.assetDescription}
            onChange={(e) => onChange("assetDescription", e.target.value)}
            rows={3}
            className={`w-full px-3 py-2.5 rounded-lg border ${errors?.assetDescription ? "border-red-400" : "border-slate-200"} bg-white
              text-sm text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 ${errors?.assetDescription ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"}
              transition-all resize-none`}
          />
          {errors?.assetDescription && (
            <p className="mt-1 text-xs text-red-600">
              {errors.assetDescription}
            </p>
          )}
        </div>
      </div>

      {/* HARDWARE IDENTITY */}
      <div>
        <SectionHeading>Hardware Identity</SectionHeading>

        <div className="grid grid-cols-3 gap-4">
          {/* Make / Brand */}
          <div>
            <FieldLabel required>Make / Brand</FieldLabel>
            <TextInput
              placeholder="e.g. Dell, HP, Cisco"
              value={data.make}
              onChange={(v) => onChange("make", v)}
              hasError={Boolean(errors?.make)}
            />
            {errors?.make && (
              <p className="mt-1 text-xs text-red-600">{errors.make}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <FieldLabel required>Model</FieldLabel>
            <TextInput
              placeholder="e.g. Latitude 5540"
              value={data.model}
              onChange={(v) => onChange("model", v)}
              hasError={Boolean(errors?.model)}
            />
            {errors?.model && (
              <p className="mt-1 text-xs text-red-600">{errors.model}</p>
            )}
          </div>

          {/* Physical Condition */}
          <div>
            <FieldLabel>Physical Condition</FieldLabel>
            <SelectInput
              value={data.physicalCondition}
              onChange={(v) => onChange("physicalCondition", v)}
              options={PHYSICAL_CONDITIONS}
              hasError={Boolean(errors?.physicalCondition)}
            />
            {errors?.physicalCondition && (
              <p className="mt-1 text-xs text-red-600">
                {errors.physicalCondition}
              </p>
            )}
          </div>

          {/* Serial Number */}
          <div>
            <FieldLabel required>Serial Number</FieldLabel>
            <TextInput
              placeholder="Manufacturer serial number"
              value={data.serialNumber}
              onChange={(v) => onChange("serialNumber", v)}
              hasError={Boolean(errors?.serialNumber)}
            />
            {errors?.serialNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.serialNumber}</p>
            )}
          </div>

          {/* MAC Address */}
          <div>
            <FieldLabel>MAC Address</FieldLabel>
            <TextInput
              placeholder="e.g. AA:BB:CC:DD:EE:FF"
              value={data.macAddress}
              onChange={(v) => onChange("macAddress", v)}
              hasError={Boolean(errors?.macAddress)}
            />
            {errors?.macAddress && (
              <p className="mt-1 text-xs text-red-600">{errors.macAddress}</p>
            )}
          </div>

          {/* Colour */}
          <div>
            <FieldLabel>Colour</FieldLabel>
            <TextInput
              placeholder="e.g. Silver, Black, Space Grey"
              value={data.colour}
              onChange={(v) => onChange("colour", v)}
              hasError={Boolean(errors?.colour)}
            />
            {errors?.colour && (
              <p className="mt-1 text-xs text-red-600">{errors.colour}</p>
            )}
          </div>

          {/* IMEI — spans full width */}
          <div className="col-span-3">
            <FieldLabel>IMEI Number (Mobile Devices)</FieldLabel>
            <TextInput
              placeholder="15-digit IMEI (if applicable)"
              value={data.imeiNumber}
              onChange={(v) => onChange("imeiNumber", v)}
              className="max-w-sm"
              hasError={Boolean(errors?.imeiNumber)}
            />
            {errors?.imeiNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.imeiNumber}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
