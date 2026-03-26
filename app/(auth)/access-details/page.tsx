import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
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
import { Field, FieldLabel } from "@/components/ui/field";

const AccessDetails = () => {
  return (
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
            </div>

            <RadioGroup defaultValue="option-one" className="space-y-4">
              {/* End User */}
              <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                <RadioGroupItem
                  value="option-one"
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
                    Submit ICT support tickets and track the status of your own
                    requests. Suitable for all regular staff members
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Supervisor / HOD */}
              <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                <RadioGroupItem
                  value="option-two"
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
                    View and monitor tickets raised by your team. Can approve or
                    escalate requests on behalf of your department.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* ICT Officer */}
              <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                <RadioGroupItem
                  value="option-three"
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
                    View, action, and resolve support tickets. Can log
                    maintenance, track asset assignments, and generate reports.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* ICT Administrator */}
              <Card className="relative mx-auto w-full max-w-sm pt-4 px-4">
                <RadioGroupItem
                  value="option-four"
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
                    View, action, and resolve support tickets. Can log
                    maintenance, track asset assignments, and generate reports.
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
                REASON FOR ACCESS
              </FieldLabel>
              <Textarea
                className="text-sm text-justify"
                id="textarea-message"
                placeholder="Explain briefly why you need access to this system and what you intend to use it for."
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
              <Link href="/review-and-submit">
                <Button className="cursor-pointer bg-[#235FE7] w-fit font-bold">
                  Continue →
                </Button>
              </Link>
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
  );
};
export default AccessDetails;
