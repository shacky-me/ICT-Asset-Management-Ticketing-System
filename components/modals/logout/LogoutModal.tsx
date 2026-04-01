/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void | Promise<void>;
}

const LogoutModal = ({ isOpen, onClose, onLogout }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state every time modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      setProgress(0);
    }
  }, [isOpen]);

  // Animate progress bar while signing out
  useEffect(() => {
    if (!isLoading) return;

    // Quickly ramp to 80%, then slow down while waiting for redirect
    const targets = [20, 45, 65, 80, 90, 95];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const delays = [100, 250, 400, 600, 900, 1300];

    targets.forEach((target, i) => {
      timers.push(setTimeout(() => setProgress(target), delays[i]));
    });

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleLogout() {
    setIsLoading(true);
    // Small delay so the user sees the loading state before redirect
    await new Promise((r) => setTimeout(r, 1600));
    setProgress(100);
    // Let the bar finish before the page navigates
    await new Promise((r) => setTimeout(r, 300));
    await onLogout();
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4
                 bg-slate-900/40 backdrop-blur-sm"
      // Prevent closing while signing out
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl
                      flex flex-col items-center text-center px-8 py-8
                      overflow-hidden"
      >
        {/* LOADING STATE  */}
        {isLoading ? (
          <>
            {/* Spinning icon */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              {/* Outer spinning ring */}
              <svg
                className="absolute inset-0 animate-spin"
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#fee2e2"
                  strokeWidth="4"
                />
                <path
                  d="M32 4a28 28 0 0128 28"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              {/* Centre icon — static */}
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#ef4444"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 className="text-base font-bold text-slate-800 mb-1">
              Signing you out…
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Please wait while we securely end your session.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{progress}%</p>
          </>
        ) : (
          /* DEFAULT STATE */
          <>
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full border-2 border-red-200
                          flex items-center justify-center mb-5"
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="#ef4444"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-2">Sign Out</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-7">
              Are you sure you want to sign out of the ICT Asset Management
              System?
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200
                         text-sm font-semibold text-slate-600 bg-white
                         hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white
                         text-sm font-semibold hover:bg-red-700
                         transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default LogoutModal;
