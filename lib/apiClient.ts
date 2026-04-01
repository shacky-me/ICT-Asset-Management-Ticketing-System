import { AssetRegistrationFormData } from "@/types/assetRegistration";
import { NewTicketFormData } from "@/types/ticket";
import { authenticateProvisionedAccount } from "@/lib/authAccounts";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  staffNumber?: string;
  initials: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

type LoginPayload = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

type LoginResponse = {
  user: ApiUser;
  token?: string;
};

function getInitials(nameOrEmail: string): string {
  const source = nameOrEmail.trim();
  if (!source) return "NA";

  if (source.includes("@")) {
    const local = source.split("@")[0] || "NA";
    const parts = local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .filter(Boolean);

    if (parts.length >= 2) return `${parts[0]}${parts[1]}`;
    return (parts[0] ?? "NA").slice(0, 2);
  }

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function fallbackNameFromIdentifier(identifier: string) {
  if (identifier.includes("@")) {
    return identifier.split("@")[0].replace(/[._-]/g, " ");
  }
  return identifier;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (API_BASE_URL) {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  }

  const provisioned = authenticateProvisionedAccount(
    payload.identifier,
    payload.password,
  );

  if (provisioned.status === "authenticated") {
    return { user: provisioned.user };
  }

  if (provisioned.status === "invalid_password") {
    throw new Error("Invalid credentials");
  }

  if (provisioned.status === "requires_password_reset") {
    throw new Error("Password reset required");
  }

  const name = fallbackNameFromIdentifier(payload.identifier)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  const email = payload.identifier.includes("@")
    ? payload.identifier
    : `${payload.identifier}@ag.go.ke`;

  return {
    user: {
      id: `usr-${Date.now()}`,
      name: name || "Current User",
      email,
      role: "ICT Officer",
      department: "ICT Department",
      initials: getInitials(name || email),
    },
  };
}

export async function logout() {
  if (!API_BASE_URL) return;

  await apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}

type RegisterAssetResponse = {
  id: string;
  systemAssetId: string;
};

export async function registerAsset(
  payload: AssetRegistrationFormData,
): Promise<RegisterAssetResponse> {
  if (API_BASE_URL) {
    return apiRequest<RegisterAssetResponse>("/assets", {
      method: "POST",
      body: payload,
    });
  }

  return {
    id: `asset-${Date.now()}`,
    systemAssetId: payload.step1.systemAssetId,
  };
}

type CreateTicketResponse = {
  id: string;
};

export async function createTicket(
  payload: NewTicketFormData & { assignedTo: string | null },
) {
  if (API_BASE_URL) {
    return apiRequest<CreateTicketResponse>("/tickets", {
      method: "POST",
      body: payload,
    });
  }

  return {
    id: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
  };
}
