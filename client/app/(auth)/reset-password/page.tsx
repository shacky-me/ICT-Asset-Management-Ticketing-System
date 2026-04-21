"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  changeTemporaryPassword,
  resetPasswordWithToken,
} from "@/lib/apiClient";
import { readAuthToken, readCurrentUser, saveCurrentUser } from "@/lib/session";
import { addNotification } from "@/lib/notifications";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const currentUser = readCurrentUser();
  const hasAuthToken = Boolean(readAuthToken());
  const pendingEmail = currentUser?.email || "";
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFirstLoginFlow = params.get("firstLogin") === "1";
  const token = params.get("token") || "";
  const isTokenResetFlow = Boolean(token) && !isFirstLoginFlow;

  const error = useMemo(() => {
    if (!currentPassword && isFirstLoginFlow) return "";
    if (!password || !confirmPassword) return "";
    if (isFirstLoginFlow && currentPassword.trim().length < 8)
      return "Temporary password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  }, [confirmPassword, currentPassword, isFirstLoginFlow, password]);

  const canSubmit =
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    (!isFirstLoginFlow || currentPassword.trim().length >= 8) &&
    !error &&
    !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (isFirstLoginFlow) {
      if (!hasAuthToken || !pendingEmail) {
        setErrorText("Session expired. Please sign in again.");
        return;
      }

      try {
        setIsSubmitting(true);
        setErrorText("");
        const response = await changeTemporaryPassword({
          currentPassword,
          newPassword: password,
        });

        const persistent =
          typeof window !== "undefined" &&
          Boolean(window.localStorage.getItem("ictams.currentUser"));

        saveCurrentUser(response.user, { persistent });
        addNotification({
          title: "Password updated",
          message: "Your account is now active with your new password.",
          type: "auth",
        });
        router.push("/overview");
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to update password.";
        setErrorText(message);
        setIsSubmitting(false);
        return;
      }
    }

    if (isTokenResetFlow) {
      try {
        setIsSubmitting(true);
        setErrorText("");
        await resetPasswordWithToken({ token, newPassword: password });
        addNotification({
          title: "Password updated",
          message: "You can now sign in with your new password.",
          type: "auth",
        });
        router.push("/login");
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to update password.";
        setErrorText(message);
        setIsSubmitting(false);
        return;
      }
    }

    setErrorText("Invalid reset request.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>

        {isFirstLoginFlow && (!pendingEmail || !hasAuthToken) ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reset session not found. Sign in again using your temporary
              password.
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
            {!isFirstLoginFlow && !isTokenResetFlow && (
              <p className="text-xs text-red-600">
                Invalid or missing reset token. Please request a new reset link.
              </p>
            )}
            {isFirstLoginFlow && pendingEmail && (
              <p className="text-xs text-slate-500">
                Setting a new password for:{" "}
                <span className="font-semibold">{pendingEmail}</span>
              </p>
            )}

            {isTokenResetFlow && (
              <p className="text-xs text-slate-500">
                Set your new password to complete the reset process.
              </p>
            )}

            {isFirstLoginFlow && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Enter temporary password"
                />
              </div>
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
              disabled={!canSubmit || (!isFirstLoginFlow && !isTokenResetFlow)}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
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
