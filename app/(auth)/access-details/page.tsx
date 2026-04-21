"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FieldSet, Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/assets/Logo.svg";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AccessDetailsSchema } from "@/lib/validations/auth";
import { useRouter } from "next/dist/client/components/navigation";

const AccessDetails = () => {
  const [formData, setFormData] = useState({
    role: "",
    reason: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const saved = localStorage.getItem("accessDetails");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("accessDetails", JSON.stringify(formData));
  }, [formData]);

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, reason: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = AccessDetailsSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    // localStorage.removeItem("accessDetails");
    router.push("/review-and-submit");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-lg mx-auto my-16">
        <div className="bg-[#fefefe] h-[80vh] flex flex-col border border-gray-200 rounded-lg shadow-lg shadow-gray-200">
          {/* Sticky top — logo + progress */}
          <div className="flex flex-col items-center gap-4 px-16 pt-6 pb-4 border-b border-gray-100">
            <Image src={Logo} alt="Logo" className="h-8 w-60" />
            <div className="w-full space-y-2">
              <h1 className="font-bold">Request Access</h1>
              <p className="text-sm text-gray-700">
                Step 2 of 3 •{" "}
                <span className="font-semibold">Access Details</span>
              </p>
              <Progress value={80} className="[&>div]:bg-[#2B66E6]" />
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-16 py-6">
            <FieldSet className="space-y-6">
              {/* Access Role Requested */}
              <div>
                <h1 className="font-semibold">Access Role Requested</h1>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>
                )}
              </div>

              <RadioGroup
                value={formData.role}
                onValueChange={handleRoleChange}
                className="space-y-4"
              >
                {/* Staff */}
                <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                  <RadioGroupItem
                    value="staff"
                    id="option-one"
                    className="absolute top-5 left-2"
                  />
                  <CardHeader>
                    <CardAction>
                      <Badge
                        variant="secondary"
                        className="text-[#235FE7] bg-[#8BA6EC]/48"
                      >
                        Staff
                      </Badge>
                    </CardAction>
                    <CardTitle>
                      End User -{" "}
                      <span className="text-gray-700">All Departments</span>
                    </CardTitle>
                    <CardDescription>
                      Submit ICT support tickets and track the status of your
                      own requests.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Supervisor */}
                <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                  <RadioGroupItem
                    value="supervisor"
                    id="option-two"
                    className="absolute top-5 left-2"
                  />
                  <CardHeader>
                    <CardAction>
                      <Badge
                        variant="secondary"
                        className="text-[#875AC3] bg-[#E6D5F8]/48"
                      >
                        Supervisor
                      </Badge>
                    </CardAction>
                    <CardTitle>Supervisor / HOD</CardTitle>
                    <CardDescription>
                      View and monitor tickets raised by your team.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* ICT Officer */}
                <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                  <RadioGroupItem
                    value="officer"
                    id="option-three"
                    className="absolute top-5 left-2"
                  />
                  <CardHeader>
                    <CardAction>
                      <Badge
                        variant="secondary"
                        className="text-[#039b27] bg-[#D4EDDA]"
                      >
                        ICT Officer
                      </Badge>
                    </CardAction>
                    <CardTitle>ICT Officer</CardTitle>
                    <CardDescription>
                      View, action, and resolve support tickets.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* ICT Administrator */}
                <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                  <RadioGroupItem
                    value="administrator"
                    id="option-four"
                    className="absolute top-5 left-2"
                  />
                  <CardHeader>
                    <CardAction>
                      <Badge
                        variant="secondary"
                        className="text-[#B66231] bg-[#FFF3CD]"
                      >
                        ICT Administrator
                      </Badge>
                    </CardAction>
                    <CardTitle>ICT Administrator</CardTitle>
                    <CardDescription>
                      View, action, and resolve support tickets.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </RadioGroup>

              {/* Textarea */}
              <Field>
                <FieldLabel
                  htmlFor="textarea-message"
                  className="font-bold text-[#65656d]"
                >
                  REASON FOR ACCESS (Optional)
                </FieldLabel>
                <Textarea
                  id="textarea-message"
                  placeholder="Explain briefly why you need access..."
                  className="text-sm text-justify"
                  value={formData.reason}
                  onChange={handleReasonChange}
                />
              </Field>

              {/* CTA */}
              <div className="w-full flex items-center justify-between">
                <Link href="/personal-info">
                  <Button
                    variant="outline"
                    className="cursor-pointer w-fit font-bold"
                  >
                    ← Go Back
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer bg-[#235FE7] w-fit font-bold"
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

              {/* Sign in */}
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
      </div>
    </form>
  );
};

export default AccessDetails;
