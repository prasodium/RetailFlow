import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";
import { UserRole } from "../src/generated/enums.js";

async function main() {
  const [name, email, password, role] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error(
      'Usage: npx tsx scripts/create-staff-user.ts "Full Name" email password [ADMIN|MANAGER|STAFF]'
    );
    process.exitCode = 1;
    return;
  }

  const resolvedRole = (role?.toUpperCase() as UserRole) || UserRole.ADMIN;

  if (!Object.values(UserRole).includes(resolvedRole)) {
    console.error(`Invalid role "${role}". Use ADMIN, MANAGER, or STAFF.`);
    process.exitCode = 1;
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashed,
      role: resolvedRole,
    },
    create: {
      name,
      email,
      password: hashed,
      role: resolvedRole,
    },
  });

  console.log(`Staff user ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
