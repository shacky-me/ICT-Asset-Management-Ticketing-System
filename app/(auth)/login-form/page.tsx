"use client";

import Image from "next/image";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Logo from "@/app/assets/Logo.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/apiClient";
import { saveCurrentUser } from "@/lib/session";
import { addNotification } from "@/lib/notifications";
import {
  authenticateProvisionedAccount,
  setPendingPasswordResetEmail,
} from "@/lib/authAccounts";

// Validators

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,}$/.test(value);
}

function isValidIdentifier(value: string): boolean {
  return isValidEmail(value) || isValidUsername(value);
}

function getPasswordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++;
  return score;
}

// Strength bar config

const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#3b82f6", "#22c55e"];
const STRENGTH_LABELS = ["", "Too weak", "Weak", "Good", "Strong"];

// Loading step labels

function getLoadingLabel(progress: number): string {
  if (progress < 40) return "Connecting…";
  if (progress < 75) return "Authenticating…";
  return "Almost there…";
}

// Component

const LoginFormPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authError, setAuthError] = useState("");
  const activeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (activeInterval.current) clearInterval(activeInterval.current);
    };
  }, []);

  // Derived validation

  const emailValid = isValidIdentifier(email.trim());
  const emailError =
    emailTouched && email.trim() && !emailValid
      ? "Enter a valid email (you@example.com)"
      : null;

  const passwordStrength =
    password.length > 0 ? Math.max(1, getPasswordStrength(password)) : 0;
  const passwordValid = password.length >= 8;
  const passwordError =
    passwordTouched && password && !passwordValid
      ? "Password must be at least 8 characters"
      : null;

  const canSubmit = emailValid && passwordValid;

  // Helpers

  const inputClass = (touched: boolean, valid: boolean, value: string) => {
    if (!touched || !value) return "text-sm";
    return valid
      ? "text-sm border-green-500 focus:border-green-500"
      : "text-sm border-red-400 focus:border-red-400";
  };

  const crawlTo = (
    from: number,
    target: number,
    ease: number,
    intervalMs: number,
  ): Promise<void> =>
    new Promise((resolve) => {
      let val = from;
      const id = setInterval(() => {
        val += (target - val) * ease;
        setProgress(val);
        if (val >= target - 0.5) {
          clearInterval(id);
          setProgress(target);
          resolve();
        }
      }, intervalMs);
      activeInterval.current = id;
    });

  // Submit

  const handleSubmit = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      setEmailTouched(true);
      setPasswordTouched(true);
      if (!canSubmit) return;
      setAuthError("");

      setIsLoading(true);
      setProgress(0);

      const provisionedResult = authenticateProvisionedAccount(
        email.trim(),
        password,
      );

      if (provisionedResult.status === "invalid_password") {
        setAuthError("Invalid credentials. Check your email and password.");
        setIsLoading(false);
        return;
      }

      if (provisionedResult.status === "requires_password_reset") {
        setPendingPasswordResetEmail(provisionedResult.email, keepLoggedIn);
        router.push("/reset-password?firstLogin=1");
        return;
      }

      if (provisionedResult.status === "authenticated") {
        const currentUser = saveCurrentUser(provisionedResult.user, {
          persistent: keepLoggedIn,
        });
        addNotification({
          title: "Signed in successfully",
          message: `Welcome back, ${currentUser.name}.`,
          type: "auth",
        });
        router.push("/overview");
        return;
      }

      await crawlTo(0, 40, 0.15, 30);
      await crawlTo(40, 75, 0.04, 40);
      await new Promise((res) => setTimeout(res, 500));
      await crawlTo(75, 100, 0.25, 20);
      await new Promise((res) => setTimeout(res, 350));

      try {
        const authResponse = await login({
          identifier: email.trim(),
          password,
          rememberMe: keepLoggedIn,
        });

        type AccessRequestPersonalDraft = {
          fullName?: string;
          staffNumber?: string;
          department?: string;
        };

        type AccessRequestRoleDraft = { role?: string };

        let personalDraft: AccessRequestPersonalDraft | null = null;
        let accessDraft: AccessRequestRoleDraft | null = null;

        try {
          const personalRaw = localStorage.getItem("request_access_step1");
          const accessRaw = localStorage.getItem("accessDetails");
          personalDraft = personalRaw
            ? (JSON.parse(personalRaw) as AccessRequestPersonalDraft)
            : null;
          accessDraft = accessRaw
            ? (JSON.parse(accessRaw) as AccessRequestRoleDraft)
            : null;
        } catch {
          personalDraft = null;
          accessDraft = null;
        }

        const currentUser = saveCurrentUser(
          {
            ...authResponse.user,
            name: personalDraft?.fullName || authResponse.user.name,
            department:
              personalDraft?.department || authResponse.user.department,
            role: accessDraft?.role
              ? accessDraft.role[0].toUpperCase() + accessDraft.role.slice(1)
              : authResponse.user.role,
            staffNumber: personalDraft?.staffNumber,
            email: authResponse.user.email,
          },
          { persistent: keepLoggedIn },
        );

        addNotification({
          title: "Signed in successfully",
          message: `Welcome back, ${currentUser.name}.`,
          type: "auth",
        });

        router.push("/overview");
      } catch {
        setAuthError("Unable to sign in right now. Please try again.");
        setIsLoading(false);
      }
    },
    [canSubmit, crawlTo, email, keepLoggedIn, password, router],
  );

  // Render

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#fefefe]">
      <main className="fixed top-0 left-0 right-0 bottom-0 flex-1 flex justify-center items-center">
        <FieldSet className="w-full max-w-md px-10 py-8 border border-gray-200 rounded-lg space-y-8 shadow-lg shadow-gray-200 bg-white">
          <div className="flex flex-col justify-center items-center">
            <Image src={Logo} alt="Logo" className="h-8 w-60" />
            <h1 className="text-sm text-[#747376] mt-2 text-center">
              Sign in to access the asset management system
            </h1>
          </div>

          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <div className="relative">
                <Input
                  className={inputClass(emailTouched, emailValid, email)}
                  id="email"
                  type="text"
                  placeholder="e.g. ongengu.brian@ag.go.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  disabled={isLoading}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : "email-desc"}
                />
                {emailTouched && email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </span>
                )}
              </div>
              {emailError ? (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {emailError}
                </p>
              ) : (
                <FieldDescription id="email-desc">
                  Use your email to sign in.
                </FieldDescription>
              )}
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pr-10 ${inputClass(passwordTouched, passwordValid, password)}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  disabled={isLoading}
                  aria-invalid={!!passwordError}
                  aria-describedby={
                    passwordError ? "password-error" : "password-desc"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {password.length > 0 && (
                <div className="flex gap-1 mt-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-200"
                      style={{
                        background:
                          i <= passwordStrength
                            ? STRENGTH_COLORS[passwordStrength]
                            : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
              )}

              {password.length > 0 && (
                <p
                  className="text-xs mt-1"
                  style={{ color: STRENGTH_COLORS[passwordStrength] }}
                >
                  {STRENGTH_LABELS[passwordStrength]}
                </p>
              )}

              {passwordError ? (
                <p id="password-error" className="text-xs text-red-500 mt-1">
                  {passwordError}
                </p>
              ) : (
                !password && (
                  <FieldDescription id="password-desc">
                    Use the password associated with your account.
                  </FieldDescription>
                )
              )}
            </Field>
          </FieldGroup>

          <div className="space-y-6">
            {/* Checkbox + forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keep-logged-in"
                  checked={keepLoggedIn}
                  disabled={isLoading}
                  onCheckedChange={(checked) =>
                    setKeepLoggedIn(checked === true)
                  }
                />
                <label
                  htmlFor="keep-logged-in"
                  className="text-sm cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </div>
              <div className="text-blue-700 hover:underline text-sm">
                <Link href="/forgot-password">forgot password?</Link>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className={`w-full h-1 rounded-full overflow-hidden bg-gray-100 transition-opacity duration-300 ${
                isLoading ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            >
              <div
                className="h-full bg-[#235FE7] rounded-full"
                style={{
                  width: `${progress}%`,
                  transition: "width 30ms linear",
                }}
              />
            </div>

            <Button
              className="cursor-pointer bg-[#235FE7] w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!canSubmit || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>{getLoadingLabel(progress)}</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {authError && <p className="text-xs text-red-500">{authError}</p>}

            <div className="text-center">
              <p className="text-[#747376] text-sm">
                Don&apos;t have an account yet?{" "}
                <span className="text-blue-700">
                  <Link href="/request-access">Request access</Link>
                </span>
              </p>
            </div>
          </div>
        </FieldSet>
      </main>
    </div>
  );
};

export default LoginFormPage;
