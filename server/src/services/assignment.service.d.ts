export declare const createAssignment: (data: any, issuerId: number) => Promise<{
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
}>;
export declare const getAssignmentStats: () => Promise<{
    active: number;
    thisMonth: number;
    returned: number;
    overdue: number;
}>;
export declare const getAllAssignments: (filters: any) => Promise<{
    assignments: ({
        asset: {
            model: string;
            tagNo: string;
            category: string;
        };
    } & {
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
    })[];
    totalCount: number;
    page: any;
    totalPages: number;
}>;
//# sourceMappingURL=assignment.service.d.ts.map