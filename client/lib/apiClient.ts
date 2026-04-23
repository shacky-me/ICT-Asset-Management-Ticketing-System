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
  mustChangePassword?: boolean;
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
    mustChangePassword: Boolean(user.mustChangePassword),
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

export async function changeTemporaryPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<MeResponse> {
  const response = await apiRequest<{ user: ApiUserRaw }>(
    "/auth/change-temporary-password",
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

export async function requestPasswordReset(payload: {
  email: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export async function resetPasswordWithToken(payload: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
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

export async function rejectAccessRequest(
  requestId: number,
  reason?: string,
): Promise<void> {
  await apiRequest<{ message: string }>(`/access-request/${requestId}/reject`, {
    method: "POST",
    body: { reason: reason || "" },
  });
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
  procurement?: {
    warrantyEnd?: string | null;
    warrantyType?: string | null;
  } | null;
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
  const flatPayload = {
    tagNo: payload.step1.assetTagNumber.trim(),
    systemAssetId: payload.step1.systemAssetId.trim(),
    category: payload.step1.category.trim(),
    subCategory: payload.step1.subCategory.trim(),
    assetDescription: payload.step1.assetDescription.trim(),
    make: payload.step1.make.trim(),
    model: payload.step1.model.trim(),
    physicalCondition: payload.step1.physicalCondition.trim(),
    serialNumber: payload.step1.serialNumber.trim(),
    macAddress: payload.step1.macAddress.trim(),
    imeiNumber: payload.step1.imeiNumber.trim(),
    color: payload.step1.colour.trim(),
    processorCpu: payload.step2.processorCpu.trim(),
    ramMemory: payload.step2.ramMemory.trim(),
    primaryStorage: payload.step2.primaryStorage.trim(),
    screenDisplaySize: payload.step2.screenDisplaySize.trim(),
    powerRating: payload.step2.powerRating.trim(),
    colourFinish: payload.step2.colourFinish.trim(),
    operatingSystem: payload.step2.operatingSystem.trim(),
    osVersionBuildNumber: payload.step2.osVersionBuildNumber.trim(),
    ipAddress: payload.step2.ipAddress.trim(),
    hostnameComputerName: payload.step2.hostnameComputerName.trim(),
    procurementDate: payload.step3.procurementDate.trim(),
    supplierVendor: payload.step3.supplierVendor.trim(),
    fundingSource: payload.step3.fundingSource.trim(),
    invoiceNumber: payload.step3.invoiceNumber.trim(),
    lpoOrderNumber: payload.step3.lpoOrderNumber.trim(),
    purchasePrice: payload.step3.purchasePrice.trim(),
    grantProjectReference: payload.step3.grantProjectReference.trim(),
    warrantyStartDate: payload.step3.warrantyStartDate.trim(),
    warrantyEndDate: payload.step3.warrantyEndDate.trim(),
    warrantyType: payload.step3.warrantyType.trim(),
    warrantyProvider: payload.step3.warrantyProvider.trim(),
    warrantyContactReference: payload.step3.warrantyContactReference.trim(),
    insurancePolicyNumber: payload.step3.insurancePolicyNumber.trim(),
    insuranceExpiryDate: payload.step3.insuranceExpiryDate.trim(),
    department: payload.step4.department.trim(),
    buildingSite: payload.step4.buildingSite.trim(),
    floorLevel: payload.step4.floorLevel.trim(),
    roomOfficeNumber: payload.step4.roomOfficeNumber.trim(),
    accessoriesIncluded: payload.step4.accessoriesIncluded.trim(),
    additionalNotes: payload.step4.additionalNotes.trim(),
    scheduledDisposalDate: payload.step4.scheduledDisposalDate.trim(),
    plannedDisposalMethod: payload.step4.plannedDisposalMethod.trim(),
  };

  return apiRequest<RegisterAssetResponse>("/assets", {
    method: "POST",
    body: flatPayload,
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

export async function deleteAsset(
  assetId: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/assets/${assetId}`, {
    method: "DELETE",
  });
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

export async function updateAssignment(
  id: number,
  payload: Partial<{
    assignedTo: string;
    payRollNo: string;
    departmentId: number;
    floorLevel: string;
    roomNumber: string;
    accessories: string;
    notes: string;
    expectedReturnCondition: string;
  }>,
): Promise<{ assignment: ApiAssignment }> {
  return apiRequest<{ assignment: ApiAssignment }>(`/assignments/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAssignment(
  id: number,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/assignments/${id}`, {
    method: "DELETE",
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

// User Management (Admin only)
export type ApiSystemUser = {
  id: number;
  fullName: string;
  email: string;
  staffNo: string;
  role: string;
  jobTitle: string;
  department: { name: string };
  createdAt: string;
};

export async function getAllUsers(): Promise<{
  totalCount: number;
  users: ApiSystemUser[];
}> {
  return apiRequest<{ totalCount: number; users: ApiSystemUser[] }>(
    "/auth/users",
  );
}

export async function updateUserRole(
  userId: number,
  role: string,
): Promise<{
  message: string;
  user: ApiSystemUser;
}> {
  return apiRequest<{ message: string; user: ApiSystemUser }>(
    "/auth/users/" + userId + "/role",
    {
      method: "PATCH",
      body: { userId, role },
    },
  );
}
