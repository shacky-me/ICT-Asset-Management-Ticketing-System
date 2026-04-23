"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  NewTicketFormData,
  TicketPriority,
  TicketCategory,
  EMPTY_TICKET_FORM,
  PRIORITY_META,
  CATEGORY_META,
  MOCK_ASSETS,
  DEPARTMENTS,
} from "@/types/ticket";
import {
  createTicket,
  getSupportStaff,
  type ApiSupportStaff,
} from "@/lib/apiClient";
import { addNotification } from "@/lib/notifications";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefilledAssetTag?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  department?: string;
  assignee?: string;
}

function validate(form: NewTicketFormData): FormErrors {
  const e: FormErrors = {};
  if (!form.title.trim()) e.title = "Issue title is required.";
  if (!form.description.trim()) e.description = "Please describe the issue.";
  if (!form.category) e.category = "Select a category.";
  if (!form.priority) e.priority = "Select a priority level.";
  if (!form.department) e.department = "Select your department.";
  return e;
}

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
const CATEGORIES: TicketCategory[] = [
  "Hardware",
  "Software",
  "Network",
  "Access & Accounts",
  "Printer",
  "Other",
];

// Reusable base input / select / textarea
const baseInput = (err?: boolean) =>
  [
    "w-full px-3 py-2.5 text-sm text-slate-800 bg-white rounded-lg",
    "border transition-all outline-none placeholder:text-slate-400",
    "focus:ring-2 focus:ring-blue-100 focus:border-blue-600",
    err
      ? "border-red-400 ring-2 ring-red-100"
      : "border-slate-200 hover:border-slate-300",
  ].join(" ");

export default function RaiseTicketModal({
  isOpen,
  onClose,
  prefilledAssetTag = "",
}: Props) {
  const [form, setForm] = useState<NewTicketFormData>(EMPTY_TICKET_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof NewTicketFormData, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [supportStaff, setSupportStaff] = useState<ApiSupportStaff[]>([]);
  const [supportStaffLoading, setSupportStaffLoading] = useState(false);
  const [supportStaffError, setSupportStaffError] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetDropOpen, setAssetDropOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    const prefilled = prefilledAssetTag
      ? MOCK_ASSETS.find((a) => a.tag === prefilledAssetTag)
      : null;
    setForm({
      ...EMPTY_TICKET_FORM,
      affectedAssetTag: prefilled?.tag ?? "",
      affectedAssetName: prefilled?.name ?? "",
    });
    setAssetSearch(prefilled ? `${prefilled.tag} — ${prefilled.name}` : "");
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    setIsSubmitting(false);
    setAssignedTo(null);
    setSupportStaffError("");
    setTimeout(() => firstFieldRef.current?.focus(), 120);
  }, [isOpen, prefilledAssetTag]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadSupportStaff = async () => {
      setSupportStaffLoading(true);
      setSupportStaffError("");

      try {
        const response = await getSupportStaff();
        if (cancelled) return;

        setSupportStaff(response.supportStaff);
        setAssignedTo((current) => {
          if (
            current &&
            response.supportStaff.some((staff) => staff.fullName === current)
          ) {
            return current;
          }
          return response.supportStaff[0]?.fullName ?? null;
        });
      } catch {
        if (!cancelled) {
          setSupportStaff([]);
          setAssignedTo(null);
          setSupportStaffError(
            "Unable to load ICT officers and administrators right now.",
          );
        }
      } finally {
        if (!cancelled) {
          setSupportStaffLoading(false);
        }
      }
    };

    loadSupportStaff();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const update = useCallback(
    (
      field: keyof NewTicketFormData,
      value: NewTicketFormData[keyof NewTicketFormData],
    ) => {
      setForm((p) => ({ ...p, [field]: value }));
      setTouched((p) => ({ ...p, [field]: true }));
      setErrors((p) => ({ ...p, [field]: undefined }));
    },
    [],
  );

  const filteredAssets = MOCK_ASSETS.filter(
    (a) =>
      a.tag.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase()),
  );

  function selectAsset(tag: string, name: string) {
    update("affectedAssetTag", tag);
    update("affectedAssetName", name);
    setAssetSearch(`${tag} — ${name}`);
    setAssetDropOpen(false);
  }

  function clearAsset() {
    update("affectedAssetTag", "");
    update("affectedAssetName", "");
    setAssetSearch("");
  }

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const allowed = ["image/png", "image/jpeg", "image/gif", "application/pdf"];
    const valid = Array.from(incoming).filter((f) => allowed.includes(f.type));
    setForm((p) => ({
      ...p,
      attachments: [...p.attachments, ...valid].slice(0, 5),
    }));
  }

  async function handleSubmit() {
    setTouched({
      title: true,
      description: true,
      category: true,
      priority: true,
      department: true,
    });
    const ve = validate(form);
    if (Object.keys(ve).length) {
      setErrors(ve);
      return;
    }
    if (!assignedTo) {
      setErrors((current) => ({
        ...current,
        assignee: "Select an ICT officer or ICT administrator.",
      }));
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createTicket({ ...form, assignedTo });
      setGeneratedId(response.id);

      addNotification({
        title: "Ticket raised",
        message: `${response.id} submitted successfully.`,
        type: "ticket",
      });

      setIsSuccess(true);
    } catch {
      setErrors({ title: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRaiseAnother() {
    setForm(EMPTY_TICKET_FORM);
    setAssetSearch("");
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    setAssignedTo(null);
    setTimeout(() => firstFieldRef.current?.focus(), 120);
  }

  if (!isOpen || !mounted) return null;

  function removeFile(i: number): void {
    setForm((p) => ({
      ...p,
      attachments: p.attachments.filter((_, idx) => idx !== i),
    }));
  }

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4
                 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-145 max-h-[92vh] flex flex-col
         bg-white rounded-2xl shadow-2xl overflow-hidden shrink-0"
        role="dialog"
        aria-modal="true"
      >
        {/*  SUCCESS  */}
        {isSuccess ? (
          <div className="flex flex-col items-center text-center px-8 pt-10 pb-8">
            {/* Icon */}
            <div
              className="relative w-16 h-16 rounded-full bg-blue-700
                            flex items-center justify-center mb-5"
            >
              <div
                className="absolute inset-6px rounded-full
                              border-[3px] border-blue-300"
              />
              <svg
                width="30"
                height="30"
                fill="none"
                stroke="white"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-1.5">
              Ticket Raised
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Your request has been submitted to the ICT helpdesk.
            </p>

            {/* ID pill */}
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full
                            bg-blue-50 border border-blue-200 mb-5"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Ticket ID
              </span>
              <span className="font-mono text-sm font-bold text-blue-700">
                {generatedId}
              </span>
            </div>

            {/* Summary */}
            <div className="w-full bg-slate-50 rounded-xl border border-slate-100 p-4 mb-4 text-left">
              {[
                { key: "Issue", val: form.title },
                { key: "Category", val: form.category },
                { key: "Priority", val: form.priority },
                { key: "Department", val: form.department },
                ...(form.affectedAssetTag
                  ? [{ key: "Asset", val: form.affectedAssetTag }]
                  : []),
                {
                  key: "Assigned To",
                  val: assignedTo ?? "Unassigned — ICT will allocate",
                },
                ...(form.priority
                  ? [
                      {
                        key: "SLA",
                        val: PRIORITY_META[form.priority as TicketPriority].sla,
                      },
                    ]
                  : []),
              ].map(({ key, val }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2
                             border-b border-slate-100 last:border-0"
                >
                  <span className="text-xs text-slate-500 font-medium">
                    {key}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 text-right max-w-[58%]">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-5">
              📧 A confirmation has been sent to your email.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleRaiseAnother}
                className="flex-1 py-2.5 rounded-xl border border-slate-200
                           text-sm font-semibold text-slate-600
                           hover:bg-slate-50 transition-colors"
              >
                + Raise Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white
                           text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/*  HEADER  */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0
                          bg-linear-to-r from-[#0f1f4b] to-[#1a4fba]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg bg-white/15
                              flex items-center justify-center shrink-0"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">
                    Raise a Ticket
                  </p>
                  <p className="text-[11px] text-white/50">
                    ICT Support Request
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-white/20 bg-white/10
                         flex items-center justify-center text-white
                         hover:bg-white/20 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/*  BODY  */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Issue Title */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold text-slate-700"
                  htmlFor="rtm-title"
                >
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="rtm-title"
                  ref={firstFieldRef}
                  className={baseInput(!!(errors.title && touched.title))}
                  placeholder="e.g. Laptop screen flickering since this morning"
                  value={form.title}
                  maxLength={120}
                  onChange={(e) => update("title", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                />
                <div className="flex justify-between">
                  {errors.title && touched.title ? (
                    <span className="text-[11px] text-red-500 font-medium">
                      {errors.title}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto">
                    {form.title.length}/120
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const isActive = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => update("category", cat)}
                        className={[
                          "flex flex-col items-start gap-1 p-2.5 rounded-xl",
                          "border-[1.5px] text-left transition-all",
                          isActive
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <span className="text-lg leading-none">
                          {meta.icon}
                        </span>
                        <span
                          className={`text-xs font-bold leading-tight
                        ${isActive ? "text-blue-700" : "text-slate-800"}`}
                        >
                          {cat}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          {meta.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && touched.category && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITIES.map((p) => {
                    const meta = PRIORITY_META[p];
                    const isActive = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("priority", p)}
                        style={
                          isActive
                            ? {
                                background: meta.bg,
                                borderColor: meta.border,
                                color: meta.color,
                              }
                            : {}
                        }
                        className={[
                          "flex items-center gap-2 px-3.5 py-2 rounded-lg",
                          "border-[1.5px] text-xs font-semibold transition-all",
                          isActive
                            ? ""
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                        ].join(" ")}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: meta.color }}
                        />
                        {p}
                      </button>
                    );
                  })}
                </div>
                {/* SLA hint */}
                {form.priority && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                                bg-slate-50 border border-slate-100 text-xs text-slate-500"
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                      <path
                        d="M12 6v6l4 2"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      <b className="text-slate-700">{form.priority}</b> —{" "}
                      {PRIORITY_META[form.priority as TicketPriority].desc}.{" "}
                      SLA:{" "}
                      <b className="text-slate-700">
                        {PRIORITY_META[form.priority as TicketPriority].sla}
                      </b>
                    </span>
                  </div>
                )}
                {errors.priority && touched.priority && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {errors.priority}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold text-slate-700"
                  htmlFor="rtm-desc"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rtm-desc"
                  rows={4}
                  className={baseInput(
                    !!(errors.description && touched.description),
                  )}
                  placeholder="Describe the issue in detail, when it started, what you were doing, any error messages, steps already tried…"
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    update("description", e.target.value)
                  }
                  onBlur={() =>
                    setTouched((p) => ({ ...p, description: true }))
                  }
                  style={{
                    resize: "vertical",
                    minHeight: "96px",
                    lineHeight: "1.6",
                  }}
                />
                {errors.description && touched.description && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Department + Preferred Resolution Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="rtm-dept"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rtm-dept"
                    className={baseInput(
                      !!(errors.department && touched.department),
                    )}
                    value={form.department}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      update("department", e.target.value)
                    }
                    onBlur={() =>
                      setTouched((p) => ({ ...p, department: true }))
                    }
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.department && touched.department && (
                    <span className="text-[11px] text-red-500 font-medium">
                      {errors.department}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="rtm-prd"
                  >
                    Preferred Resolution Date
                  </label>
                  <input
                    id="rtm-prd"
                    type="date"
                    className={baseInput()}
                    value={form.preferredResolution}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("preferredResolution", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  className={baseInput(!!errors.assignee)}
                  value={assignedTo ?? ""}
                  onChange={(event) => {
                    setAssignedTo(event.target.value || null);
                    setErrors((current) => ({
                      ...current,
                      assignee: undefined,
                    }));
                  }}
                  disabled={supportStaffLoading || supportStaff.length === 0}
                >
                  <option value="">
                    {supportStaffLoading
                      ? "Loading ICT staff..."
                      : "Select ICT officer or administrator"}
                  </option>
                  {supportStaff.map((staff) => (
                    <option key={staff.id} value={staff.fullName}>
                      {staff.fullName} - {staff.role}
                    </option>
                  ))}
                </select>
                {supportStaffError ? (
                  <p className="text-[11px] text-amber-600 font-medium">
                    {supportStaffError}
                  </p>
                ) : errors.assignee ? (
                  <span className="text-[11px] text-red-500 font-medium">
                    {errors.assignee}
                  </span>
                ) : null}
              </div>

              {/* Affected Asset */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  Affected Asset
                  <span className="text-[11px] font-normal text-slate-400">
                    Optional - link to asset register
                  </span>
                </label>
                <div className="relative flex items-center">
                  <svg
                    className="absolute left-3 text-slate-400 pointer-events-none shrink-0"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <line
                      x1="21"
                      y1="21"
                      x2="16.65"
                      y2="16.65"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    className={`${baseInput()} pl-8 ${form.affectedAssetTag ? "pr-8" : ""}`}
                    placeholder="Search by asset tag or name…"
                    value={assetSearch}
                    onChange={(e) => {
                      setAssetSearch(e.target.value);
                      setAssetDropOpen(true);
                      if (!e.target.value) clearAsset();
                    }}
                    onFocus={() => setAssetDropOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setAssetDropOpen(false), 160)
                    }
                  />
                  {form.affectedAssetTag && (
                    <button
                      type="button"
                      onClick={clearAsset}
                      className="absolute right-2.5 w-5 h-5 rounded-full bg-slate-100
                               flex items-center justify-center text-slate-500
                               hover:bg-red-100 hover:text-red-500 transition-colors"
                    >
                      <svg
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Asset dropdown */}
                {assetDropOpen && assetSearch && (
                  <div
                    className="absolute top-full left-0 right-0 z-50 mt-1
                                bg-white border border-slate-200 rounded-xl
                                shadow-xl max-h-48 overflow-y-auto"
                  >
                    {filteredAssets.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400 text-center">
                        No assets found
                      </p>
                    ) : (
                      filteredAssets.map((a) => (
                        <button
                          key={a.tag}
                          type="button"
                          onMouseDown={() => selectAsset(a.tag, a.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5
                                 hover:bg-blue-50 transition-colors text-left"
                        >
                          <span className="font-mono text-[11px] font-bold text-blue-700 shrink-0">
                            {a.tag}
                          </span>
                          <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">
                            {a.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {a.category}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Selected chip */}
                {form.affectedAssetTag && (
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5
                                rounded-full bg-blue-50 border border-blue-200"
                  >
                    <svg
                      className="shrink-0"
                      width="11"
                      height="11"
                      fill="none"
                      stroke="#1d4ed8"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                        strokeWidth="1.8"
                      />
                      <line
                        x1="7"
                        y1="7"
                        x2="7.01"
                        y2="7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-mono text-[11px] font-bold text-blue-700">
                      {form.affectedAssetTag}
                    </span>
                    <span className="text-xs text-slate-600">
                      {form.affectedAssetName}
                    </span>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  Attachments
                  <span className="text-[11px] font-normal text-slate-400">
                    Screenshots, photos, PDFs — max 5
                  </span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={[
                    "flex flex-col items-center justify-center gap-1.5 py-6",
                    "rounded-xl border-2 border-dashed cursor-pointer transition-all",
                    dragOver
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50",
                  ].join(" ")}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm text-slate-500">
                    <b className="text-blue-600">Click to upload</b> or drag
                    &amp; drop
                  </p>
                  <p className="text-xs">PNG, JPG, GIF, PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {form.attachments.length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    {form.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 px-3 py-2
                                 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <span className="text-base shrink-0">
                          {file.type.startsWith("image") ? "🖼️" : "📄"}
                        </span>
                        <span className="text-xs text-slate-700 flex-1 truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="w-5 h-5 rounded-full bg-slate-200 flex items-center
                                   justify-content text-slate-500 hover:bg-red-100
                                   hover:text-red-500 transition-colors shrink-0"
                        >
                          <svg
                            width="10"
                            height="10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment banner */}
              <div
                className={[
                  "flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs border",
                  assignedTo
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-slate-50 border-slate-200 text-slate-500",
                ].join(" ")}
              >
                {assignedTo ? (
                  <>
                    <svg
                      className="shrink-0 mt-0.5"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="7" r="4" strokeWidth="1.8" />
                    </svg>
                    <span>
                      This ticket will be assigned to <b>{assignedTo}</b> from
                      the current ICT support staff list.
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="shrink-0 mt-0.5"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                      <path
                        d="M12 8v4M12 16h.01"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      {supportStaffLoading
                        ? "Loading ICT support staff..."
                        : "Select an ICT officer or ICT administrator to assign this ticket."}
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* /body */}

            {/*  FOOTER  */}
            <div
              className="flex items-center justify-end gap-2.5 px-5 py-4
                          border-t border-slate-100 shrink-0"
            >
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                         text-sm font-semibold text-slate-600
                         hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                         bg-blue-700 text-white text-sm font-semibold
                         hover:bg-blue-800 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        strokeWidth="1.8"
                      />
                    </svg>
                    Raise Ticket
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
