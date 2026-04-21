import nodemailer from "nodemailer";
function resolveSmtpUser() {
    return (process.env.EMAIL_USER?.trim() || process.env.ADMIN_EMAIL?.trim() || "");
}
function resolveSmtpPass() {
    return process.env.EMAIL_PASS?.trim() || "";
}
function createTransporter() {
    const logOnly = process.env.EMAIL_DEV_LOG_ONLY === "true";
    if (logOnly) {
        return {
            sendMail: async (mailOptions) => {
                console.log("\n=== EMAIL (LOG-ONLY MODE - NOT ACTUALLY SENT) ===");
                console.log("TO:", mailOptions.to);
                console.log("FROM:", mailOptions.from);
                console.log("SUBJECT:", mailOptions.subject);
                console.log("HTML:", mailOptions.html);
                console.log("============================================\n");
                return {
                    messageId: "log-only-" + Date.now(),
                    response: "Log-only mode - email logged",
                };
            },
        };
    }
    const smtpUser = resolveSmtpUser();
    const smtpPass = resolveSmtpPass();
    if (!smtpUser || !smtpPass) {
        throw new Error("Email SMTP is not configured. Set EMAIL_USER and EMAIL_PASS in server/.env.");
    }
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });
}
function resolveAdminRecipient() {
    return (process.env.ADMIN_EMAIL?.trim() ||
        process.env.EMAIL_USER?.trim() ||
        "naomimbugua536@gmail.com");
}
export const sendAccessEmail = async ({ to, name, tempPassword, }) => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
        const loginUrl = `${frontendUrl}/login`;
        const fromAddress = resolveSmtpUser();
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject: "Your IT Asset System Access",
            html: `<h2>Hello ${name}</h2>
             <p>Your account has been created.</p>
             <p><b>Use this Temporary Password:</b> ${tempPassword}</p>
             <p><a href="${loginUrl}">Login Here</a></p>`,
        });
        console.log("Email sent:", info.response);
    }
    catch (error) {
        console.error("Error sending access email:", error);
    }
};
export const sendAdminBootstrapEmail = async ({ to, name, tempPassword, }) => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
        const loginUrl = `${frontendUrl}/login`;
        const fromAddress = resolveSmtpUser();
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject: "Admin Access Created - IT Asset System",
            html: `<h2>Hello ${name}</h2>
             <p>Your admin account has been created so you can review and approve access requests.</p>
             <p><b>Email:</b> ${to}</p>
             <p><b>Temporary Password:</b> ${tempPassword}</p>
             <p><a href="${loginUrl}">Log In to Dashboard</a></p>`,
        });
        console.log("Admin bootstrap email sent:", info.response);
    }
    catch (error) {
        console.error("Error sending admin bootstrap email:", error);
    }
};
export const notifyAdmin = async ({ fullName, email, department, role, reason, }) => {
    const transporter = createTransporter();
    const recipient = resolveAdminRecipient();
    const fromAddress = resolveSmtpUser();
    const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
    const pendingUrl = `${frontendUrl}/login`;
    console.log(`[EMAIL] Sending admin notification from ${fromAddress} to ${recipient}`);
    const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject: "New Access Request Pending",
        html: `<h2>New Access Request</h2>
           <p><b>User:</b> ${fullName}</p>
           <p><b>Email:</b> ${email}</p>
           <p><b>Department:</b> ${department}</p>
           <p><b>Role Requested:</b> ${role}</p>
           <p><b>Reason:</b> ${reason || "No reason provided"}</p>
           <p>Please log in to the system to approve this request.</p>
           <p><a href="${pendingUrl}">Go to Login</a></p>`,
    });
    console.log("Admin notification sent:", info.response);
};
//# sourceMappingURL=emailService.js.map