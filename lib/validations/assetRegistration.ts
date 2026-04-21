import { z } from "zod";
import {
  BUILDINGS,
  DEPARTMENTS,
  DISPOSAL_METHODS,
  FUNDING_SOURCES,
  OPERATING_SYSTEMS,
  WARRANTY_TYPES,
} from "@/types/assetRegistration";
import { AssetIdentificationSchema } from "@/lib/validations/assetIdentity";

const optionalTrimmed = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .or(z.literal(""));

const isValidDateString = (value: string) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const operatingSystems = new Set(OPERATING_SYSTEMS);
const fundingSources = new Set(FUNDING_SOURCES);
const warrantyTypes = new Set(WARRANTY_TYPES);
const departments = new Set(DEPARTMENTS);
const buildings = new Set(BUILDINGS);
const disposalMethods = new Set(DISPOSAL_METHODS);

export const AssetHardwareSpecsSchema = z.object({
  processorCpu: optionalTrimmed,
  ramMemory: optionalTrimmed,
  primaryStorage: optionalTrimmed,
  screenDisplaySize: optionalTrimmed,
  powerRating: optionalTrimmed,
  colourFinish: optionalTrimmed,
  operatingSystem: optionalTrimmed.refine(
    (value) => !value || operatingSystems.has(value),
    "Please select a valid operating system",
  ),
  osVersionBuildNumber: optionalTrimmed,
  ipAddress: optionalTrimmed.refine((value) => {
    if (!value) return true;
    return /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(
      value,
    );
  }, "Enter a valid IPv4 address"),
  hostnameComputerName: optionalTrimmed.refine((value) => {
    if (!value) return true;
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$/.test(value);
  }, "Hostname can only use letters, numbers, and hyphens"),
});

export const AssetProcurementSchema = z
  .object({
    procurementDate: z
      .string()
      .min(1, "Procurement date is required")
      .refine(isValidDateString, "Enter a valid procurement date"),
    supplierVendor: optionalTrimmed,
    fundingSource: z
      .string()
      .trim()
      .min(1, "Funding source is required")
      .refine((value) => fundingSources.has(value), {
        message: "Please select a valid funding source",
      }),
    invoiceNumber: optionalTrimmed,
    lpoOrderNumber: optionalTrimmed,
    purchasePrice: optionalTrimmed.refine((value) => {
      if (!value) return true;
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    }, "Purchase price must be 0 or greater"),
    grantProjectReference: optionalTrimmed,
    warrantyStartDate: optionalTrimmed.refine(
      (value) => !value || isValidDateString(value),
      "Enter a valid warranty start date",
    ),
    warrantyEndDate: optionalTrimmed.refine(
      (value) => !value || isValidDateString(value),
      "Enter a valid warranty end date",
    ),
    warrantyType: optionalTrimmed.refine(
      (value) => !value || warrantyTypes.has(value),
      "Please select a valid warranty type",
    ),
    warrantyProvider: optionalTrimmed,
    warrantyContactReference: optionalTrimmed,
    insurancePolicyNumber: optionalTrimmed,
    insuranceExpiryDate: optionalTrimmed.refine(
      (value) => !value || isValidDateString(value),
      "Enter a valid insurance expiry date",
    ),
  })
  .superRefine((data, ctx) => {
    if (data.warrantyStartDate && !data.warrantyEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["warrantyEndDate"],
        message: "Warranty end date is required when start date is set",
      });
    }

    if (!data.warrantyStartDate && data.warrantyEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["warrantyStartDate"],
        message: "Warranty start date is required when end date is set",
      });
    }

    if (data.warrantyStartDate && data.warrantyEndDate) {
      const start = new Date(data.warrantyStartDate);
      const end = new Date(data.warrantyEndDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["warrantyEndDate"],
          message: "Warranty end date cannot be before start date",
        });
      }
    }
  });

export const AssetAssignmentSchema = z
  .object({
    department: optionalTrimmed.refine(
      (value) => !value || departments.has(value),
      "Please select a valid department",
    ),
    buildingSite: optionalTrimmed.refine(
      (value) => !value || buildings.has(value),
      "Please select a valid building",
    ),
    floorLevel: optionalTrimmed,
    roomOfficeNumber: optionalTrimmed,
    accessoriesIncluded: optionalTrimmed,
    additionalNotes: optionalTrimmed,
    scheduledDisposalDate: optionalTrimmed.refine(
      (value) => !value || isValidDateString(value),
      "Enter a valid scheduled disposal date",
    ),
    plannedDisposalMethod: z
      .string()
      .trim()
      .min(1, "Planned disposal method is required")
      .refine((value) => disposalMethods.has(value), {
        message: "Please select a valid disposal method",
      }),
  })
  .superRefine((data, ctx) => {
    if (
      data.plannedDisposalMethod !== "N/A — Asset still in use" &&
      !data.scheduledDisposalDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledDisposalDate"],
        message: "Provide a disposal date for the selected disposal method",
      });
    }
  });

export const AssetRegistrationSchema = z.object({
  step1: AssetIdentificationSchema,
  step2: AssetHardwareSpecsSchema,
  step3: AssetProcurementSchema,
  step4: AssetAssignmentSchema,
});
