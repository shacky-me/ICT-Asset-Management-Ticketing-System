export interface CreateAccessRequestBody {
    fullName: string;
    staffNo?: string;
    staffNumber?: string;
    jobTitle: string;
    email: string;
    departmentId?: number;
    department?: string;
    roleRequested?: "ICT_OFFICER" | "ICT_ADMIN";
    role?: string;
    reason?: string;
}
//# sourceMappingURL=access.Request.types.d.ts.map