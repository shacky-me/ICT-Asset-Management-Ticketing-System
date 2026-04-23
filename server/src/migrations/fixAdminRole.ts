import { prisma } from "../prisma.js";

async function fixAdminRole() {
  try {
    console.log("Starting admin role migration...");

    // Update meshackkiprono12@gmail.com to ICT_ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: "meshackkiprono12@gmail.com" },
      data: { role: "ICT_ADMIN" },
    });

    console.log(
      `✓ Updated ${updatedUser.fullName} (${updatedUser.email}) to ICT_ADMIN`,
    );
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
