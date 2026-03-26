"use client";

import React from "react";
import { AssetRegistrationFormData } from "@/types/assetRegistration";

interface Props {
  formData: AssetRegistrationFormData;
  onClose: () => void;
  onRegisterAnother: () => void;
}

export default function StepSuccess({
  formData,
  onClose,
  onRegisterAnother,
}: Props) {
  const { step1 } = formData;

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {/* Animated checkmark circle */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 0,
                animation: "dash 0.4s ease forwards",
              }}
            />
          </svg>
        </div>
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full bg-green-200 opacity-40 animate-ping" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Asset Registered Successfully!
      </h2>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        The ICT asset has been added to the register and is now tracked in the
        system.
      </p>

      {/* Asset summary card */}
      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-5 text-left mb-8 space-y-3">
        <Row label="System Asset ID" value={step1.systemAssetId} mono />
        {step1.assetTagNumber && (
          <Row label="Asset Tag" value={step1.assetTagNumber} />
        )}
        {step1.category && (
          <Row
            label="Category"
            value={
              step1.subCategory
                ? `${step1.category} › ${step1.subCategory}`
                : step1.category
            }
          />
        )}
        {step1.make && step1.model && (
          <Row label="Device" value={`${step1.make} ${step1.model}`} />
        )}
        {step1.serialNumber && (
          <Row label="Serial No." value={step1.serialNumber} />
        )}
        {formData.step4.assignedTo && (
          <Row label="Assigned To" value={formData.step4.assignedTo} />
        )}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onRegisterAnother}
          className="flex-1 px-4 py-2.5 rounded-lg border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          Register Another
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`font-semibold text-slate-800 ${mono ? "font-mono text-blue-700" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
