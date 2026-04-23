export interface CreateAccessRequestBody {
  fullName: string;
  staffNo?: string;
  staffNumber?: string;
  jobTitle: string;
  email: string;
  departmentId?: number;
  department?: string;
  roleRequested?: "END_USER" | "SUPERVISOR" | "ICT_OFFICER" | "ICT_ADMIN";
  role?: string;
  reason?: string;
}
