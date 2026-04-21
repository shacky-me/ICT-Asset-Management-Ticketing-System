"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  completeFirstLoginPasswordReset,
  getPendingPasswordResetEmail,
  getPendingPasswordResetRememberMe,
} from "@/lib/authAccounts";
import { saveCurrentUser } from "@/lib/session";
import { addNotification } from "@/lib/notifications";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const error = useMemo(() => {
    if (!password || !confirmPassword) return "";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  }, [confirmPassword, password]);

  const canSubmit =
    password.length >= 8 && confirmPassword.length >= 8 && !error;

  const pendingEmail = getPendingPasswordResetEmail();
  const isFirstLoginFlow = params.get("firstLogin") === "1";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (isFirstLoginFlow) {
      const user = completeFirstLoginPasswordReset(password);
      if (!user) {
        setErrorText("Password reset session expired. Please sign in again.");
        return;
      }

      saveCurrentUser(user, {
        persistent: getPendingPasswordResetRememberMe(),
      });
      addNotification({
        title: "Password updated",
        message: "Your account is now active with your new password.",
        type: "auth",
      });
      router.push("/overview");
      return;
    }

    setErrorText("Password updated. You can now sign in.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>

        {isFirstLoginFlow && !pendingEmail ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Password reset session not found. Sign in again using your
              temporary password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isFirstLoginFlow && pendingEmail && (
              <p className="text-xs text-slate-500">
                Setting a new password for:{" "}
                <span className="font-semibold">{pendingEmail}</span>
              </p>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Re-enter password"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
            {errorText && (
              <p
                className={`text-xs ${errorText.includes("expired") ? "text-red-600" : "text-green-600"}`}
              >
                {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">Loading reset form...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
