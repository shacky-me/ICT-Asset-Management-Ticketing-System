import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminFullName =
    process.env.INITIAL_ADMIN_FULL_NAME || "System Administrator";
  const adminStaffNo = process.env.INITIAL_ADMIN_STAFF_NO || "ICT-ADMIN-001";
  const adminJobTitle =
    process.env.INITIAL_ADMIN_JOB_TITLE || "ICT Administrator";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be configured."
    );
  }

  // Find or create the ICT department.
  const department = await prisma.department.upsert({
    where: {
      name: "ICT",
    },
    update: {},
    create: {
      name: "ICT",
    },
  });

  // Do not create a duplicate administrator.
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { staffNo: adminStaffNo },
      ],
    },
  });

  if (existingAdmin) {
    console.log("Initial administrator already exists.");
    console.log({
      id: existingAdmin.id,
      email: existingAdmin.email,
      staffNo: existingAdmin.staffNo,
      role: existingAdmin.role,
    });

    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      fullName: adminFullName,
      staffNo: adminStaffNo,
      jobTitle: adminJobTitle,
      email: adminEmail,
      password: hashedPassword,
      role: Role.ICT_ADMIN,
      departmentId: department.id,
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log("Initial ICT administrator created successfully.");
  console.log({
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    staffNo: admin.staffNo,
    role: admin.role,
    departmentId: admin.departmentId,
  });
}

main()
  .catch((error) => {
    console.error("Initial administrator seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
