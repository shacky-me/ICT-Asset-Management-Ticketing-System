"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AssetRegistrationFormData,
  defaultFormData,
  generateFreshSystemAssetId,
  STEP_LABELS,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
} from "@/types/assetRegistration";
import {
  AssetAssignmentSchema,
  AssetHardwareSpecsSchema,
  AssetProcurementSchema,
  AssetRegistrationSchema,
} from "@/lib/validations/assetRegistration";
import { AssetIdentificationSchema } from "@/lib/validations/assetIdentity";
import { registerAsset } from "@/lib/apiClient";
import { addNotification } from "@/lib/notifications";
import Step1Identification from "../steps/Step1Identification";
import Step2HardwareSpecs from "../steps/Step2HardwareSpecs";
import Step3Procurement from "../steps/Step3Procurement";
import Step4Assignment from "../steps/Step4Assignment";
import StepSuccess from "../steps/StepSuccess";

//  Types

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Organisation / department name displayed in the subtitle */
  orgName?: string;
}

type StepFieldErrors<T extends object> = Partial<Record<keyof T, string>>;

type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

function mapFieldErrors<T extends object>(
  issues: ValidationIssue[],
): StepFieldErrors<T> {
  const next: StepFieldErrors<T> = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    const field = key as keyof T;
    if (next[field]) continue;
    next[field] = issue.message;
  }

  return next;
}

function mapNestedFieldErrors<T extends object>(
  issues: ValidationIssue[],
  stepKey: "step1" | "step2" | "step3" | "step4",
): StepFieldErrors<T> {
  const next: StepFieldErrors<T> = {};

  for (const issue of issues) {
    if (issue.path[0] !== stepKey) continue;
    const fieldKey = issue.path[1];
    if (typeof fieldKey !== "string") continue;
    const field = fieldKey as keyof T;
    if (next[field]) continue;
    next[field] = issue.message;
  }

  return next;
}

//  Step Indicator

function StepIndicator({
  currentStep,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-0 py-5 px-6 border-b border-slate-100">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;

        return (
          <React.Fragment key={label}>
            {/* Connector line before (except first) */}
            {idx > 0 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
                  isComplete ? "bg-green-500" : "bg-slate-200"
                }`}
              />
            )}

            {/* Step bubble + label */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`
                                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                    ${isComplete ? "bg-green-500 text-white" : ""}
                                    ${isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" : ""}
                                    ${isPending ? "bg-slate-100 text-slate-400 border border-slate-200" : ""}
                                `}
              >
                {isComplete ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : isComplete
                      ? "text-green-600"
                      : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

//  Main Component

export default function RegisterAssetModal({
  isOpen,
  onClose,
  orgName = "State Department for Justice, Human Rights & Constitutional Affairs — ICT Department",
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<AssetRegistrationFormData>(defaultFormData);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Errors, setStep1Errors] = useState<StepFieldErrors<Step1Data>>(
    {},
  );
  const [step2Errors, setStep2Errors] = useState<StepFieldErrors<Step2Data>>(
    {},
  );
  const [step3Errors, setStep3Errors] = useState<StepFieldErrors<Step3Data>>(
    {},
  );
  const [step4Errors, setStep4Errors] = useState<StepFieldErrors<Step4Data>>(
    {},
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const resetFormState = useCallback(() => {
    setCurrentStep(1);
    setIsRegistered(false);
    setIsSubmitting(false);
    setFormData({
      ...defaultFormData,
      step1: {
        ...defaultFormData.step1,
        systemAssetId: generateFreshSystemAssetId(),
      },
    });
    setStep1Errors({});
    setStep2Errors({});
    setStep3Errors({});
    setStep4Errors({});
  }, []);

  const handleClose = useCallback(() => {
    resetFormState();
    onClose();
  }, [onClose, resetFormState]);

  // Scroll to top of content on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  //  Field update helpers

  const updateStep1 = useCallback((field: keyof Step1Data, value: string) => {
    setFormData((prev) => ({
      ...prev,
      step1: { ...prev.step1, [field]: value },
    }));

    setStep1Errors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateStep2 = useCallback((field: keyof Step2Data, value: string) => {
    setFormData((prev) => ({
      ...prev,
      step2: { ...prev.step2, [field]: value },
    }));

    setStep2Errors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateStep3 = useCallback((field: keyof Step3Data, value: string) => {
    setFormData((prev) => ({
      ...prev,
      step3: { ...prev.step3, [field]: value },
    }));

    setStep3Errors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateStep4 = useCallback((field: keyof Step4Data, value: string) => {
    setFormData((prev) => ({
      ...prev,
      step4: { ...prev.step4, [field]: value },
    }));

    setStep4Errors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateCurrentStep = useCallback(() => {
    if (currentStep === 1) {
      const result = AssetIdentificationSchema.safeParse(formData.step1);
      if (!result.success) {
        setStep1Errors(mapFieldErrors<Step1Data>(result.error.issues));
        return false;
      }
      setStep1Errors({});
      return true;
    }

    if (currentStep === 2) {
      const result = AssetHardwareSpecsSchema.safeParse(formData.step2);
      if (!result.success) {
        setStep2Errors(mapFieldErrors<Step2Data>(result.error.issues));
        return false;
      }
      setStep2Errors({});
      return true;
    }

    if (currentStep === 3) {
      const result = AssetProcurementSchema.safeParse(formData.step3);
      if (!result.success) {
        setStep3Errors(mapFieldErrors<Step3Data>(result.error.issues));
        return false;
      }
      setStep3Errors({});
      return true;
    }

    const result = AssetAssignmentSchema.safeParse(formData.step4);
    if (!result.success) {
      setStep4Errors(mapFieldErrors<Step4Data>(result.error.issues));
      return false;
    }
    setStep4Errors({});
    return true;
  }, [
    currentStep,
    formData.step1,
    formData.step2,
    formData.step3,
    formData.step4,
  ]);

  //  Navigation

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < 4) setCurrentStep((s) => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const result = AssetRegistrationSchema.safeParse(formData);

    if (!result.success) {
      setStep1Errors(
        mapNestedFieldErrors<Step1Data>(result.error.issues, "step1"),
      );
      setStep2Errors(
        mapNestedFieldErrors<Step2Data>(result.error.issues, "step2"),
      );
      setStep3Errors(
        mapNestedFieldErrors<Step3Data>(result.error.issues, "step3"),
      );
      setStep4Errors(
        mapNestedFieldErrors<Step4Data>(result.error.issues, "step4"),
      );

      const firstStepWithError = result.error.issues.find(
        (issue) =>
          issue.path[0] === "step1" ||
          issue.path[0] === "step2" ||
          issue.path[0] === "step3" ||
          issue.path[0] === "step4",
      )?.path[0];

      if (firstStepWithError === "step1") setCurrentStep(1);
      if (firstStepWithError === "step2") setCurrentStep(2);
      if (firstStepWithError === "step3") setCurrentStep(3);
      if (firstStepWithError === "step4") setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerAsset(formData);
      addNotification({
        title: "Asset registered",
        message: `${formData.step1.assetTagNumber} has been saved as ${response.systemAssetId}.`,
        type: "asset",
      });
      setIsRegistered(true);
    } catch {
      setStep1Errors((prev) => ({
        ...prev,
        assetTagNumber: "Unable to submit now. Please try again.",
      }));
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    resetFormState();
  };

  if (!isOpen) return null;

  return (
    /*  Backdrop  */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.55)" }}
      onClick={handleBackdropClick}
    >
      {/*  Modal panel  */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/*  Header  */}
        <div className="px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2
                id="modal-title"
                className="text-xl font-bold text-slate-900 tracking-tight"
              >
                Register New ICT Asset
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{orgName}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/*  Step indicator (hidden on success)  */}
        {!isRegistered && (
          <StepIndicator currentStep={currentStep} totalSteps={4} />
        )}

        {/*  Scrollable body  */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step content */}
          {isRegistered ? (
            <StepSuccess
              formData={formData}
              onClose={handleClose}
              onRegisterAnother={handleRegisterAnother}
            />
          ) : currentStep === 1 ? (
            <Step1Identification
              data={formData.step1}
              onChange={updateStep1}
              errors={step1Errors}
            />
          ) : currentStep === 2 ? (
            <Step2HardwareSpecs
              data={formData.step2}
              onChange={updateStep2}
              errors={step2Errors}
            />
          ) : currentStep === 3 ? (
            <Step3Procurement
              data={formData.step3}
              onChange={updateStep3}
              errors={step3Errors}
            />
          ) : (
            <Step4Assignment
              data={formData.step4}
              onChange={updateStep4}
              errors={step4Errors}
            />
          )}
        </div>

        {/*  Footer / Navigation  */}
        {!isRegistered && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <span className="text-xs text-slate-400 font-medium">
              Step {currentStep} of 4
            </span>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
                >
                  {isSubmitting ? "Submitting..." : "Next"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm shadow-green-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isSubmitting ? "Registering..." : "Register Asset"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
