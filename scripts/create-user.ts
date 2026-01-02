import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <username> <password>");
    console.error("   or: npm run create-user <username> <password>");
    process.exit(1);
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.error(`❌ User "${username}" already exists!`);
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      active: true,
    },
  });

  console.log(`✅ User created successfully!`);
  console.log(`   Username: ${user.username}`);
  console.log(`   ID: ${user.id}`);
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

