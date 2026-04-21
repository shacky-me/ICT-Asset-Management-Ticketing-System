interface AccessEmail {
    to: string;
    name: string;
    tempPassword: string;
}
interface AdminBootstrapEmail {
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
interface PasswordResetEmail {
    to: string;
    name: string;
    resetUrl: string;
}
interface AccessRejectedEmail {
    to: string;
    name: string;
    reason?: string;
}
export declare const sendAccessEmail: ({ to, name, tempPassword, }: AccessEmail) => Promise<void>;
export declare const sendAdminBootstrapEmail: ({ to, name, tempPassword, }: AdminBootstrapEmail) => Promise<void>;
export declare const notifyAdmin: ({ fullName, email, department, role, reason, }: AdminNotification) => Promise<void>;
export declare const sendPasswordResetEmail: ({ to, name, resetUrl, }: PasswordResetEmail) => Promise<void>;
export declare const sendAccessRejectedEmail: ({ to, name, reason, }: AccessRejectedEmail) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map