export interface CreateAccessRequestBody {
  fullName: string;
  staffNo?: string;
  staffNumber?: string;
  jobTitle: string;
  email: string;
  departmentId?: number;
  department?: string;
  roleRequested?: "END_USER" | "HOD" | "ICT_OFFICER" | "ICT_ADMIN" | "PS" | "DIRECTOR" | "ASSISTANT_DIRECTOR";
  role?: string;
  reason?: string;
}
