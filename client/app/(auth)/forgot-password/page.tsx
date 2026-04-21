"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailValid) return;

    try {
      setIsSubmitting(true);
      setErrorText("");
      await requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send reset email right now.";
      setErrorText(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Forgot Password</h1>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              If an account exists for {email.trim()}, a reset link has been
              sent.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {email && !isEmailValid && (
              <p className="text-xs text-red-600">
                Enter a valid email address.
              </p>
            )}

            {errorText && <p className="text-xs text-red-600">{errorText}</p>}

            <button
              type="submit"
              disabled={!isEmailValid || isSubmitting}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
