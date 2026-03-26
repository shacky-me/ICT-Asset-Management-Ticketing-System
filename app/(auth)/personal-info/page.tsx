import Image from "next/image";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import Logo from "@/app/assets/Logo.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const PersonalInformation = () => {
  return (
    <div className="fixed top-[-45] left-0 right-0">
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
            <Progress value={0} />
          </div>
          <FieldGroup className="flex flex-col gap-5">
            {/* Full Name */}
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                className="text-sm"
                id="name"
                autoComplete="on"
                placeholder="e.g. Ongengu Brian"
              />
            </Field>
            {/* Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Field>
                  <FieldLabel htmlFor="payroll">Payroll / Staff No.</FieldLabel>
                  <Input
                    className="text-sm"
                    id="payroll"
                    autoComplete="on"
                    placeholder="e.g. 10045782"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field>
                  <FieldLabel htmlFor="job-title">Job title</FieldLabel>
                  <Input
                    className="text-sm"
                    id="job-title"
                    autoComplete="on"
                    placeholder="e.g. Software Engineer"
                  />
                </Field>
              </div>
            </div>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Official email address</FieldLabel>
              <Input
                className="text-sm"
                id="email"
                type="email"
                autoComplete="on"
                placeholder="e.g. brian.ongengu@ag.go.ke"
              />
            </Field>
            {/* Department */}
            <Field>
              <FieldLabel htmlFor="department">Department</FieldLabel>
              <Input
                className="text-sm"
                id="department"
                autoComplete="on"
                placeholder="e.g. Information Technology"
              />
            </Field>
          </FieldGroup>
          {/* CTA */}
          <div className="w-full">
            <Link href="/access-details">
              <Button className="cursor-pointer bg-[#235FE7] w-fit font-bold">
                Continue →
              </Button>
            </Link>
          </div>
          {/* Return to login if you already have credentials */}
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
  );
};
export default PersonalInformation;
