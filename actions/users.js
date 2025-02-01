"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateUsername(username) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if username is taken (excluding current user)
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername && existingUsername.clerkUserId !== userId) {
      return { success: false, error: "Username already taken" };
    }

    // Update database
    await db.user.update({
      where: { clerkUserId: userId },
      data: { username },
    });
    console.log("Clerk Client:", clerkClient);

    // Update Clerk user profile
    await clerkClient.users.updateUser(userId, {
      username,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Something went wrong" };
  }
}

export async function getUserByUsername(username) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      events: {
        where: {
          isPrivate: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isPrivate: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });
  return user;
}
