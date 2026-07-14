import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("User has no email address associated with their Clerk account.");
  }

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";

  // Upsert user in the Prisma database
  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      name,
      email,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
    },
  });

  return user;
}
