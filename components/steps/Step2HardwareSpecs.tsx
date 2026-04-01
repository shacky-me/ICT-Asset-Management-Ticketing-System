"use client";

import React from "react";
import { OPERATING_SYSTEMS, Step2Data } from "@/types/assetRegistration";

interface Props {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string) => void;
  errors?: Partial<Record<keyof Step2Data, string>>;
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
  hasError = false,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 rounded-lg border ${hasError ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all`}
    />
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

export default function Step2HardwareSpecs({ data, onChange, errors }: Props) {
  return (
    <div className="space-y-8">
      {/* Computing Specifications */}
      <div>
        <SectionHeading>Computing Specifications</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Processor / CPU</FieldLabel>
            <TextInput
              placeholder="e.g. Intel Core i7-1265U, 2.6GHz"
              value={data.processorCpu}
              onChange={(v) => onChange("processorCpu", v)}
              hasError={Boolean(errors?.processorCpu)}
            />
            {errors?.processorCpu && (
              <p className="mt-1 text-xs text-red-600">{errors.processorCpu}</p>
            )}
          </div>
          <div>
            <FieldLabel>RAM / Memory</FieldLabel>
            <TextInput
              placeholder="e.g. 16GB DDR5-4800"
              value={data.ramMemory}
              onChange={(v) => onChange("ramMemory", v)}
              hasError={Boolean(errors?.ramMemory)}
            />
            {errors?.ramMemory && (
              <p className="mt-1 text-xs text-red-600">{errors.ramMemory}</p>
            )}
          </div>
          <div>
            <FieldLabel>Primary Storage</FieldLabel>
            <TextInput
              placeholder="e.g. 512GB NVMe SSD"
              value={data.primaryStorage}
              onChange={(v) => onChange("primaryStorage", v)}
              hasError={Boolean(errors?.primaryStorage)}
            />
            {errors?.primaryStorage && (
              <p className="mt-1 text-xs text-red-600">
                {errors.primaryStorage}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Screen / Display Size</FieldLabel>
            <TextInput
              placeholder='e.g. 14" FHD IPS, 1920×1080'
              value={data.screenDisplaySize}
              onChange={(v) => onChange("screenDisplaySize", v)}
              hasError={Boolean(errors?.screenDisplaySize)}
            />
            {errors?.screenDisplaySize && (
              <p className="mt-1 text-xs text-red-600">
                {errors.screenDisplaySize}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Power Rating</FieldLabel>
            <TextInput
              placeholder="e.g. 65W, 1500VA / 900W"
              value={data.powerRating}
              onChange={(v) => onChange("powerRating", v)}
              hasError={Boolean(errors?.powerRating)}
            />
            {errors?.powerRating && (
              <p className="mt-1 text-xs text-red-600">{errors.powerRating}</p>
            )}
          </div>
          <div>
            <FieldLabel>Colour / Finish</FieldLabel>
            <TextInput
              placeholder="e.g. Silver, Carbon Black"
              value={data.colourFinish}
              onChange={(v) => onChange("colourFinish", v)}
              hasError={Boolean(errors?.colourFinish)}
            />
            {errors?.colourFinish && (
              <p className="mt-1 text-xs text-red-600">{errors.colourFinish}</p>
            )}
          </div>
        </div>
      </div>

      {/* Software */}
      <div>
        <SectionHeading>Software</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Operating System</FieldLabel>
            <select
              value={data.operatingSystem}
              onChange={(e) => onChange("operatingSystem", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border ${errors?.operatingSystem ? "border-red-400" : "border-slate-200"} bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 ${errors?.operatingSystem ? "focus:ring-red-200 focus:border-red-500" : "focus:ring-blue-500/30 focus:border-blue-500"} transition-all appearance-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              <option value="">Select OS...</option>
              {OPERATING_SYSTEMS.map((os) => (
                <option key={os} value={os}>
                  {os}
                </option>
              ))}
            </select>
            {errors?.operatingSystem && (
              <p className="mt-1 text-xs text-red-600">
                {errors.operatingSystem}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>OS Version / Build Number</FieldLabel>
            <TextInput
              placeholder="e.g. 22H2 Build 22621.3296"
              value={data.osVersionBuildNumber}
              onChange={(v) => onChange("osVersionBuildNumber", v)}
              hasError={Boolean(errors?.osVersionBuildNumber)}
            />
            {errors?.osVersionBuildNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.osVersionBuildNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Network */}
      <div>
        <SectionHeading>Network</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>IP Address (If Static)</FieldLabel>
            <TextInput
              placeholder="e.g. 192.168.1.45"
              value={data.ipAddress}
              onChange={(v) => onChange("ipAddress", v)}
              hasError={Boolean(errors?.ipAddress)}
            />
            {errors?.ipAddress && (
              <p className="mt-1 text-xs text-red-600">{errors.ipAddress}</p>
            )}
          </div>
          <div>
            <FieldLabel>Hostname / Computer Name</FieldLabel>
            <TextInput
              placeholder="e.g. SDJHRCA-PC-039"
              value={data.hostnameComputerName}
              onChange={(v) => onChange("hostnameComputerName", v)}
              hasError={Boolean(errors?.hostnameComputerName)}
            />
            {errors?.hostnameComputerName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.hostnameComputerName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
