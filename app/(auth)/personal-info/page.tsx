"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import Logo from "@/app/assets/Logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PersonalInfoSchema } from "@/lib/validations/auth";
import Link from "next/link";
import { useRouter } from "next/dist/client/components/navigation";

// ✅ Single source of truth for the storage key
// ReviewAndSubmit reads from this same key
const STORAGE_KEY = "request_access_step1";

const DEFAULT_FORM = {
  fullName: "",
  staffNumber: "",
  jobTitle: "",
  email: "",
  department: "",
};

const PersonalInformation = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formValues, setFormValues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_FORM, ...parsed };
      }
    } catch {
      // localStorage unavailable — fail silently
    }
    return DEFAULT_FORM;
  });

  // Persist to localStorage on every change
  function handleFieldChange(field: keyof typeof DEFAULT_FORM, value: string) {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // fail silently
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      fullName: formValues.fullName,
      staffNumber: formValues.staffNumber,
      jobTitle: formValues.jobTitle,
      email: formValues.email,
      department: formValues.department,
    };

    const result = PersonalInfoSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    //  Do NOT clear localStorage here — review page still needs it
    setErrors({});
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    router.push("/access-details");
  };

  return (
    <form action="" onSubmit={handleSubmit}>
      <div className="fixed top-[-45] left-0 right-0 overflow-y-auto max-h-screen">
        <div className="bg-[#fefefe] w-lg h-fit mx-auto my-16 px-16 py-6 border border-gray-200 rounded-lg space-y-8 shadow-lg shadow-gray-200">
          <div className="flex flex-col justify-center items-center">
            <Image src={Logo} alt="Logo" className="h-8 w-60" />
          </div>
          <FieldSet className=" ">
            <div className="space-y-2">
              <h1 className="font-bold">Request Access</h1>
              <p className="text-sm text-gray-700">
                Step 1 of 3 •{" "}
                <span className="font-semibold">Personal Information</span>
              </p>
              <Progress value={33} className="transition-all duration-500" />
            </div>
            <FieldGroup className="flex flex-col gap-5">
              {/* Full Name */}
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input
                  name="fullName"
                  id="name"
                  placeholder="e.g. Ongengu Brian"
                  disabled={isLoading}
                  value={formValues.fullName}
                  onChange={(e) =>
                    handleFieldChange("fullName", e.target.value)
                  }
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName[0]}</p>
                )}
              </Field>
              {/* Row */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Field>
                    <FieldLabel htmlFor="payroll">
                      Payroll / Staff No.
                    </FieldLabel>
                    <Input
                      name="staffNumber"
                      id="payroll"
                      placeholder="e.g. 10045782"
                      disabled={isLoading}
                      value={formValues.staffNumber}
                      onChange={(e) =>
                        handleFieldChange("staffNumber", e.target.value)
                      }
                    />
                    {errors.staffNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.staffNumber[0]}
                      </p>
                    )}
                  </Field>
                </div>
                <div className="flex-1">
                  <Field>
                    <FieldLabel htmlFor="job-title">Job title</FieldLabel>
                    <Input
                      name="jobTitle"
                      id="job-title"
                      placeholder="e.g. Software Engineer"
                      disabled={isLoading}
                      value={formValues.jobTitle}
                      onChange={(e) =>
                        handleFieldChange("jobTitle", e.target.value)
                      }
                    />
                    {errors.jobTitle && (
                      <p className="text-red-500 text-sm">
                        {errors.jobTitle[0]}
                      </p>
                    )}
                  </Field>
                </div>
              </div>
              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Official email address</FieldLabel>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="e.g. brian.ongengu@ag.go.ke"
                  disabled={isLoading}
                  value={formValues.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email[0]}</p>
                )}
              </Field>
              {/* Department */}
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Input
                  name="department"
                  id="department"
                  placeholder="e.g. Information Technology"
                  disabled={isLoading}
                  value={formValues.department}
                  onChange={(e) =>
                    handleFieldChange("department", e.target.value)
                  }
                />
                {errors.department && (
                  <p className="text-red-500 text-sm">{errors.department[0]}</p>
                )}
              </Field>
            </FieldGroup>
            {/* CTA */}
            <div className="w-full">
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer bg-[#235FE7] w-fit font-bold disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  "Continue →"
                )}
              </Button>
            </div>
            {/* Return to login */}
            <div className="text-center">
              <p className="text-[#747376] text-sm">
                Already have an account?{" "}
                <span className="text-blue-700">
                  <Link href="/login">Sign in</Link>
                </span>
              </p>
            </div>
          </FieldSet>
        </div>
      </div>
    </form>
  );
};

export default PersonalInformation;
