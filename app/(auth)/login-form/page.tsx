"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Eye } from "lucide-react";
import Logo from "@/app/assets/Logo.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LoginFormPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear form
      setFormData({ username: "", password: "" });

      // Redirect to dashboard or home
      router.push("/");
    }
  };

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

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  Email Address / Username
                </FieldLabel>
                <Input
                  className="text-sm"
                  id="username"
                  type="text"
                  placeholder="e.g. Peter Parker"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
                <FieldDescription>
                  Use your email or username to sign in.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                  <Eye
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                <FieldDescription>
                  Use the password associated with your account.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox disabled={isLoading} />{" "}
                  <p className="text-sm">Keep me logged in</p>
                </div>
                <div className="text-blue-700 hover:underline text-sm">
                  <Link href="/forgot-password">forgot password?</Link>
                </div>
              </div>

              <Button
                type="submit"
                className="cursor-pointer bg-[#235FE7] w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <p className="text-[#747376] text-sm">
                  Don&apos;t have an account yet?{" "}
                  <span className="text-blue-700">
                    <Link href="/request-access">Request access</Link>
                  </span>
                </p>
              </div>
            </div>
          </form>
        </FieldSet>
      </main>
    </div>
  );
};

export default LoginFormPage;
