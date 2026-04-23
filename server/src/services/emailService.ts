import nodemailer from "nodemailer";

function resolveSmtpUser(): string {
  return (
    process.env.EMAIL_USER?.trim() || process.env.ADMIN_EMAIL?.trim() || ""
  );
}

function resolveSmtpPass(): string {
  return process.env.EMAIL_PASS?.trim() || "";
}

function createTransporter() {
  const logOnly = process.env.EMAIL_DEV_LOG_ONLY === "true";
  if (logOnly) {
    return {
      sendMail: async (mailOptions: any) => {
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
    } as any;
  }

  const smtpUser = resolveSmtpUser();
  const smtpPass = resolveSmtpPass();

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "Email SMTP is not configured. Set EMAIL_USER and EMAIL_PASS in server/.env.",
    );
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

function resolveAdminRecipient(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    "naomimbugua536@gmail.com"
  );
}

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

interface TicketAcknowledgementEmail {
  to: string;
  name: string;
  ticketId: string;
  issue: string;
  department: string;
  assignedTo: string;
}

export const sendAccessEmail = async ({
  to,
  name,
  tempPassword,
}: AccessEmail) => {
  try {
    const transporter = createTransporter();
    const frontendUrl =
      process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
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
  } catch (error) {
    console.error("Error sending access email:", error);
  }
};

export const sendAdminBootstrapEmail = async ({
  to,
  name,
  tempPassword,
}: AdminBootstrapEmail) => {
  try {
    const transporter = createTransporter();
    const frontendUrl =
      process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
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
  } catch (error) {
    console.error("Error sending admin bootstrap email:", error);
  }
};

export const notifyAdmin = async ({
  fullName,
  email,
  department,
  role,
  reason,
}: AdminNotification) => {
  const transporter = createTransporter();
  const recipient = resolveAdminRecipient();
  const fromAddress = resolveSmtpUser();
  const frontendUrl =
    process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
  const pendingUrl = `${frontendUrl}/login`;

  console.log(
    `[EMAIL] Sending admin notification from ${fromAddress} to ${recipient}`,
  );

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

export const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}: PasswordResetEmail) => {
  const transporter = createTransporter();
  const fromAddress = resolveSmtpUser();

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: "Reset your IT Asset System password",
    html: `<h2>Hello ${name}</h2>
             <p>We received a request to reset your password.</p>
             <p><a href="${resetUrl}">Reset Password</a></p>
             <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`,
  });

  console.log("Password reset email sent:", info.response);
};

export const sendAccessRejectedEmail = async ({
  to,
  name,
  reason,
}: AccessRejectedEmail) => {
  try {
    const transporter = createTransporter();
    const fromAddress = resolveSmtpUser();

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: "IT Asset System Access Request Update",
      html: `<h2>Hello ${name}</h2>
             <p>Your access request was not approved at this time.</p>
             <p><b>Reason:</b> ${reason || "No reason was provided."}</p>
             <p>If you need assistance, please contact your administrator.</p>`,
    });

    console.log("Access rejection email sent:", info.response);
  } catch (error) {
    console.error("Error sending access rejection email:", error);
  }
};

export const sendTicketAcknowledgementEmail = async ({
  to,
  name,
  ticketId,
  issue,
  department,
  assignedTo,
}: TicketAcknowledgementEmail) => {
  try {
    const transporter = createTransporter();
    const fromAddress = resolveSmtpUser();

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Ticket ${ticketId} received`,
      html: `<h2>Hello ${name}</h2>
             <p>Your ticket has been received by the ICT support team.</p>
             <p>An ICT Officer or ICT Administrator will review the issue and attend to you.</p>
             <p><b>Ticket ID:</b> ${ticketId}</p>
             <p><b>Issue:</b> ${issue}</p>
             <p><b>Department:</b> ${department}</p>
             <p><b>Assigned To:</b> ${assignedTo}</p>
             <p>You can keep using the system while the issue is being handled.</p>`,
    });

    console.log("Ticket acknowledgment email sent:", info.response);
  } catch (error) {
    console.error("Error sending ticket acknowledgement email:", error);
  }
};
