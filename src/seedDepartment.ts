import { prisma } from "./prisma.js";

async function main() {
  const departments = [
    { name: "IT Support" },
    { name: "Network" },
    { name: "Hardware" },
    { name: "Software" },
    { name: "Finance" },
    { name: "HR" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  console.log("Departments seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
