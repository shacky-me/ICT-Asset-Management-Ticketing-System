// ─── Enums & Constants ───────────────────────────────────────────────────────

export const ASSET_CATEGORIES: Record<string, string[]> = {
  "Computing Devices": ["Laptop", "Desktop", "Workstation", "Tablet", "Server"],
  "Networking Equipment": [
    "Router",
    "Switch",
    "Firewall",
    "Access Point",
    "Modem",
  ],
  "Peripherals & Accessories": [
    "Printer",
    "Scanner",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Webcam",
    "Headset",
  ],
  "Mobile Devices": ["Smartphone", "Feature Phone", "Mobile Hotspot"],
  "Power Equipment": ["UPS", "Generator", "Power Strip", "Voltage Stabiliser"],
  "AV Equipment": [
    "Projector",
    "Display Screen",
    "Video Conferencing Unit",
    "Speaker System",
  ],
  Storage: ["External HDD", "NAS Device", "Flash Drive", "Tape Drive"],
  "Security Equipment": [
    "CCTV Camera",
    "DVR/NVR",
    "Biometric Device",
    "Access Control Panel",
  ],
};

export const OPERATING_SYSTEMS = [
  "Windows 11",
  "Windows 10",
  "macOS Sequoia",
  "macOS Sonoma",
  "Ubuntu 24.04 LTS",
  "Ubuntu 22.04 LTS",
  "Fedora 40",
  "Debian 12",
  "Android 14",
  "iOS 17",
  "ChromeOS",
  "N/A",
];

export const PHYSICAL_CONDITIONS = ["New", "Good", "Fair", "Poor", "Damaged"];

export const WARRANTY_TYPES = [
  "Manufacturer Warranty",
  "Extended Warranty",
  "On-Site Service",
  "Return-to-Base",
  "No Warranty",
];

export const FUNDING_SOURCES = [
  "GoK Exchequer",
  "Development Partner",
  "Grant / Project Funds",
  "Donor Funded",
  "Own Revenue",
];

export const DISPOSAL_METHODS = [
  "N/A — Asset still in use",
  "E-Waste Disposal",
  "Public Auction",
  "Trade-In",
  "Donation",
  "Destruction",
];

export const DEPARTMENTS = [
  "ICT Department",
  "Finance Department",
  "Human Resources",
  "Legal Affairs",
  "Records Management",
  "Administration",
  "Director's Office",
  "Planning & Research",
  "Communications",
];

export const BUILDINGS = [
  "Teleposta Towers — Nairobi",
  "Jogoo House A",
  "Jogoo House B",
  "Regional Office — Mombasa",
  "Regional Office — Kisumu",
  "Regional Office — Nakuru",
];

// ─── Step Data Interfaces ─────────────────────────────────────────────────────

export interface Step1Data {
  assetTagNumber: string;
  systemAssetId: string;
  category: string;
  subCategory: string;
  assetDescription: string;
  // Hardware Identity
  make: string;
  model: string;
  physicalCondition: string;
  serialNumber: string;
  macAddress: string;
  imeiNumber: string;
  colour: string;
}

export interface Step2Data {
  // Computing Specs
  processorCpu: string;
  ramMemory: string;
  primaryStorage: string;
  screenDisplaySize: string;
  powerRating: string;
  colourFinish: string;
  // Software
  operatingSystem: string;
  osVersionBuildNumber: string;
  // Network
  ipAddress: string;
  hostnameComputerName: string;
}

export interface Step3Data {
  // Procurement
  procurementDate: string;
  supplierVendor: string;
  fundingSource: string;
  invoiceNumber: string;
  lpoOrderNumber: string;
  purchasePrice: string;
  grantProjectReference: string;
  // Warranty
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyType: string;
  warrantyProvider: string;
  warrantyContactReference: string;
  // Insurance
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
}

export interface Step4Data {
  // Location
  department: string;
  buildingSite: string;
  floorLevel: string;
  roomOfficeNumber: string;
  // User Assignment
  assignedTo: string;
  payrollStaffNumber: string;
  dateOfAssignment: string;
  // Accessories & Notes
  accessoriesIncluded: string;
  additionalNotes: string;
  // Disposal
  scheduledDisposalDate: string;
  plannedDisposalMethod: string;
}

export interface AssetRegistrationFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

// ─── Default / Initial Values ─────────────────────────────────────────────────

export const defaultStep1: Step1Data = {
  assetTagNumber: "",
  systemAssetId: generateSystemAssetId(),
  category: "",
  subCategory: "",
  assetDescription: "",
  make: "",
  model: "",
  physicalCondition: "New",
  serialNumber: "",
  macAddress: "",
  imeiNumber: "",
  colour: "",
};

export const defaultStep2: Step2Data = {
  processorCpu: "",
  ramMemory: "",
  primaryStorage: "",
  screenDisplaySize: "",
  powerRating: "",
  colourFinish: "",
  operatingSystem: "",
  osVersionBuildNumber: "",
  ipAddress: "",
  hostnameComputerName: "",
};

export const defaultStep3: Step3Data = {
  procurementDate: "",
  supplierVendor: "",
  fundingSource: "GoK Exchequer",
  invoiceNumber: "",
  lpoOrderNumber: "",
  purchasePrice: "",
  grantProjectReference: "",
  warrantyStartDate: "",
  warrantyEndDate: "",
  warrantyType: "",
  warrantyProvider: "",
  warrantyContactReference: "",
  insurancePolicyNumber: "",
  insuranceExpiryDate: "",
};

export const defaultStep4: Step4Data = {
  department: "",
  buildingSite: "",
  floorLevel: "",
  roomOfficeNumber: "",
  assignedTo: "",
  payrollStaffNumber: "",
  dateOfAssignment: "",
  accessoriesIncluded: "",
  additionalNotes: "",
  scheduledDisposalDate: "",
  plannedDisposalMethod: "N/A — Asset still in use",
};

export const defaultFormData: AssetRegistrationFormData = {
  step1: defaultStep1,
  step2: defaultStep2,
  step3: defaultStep3,
  step4: defaultStep4,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSystemAssetId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `ICT-${year}-${seq}`;
}

export function generateFreshSystemAssetId(): string {
  return generateSystemAssetId();
}

export const STEP_LABELS = [
  "Identification",
  "Hardware Specs",
  "Procurement",
  "Assignment",
];
