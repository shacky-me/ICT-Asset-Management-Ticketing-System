import { TransactionalEmailsClient } from "@getbrevo/brevo/transactionalEmails";
import type { SendTransacEmailRequest } from "@getbrevo/brevo/transactionalEmails";

const client = new TransactionalEmailsClient({
  apiKey: process.env.BREVO_API_KEY || "",
});

const FROM_EMAIL = process.env.EMAIL_FROM?.trim() || "naomimbugua536@gmail.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME?.trim() || "IT Asset System";
const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";

// ─── Core send helper ────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string): Promise<void> {
  if (process.env.EMAIL_DEV_LOG_ONLY === "true") {
    console.log("\n=== EMAIL (LOG-ONLY MODE - NOT ACTUALLY SENT) ===");
    console.log("TO:", to);
    console.log("FROM:", FROM_EMAIL);
    console.log("SUBJECT:", subject);
    console.log("HTML:", html);
    console.log("=================================================\n");
    return;
  }

  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in your environment variables.");
  }

  const payload: SendTransacEmailRequest = {
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const result = await client.sendTransacEmail(payload);
  console.log(`[EMAIL] ✅ Sent to ${to} | messageId: ${result.messageId ?? "ok"}`);
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

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
  adminEmail: string;
  adminName: string;
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

// ─── Email functions ─────────────────────────────────────────────────────────

export const sendAccessEmail = async ({
  to,
  name,
  tempPassword,
}: AccessEmail): Promise<void> => {
  try {
    await send(
      to,
      "Your IT Asset System Access",
      `<h2>Hello ${name}</h2>
       <p>Your account has been approved and created.</p>
       <p><b>Temporary Password:</b> ${tempPassword}</p>
       <p>You will be asked to change your password on first login.</p>
       <p><a href="${FRONTEND_URL}/login">Login Here</a></p>`,
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error sending access email to", to, ":", error);
  }
};

export const sendAdminBootstrapEmail = async ({
  to,
  name,
  tempPassword,
}: AdminBootstrapEmail): Promise<void> => {
  try {
    await send(
      to,
      "Admin Access Created - IT Asset System",
      `<h2>Hello ${name}</h2>
       <p>Your admin account has been created so you can review and approve access requests.</p>
       <p><b>Email:</b> ${to}</p>
       <p><b>Temporary Password:</b> ${tempPassword}</p>
       <p><a href="${FRONTEND_URL}/login">Log In to Dashboard</a></p>`,
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error sending admin bootstrap email to", to, ":", error);
  }
};

export const notifyAdmin = async ({
  adminEmail,
  adminName,
  fullName,
  email,
  department,
  role,
  reason,
}: AdminNotification): Promise<void> => {
  console.log(`[EMAIL] Notifying admin ${adminName} at ${adminEmail}`);
  await send(
    adminEmail,
    "New Access Request Pending",
    `<h2>Hello ${adminName}</h2>
     <h3>New Access Request</h3>
     <p><b>User:</b> ${fullName}</p>
     <p><b>Email:</b> ${email}</p>
     <p><b>Department:</b> ${department}</p>
     <p><b>Role Requested:</b> ${role}</p>
     <p><b>Reason:</b> ${reason || "No reason provided"}</p>
     <p>Please log in to the system to approve or reject this request.</p>
     <p><a href="${FRONTEND_URL}/login">Go to Dashboard</a></p>`,
  );
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}: PasswordResetEmail): Promise<void> => {
  try {
    await send(
      to,
      "Reset your IT Asset System password",
      `<h2>Hello ${name}</h2>
       <p>We received a request to reset your password.</p>
       <p><a href="${resetUrl}">Reset Password</a></p>
       <p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`,
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error sending password reset email to", to, ":", error);
  }
};

export const sendAccessRejectedEmail = async ({
  to,
  name,
  reason,
}: AccessRejectedEmail): Promise<void> => {
  try {
    await send(
      to,
      "IT Asset System Access Request Update",
      `<h2>Hello ${name}</h2>
       <p>Your access request was not approved at this time.</p>
       <p><b>Reason:</b> ${reason || "No reason was provided."}</p>
       <p>If you need assistance, please contact your administrator.</p>`,
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error sending rejection email to", to, ":", error);
  }
};

export const sendTicketAcknowledgementEmail = async ({
  to,
  name,
  ticketId,
  issue,
  department,
  assignedTo,
}: TicketAcknowledgementEmail): Promise<void> => {
  try {
    await send(
      to,
      `Ticket ${ticketId} Received`,
      `<h2>Hello ${name}</h2>
       <p>Your ticket has been received by the ICT support team.</p>
       <p>An ICT Officer or ICT Administrator will review the issue and attend to you.</p>
       <p><b>Ticket ID:</b> ${ticketId}</p>
       <p><b>Issue:</b> ${issue}</p>
       <p><b>Department:</b> ${department}</p>
       <p><b>Assigned To:</b> ${assignedTo}</p>
       <p>You can keep using the system while the issue is being handled.</p>`,
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error sending ticket acknowledgement email to", to, ":", error);
  }
};