import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) {
    // console.error("No user found.");
    return null;
  }

  // console.log("Current user:", user);

  try {
    // Ensure database connection and schema field name
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      // console.log("User already exists in the database.");
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const username = name.split(" ").join("-") + user.id.slice(-4);

    console.log("Updating user in Clerk with username:", username);

    console.log(clerkClient);
    const clerk = await clerkClient();
console.log(clerk?.users);

    // Ensure Clerk client is correctly used
    await clerk.users.updateUser(user.id, { username });


    // Create the user in the database
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
        username,
      },
    });
   


    console.log("New user created:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error during user check:", error);
    return null;
  }
};
