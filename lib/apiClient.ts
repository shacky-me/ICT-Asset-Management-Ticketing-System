import { AssetRegistrationFormData } from "@/types/assetRegistration";
import { NewTicketFormData } from "@/types/ticket";
import { readAuthToken } from "@/lib/session";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  staffNumber?: string;
  initials?: string;
};

type ApiUserRaw = Omit<ApiUser, "id"> & {
  id: string | number;
};

function resolveApiBaseUrl(): string {
  const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!rawBase) {
    return "http://localhost:5000/api";
  }

  const withoutTrailingSlash = rawBase.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

type ApiListResponse<T> = {
  totalCount: number;
  page: number;
  totalPages: number;
} & T;

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const authToken = readAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText) as { message?: string };
      throw new Error(
        parsed.message || `Request failed with status ${response.status}`,
      );
    } catch {
      throw new Error(
        errorText || `Request failed with status ${response.status}`,
      );
    }
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

type MeResponse = {
  user: ApiUser;
};

function normalizeApiUser(user: ApiUserRaw): ApiUser {
  return {
    ...user,
    id: String(user.id),
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiRequest<{ user: ApiUserRaw; token?: string }>(
    "/auth/login",
    {
      method: "POST",
      body: payload,
    },
  );

  return {
    ...response,
    user: normalizeApiUser(response.user),
  };
}

export async function logout() {
  if (!API_BASE_URL) return;

  await apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getAuthMe(): Promise<MeResponse> {
  const response = await apiRequest<{ user: ApiUserRaw }>("/auth/me", {
    method: "GET",
  });

  return {
    ...response,
    user: normalizeApiUser(response.user),
  };
}

type SubmitAccessRequestPayload = {
  fullName: string;
  staffNumber: string;
  jobTitle: string;
  email: string;
  department: string;
  role?: string;
  roleRequested?: "ICT_OFFICER" | "ICT_ADMIN";
  reason?: string;
};

type SubmitAccessRequestResponse = {
  message: string;
  requestId: number;
};

export type PendingAccessRequest = {
  id: number;
  fullName: string;
  staffNo: string;
  jobTitle: string;
  email: string;
  department: string;
  roleRequested: "ICT_OFFICER" | "ICT_ADMIN";
  reason: string;
  createdAt: string;
};

type PendingAccessRequestsResponse = {
  requests: PendingAccessRequest[];
};

export async function submitAccessRequest(
  payload: SubmitAccessRequestPayload,
): Promise<SubmitAccessRequestResponse> {
  return apiRequest<SubmitAccessRequestResponse>("/access-request", {
    method: "POST",
    body: payload,
  });
}

export async function getPendingAccessRequests(): Promise<
  PendingAccessRequest[]
> {
  const response = await apiRequest<PendingAccessRequestsResponse>(
    "/access-request/pending",
    {
      method: "GET",
    },
  );

  return response.requests;
}

export async function approveAccessRequest(requestId: number): Promise<void> {
  await apiRequest<{ message: string }>(
    `/access-request/${requestId}/approve`,
    {
      method: "POST",
    },
  );
}

type RegisterAssetResponse = {
  id: string;
  systemAssetId: string;
};

export type ApiAsset = {
  id: number;
  tagNo: string;
  systemAssetId?: string | null;
  category: string;
  make: string;
  model: string;
  serialNumber: string;
  status: string;
  createdAt: string;
  department?: { name: string };
};

export type ApiAssetStats = {
  total: number;
  assigned: number;
  inStore: number;
  maintenance: number;
};

export type ApiAssignment = {
  id: number;
  refNo: string;
  assignedTo: string;
  department?: { name: string };
  assignedAt: string;
  status: string;
  isOverdue: boolean;
  asset?: {
    id?: number;
    tagNo: string;
    model: string;
    category: string;
  };
};

export type ApiAssignmentStats = {
  active: number;
  thisMonth: number;
  returned: number;
  overdue: number;
};

export type ApiTicket = {
  id: string;
  issue: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  department: string;
  assignedTo: string;
  assetTag: string;
  status: "Open" | "In Progress" | "Pending" | "Resolved";
  created: string;
};

export type ApiTicketStats = {
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
};

export async function registerAsset(
  payload: AssetRegistrationFormData,
): Promise<RegisterAssetResponse> {
  return apiRequest<RegisterAssetResponse>("/assets", {
    method: "POST",
    body: payload,
  });
}

export async function getAssets(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiListResponse<{ assets: ApiAsset[] }>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<ApiListResponse<{ assets: ApiAsset[] }>>(
    `/assets${suffix}`,
  );
}

export async function getAssetStats(): Promise<ApiAssetStats> {
  return apiRequest<ApiAssetStats>("/assets/status");
}

export async function getAssignments(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiListResponse<{ assignments: ApiAssignment[] }>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<ApiListResponse<{ assignments: ApiAssignment[] }>>(
    `/assignments${suffix}`,
  );
}

export async function getAssignmentStats(): Promise<ApiAssignmentStats> {
  return apiRequest<ApiAssignmentStats>("/assignments/stats");
}

export async function createAssignment(payload: {
  assetId: number;
  assignedTo: string;
  payRollNo: string;
  dateOfAssignment: string;
  departmentId: number;
  floorLevel?: string;
  roomNumber?: string;
  accessories?: string;
  notes?: string;
  expectedReturnCondition?: string;
}): Promise<{ assignment: ApiAssignment }> {
  return apiRequest<{ assignment: ApiAssignment }>("/assignments", {
    method: "POST",
    body: payload,
  });
}

type CreateTicketResponse = {
  id: string;
};

export async function createTicket(
  payload: NewTicketFormData & { assignedTo: string | null },
) {
  return apiRequest<CreateTicketResponse>("/tickets", {
    method: "POST",
    body: payload,
  });
}

export async function getTickets(params?: {
  status?: string;
  search?: string;
}): Promise<{ tickets: ApiTicket[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<{ tickets: ApiTicket[] }>(`/tickets${suffix}`);
}

export async function getTicketStats(): Promise<ApiTicketStats> {
  return apiRequest<ApiTicketStats>("/tickets/stats");
}
