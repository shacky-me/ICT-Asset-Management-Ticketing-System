import { z } from "zod";

// Validators

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  staffNumber: z
    .string()
    .min(2, "Payroll number must be at least 2 characters long"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department must be at least 2 characters"),
});

export const AccessDetailsSchema = z.object({
  role: z.string().min(2, "Please select a role"),
  reason: z.string().optional().or(z.literal("")),
});

// Schema for the data shown in AccessApprovedModal
export const AccessApprovedSchema = z.object({
  name: z.string().min(2, "Name is required"),
  payroll: z.string().min(2, "Payroll number is required"),
  reason: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Enter a valid email"),
});
