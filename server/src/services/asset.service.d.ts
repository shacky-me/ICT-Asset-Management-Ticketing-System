export declare const createAsset: (data: any, userId: number) => Promise<{
    model: string;
    id: number;
    departmentId: number;
    createdAt: Date;
    tagNo: string;
    systemAssetId: string | null;
    category: string;
    subCategory: string | null;
    assetDescription: string | null;
    make: string;
    physicalCondition: string | null;
    serialNumber: string;
    macAddress: string | null;
    imeiNumber: string | null;
    color: string | null;
    status: import("@prisma/client").$Enums.AssetStatus;
}>;
export declare const getAssetStats: () => Promise<{
    total: number;
    assigned: number;
    inStore: number;
    maintenance: number;
}>;
export declare const getAllAssets: (filters: any) => Promise<{
    assets: ({
        department: {
            name: string;
        };
    } & {
        model: string;
        id: number;
        departmentId: number;
        createdAt: Date;
        tagNo: string;
        systemAssetId: string | null;
        category: string;
        subCategory: string | null;
        assetDescription: string | null;
        make: string;
        physicalCondition: string | null;
        serialNumber: string;
        macAddress: string | null;
        imeiNumber: string | null;
        color: string | null;
        status: import("@prisma/client").$Enums.AssetStatus;
    })[];
    totalCount: number;
    page: any;
    totalPages: number;
}>;
export declare const getAssetById: (id: number) => Promise<{
    department: {
        name: string;
    };
    _count: {
        assignment: number;
    };
    hardwareSpec: {
        id: number;
        color: string | null;
        assetId: number;
        processor: string | null;
        ram: string | null;
        storage: string | null;
        screenSize: string | null;
        powerRating: string | null;
        operatingSystem: string | null;
        osVersion: string | null;
        ipAddress: string | null;
        hostName: string | null;
    } | null;
    procurement: {
        id: number;
        assetId: number;
        procurementDate: Date;
        supplierVendor: string;
        fundingSource: string | null;
        invoiceNumber: string | null;
        iopNumber: string | null;
        purchasePriceKES: number | null;
        warrantyStart: Date | null;
        warrantyEnd: Date | null;
        warrantyType: string | null;
        warrantyProvider: string | null;
        warrantyContact: string | null;
    } | null;
    assignment: {
        id: number;
        departmentId: number;
        status: import("@prisma/client").$Enums.AssignmentStatus;
        assetId: number;
        refNo: string;
        userId: number | null;
        assignedTo: string;
        payRollNo: string;
        floorLevel: string | null;
        roomNumber: string | null;
        accessories: string | null;
        notes: string | null;
        isOverdue: boolean;
        expectedReturnCondition: string | null;
        disposalDate: Date | null;
        disposalMethod: string | null;
        assignedAt: Date;
        returnedAt: Date | null;
    }[];
} & {
    model: string;
    id: number;
    departmentId: number;
    createdAt: Date;
    tagNo: string;
    systemAssetId: string | null;
    category: string;
    subCategory: string | null;
    assetDescription: string | null;
    make: string;
    physicalCondition: string | null;
    serialNumber: string;
    macAddress: string | null;
    imeiNumber: string | null;
    color: string | null;
    status: import("@prisma/client").$Enums.AssetStatus;
}>;
//# sourceMappingURL=asset.service.d.ts.map