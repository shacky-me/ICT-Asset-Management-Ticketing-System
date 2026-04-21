interface AccessEmail {
    to: string;
    name: string;
    tempPassword: string;
}
interface AdminNotification {
    fullName: string;
    email: string;
    department: string;
    role: string;
    reason?: string;
}
export declare const sendAccessEmail: ({ to, name, tempPassword, }: AccessEmail) => Promise<void>;
export declare const notifyAdmin: ({ fullName, email, department, role, reason, }: AdminNotification) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map