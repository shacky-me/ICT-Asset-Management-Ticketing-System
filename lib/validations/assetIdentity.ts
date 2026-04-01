import { z } from "zod";
import {
  ASSET_CATEGORIES,
  PHYSICAL_CONDITIONS,
} from "@/types/assetRegistration";

const categoryOptions = Object.keys(ASSET_CATEGORIES);
const physicalConditionOptions = new Set(PHYSICAL_CONDITIONS);

const optionalTrimmed = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .or(z.literal(""));

export const AssetIdentificationSchema = z
  .object({
    assetTagNumber: z
      .string()
      .trim()
      .min(2, "Asset tag number is required")
      .max(64, "Asset tag number is too long"),
    systemAssetId: z
      .string()
      .trim()
      .regex(/^ICT-\d{4}-\d{4}$/, "System asset ID format is invalid"),
    category: z
      .string()
      .trim()
      .min(1, "Please select a category")
      .refine((value) => categoryOptions.includes(value), {
        message: "Please select a valid category",
      }),
    subCategory: optionalTrimmed,
    assetDescription: optionalTrimmed,
    make: z.string().trim().min(2, "Make / Brand is required"),
    model: z.string().trim().min(2, "Model is required"),
    physicalCondition: z
      .string()
      .trim()
      .min(1, "Please select a physical condition")
      .refine((value) => physicalConditionOptions.has(value), {
        message: "Please select a valid physical condition",
      }),
    serialNumber: z.string().trim().min(2, "Serial number is required"),
    macAddress: optionalTrimmed.refine(
      (value) => {
        if (!value) return true;
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value);
      },
      { message: "Enter a valid MAC address" },
    ),
    imeiNumber: optionalTrimmed.refine(
      (value) => {
        if (!value) return true;
        return /^\d{15}$/.test(value);
      },
      { message: "IMEI must be 15 digits" },
    ),
    colour: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (!data.category) return;

    const validSubCategories = ASSET_CATEGORIES[data.category] ?? [];

    if (data.subCategory && !validSubCategories.includes(data.subCategory)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subCategory"],
        message: "Please select a valid sub-category for the chosen category",
      });
    }
  });

export const AssetIdentitySchema = AssetIdentificationSchema;

export type AssetIdentificationInput = z.input<
  typeof AssetIdentificationSchema
>;
export type AssetIdentificationData = z.infer<typeof AssetIdentificationSchema>;
