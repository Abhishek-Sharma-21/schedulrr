'use server'

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function createBooking(bookingData) {
  try {
    const event = await db.event.findUnique({
      where: {
        id: bookingData.eventId,
      },
      include: { user: true },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Ensure Clerk client is correctly used
    const user = await (await clerkClient()).users.getUser(event.user.clerkUserId);
    if (!user) {
      throw new Error("User not found in Clerk");
    }

    // Retrieve the OAuth token for Google
    const { data } = await (await clerkClient()).users.getUserOauthAccessToken(
      event.user.clerkUserId,
      "oauth_google"
    );

    // Log the response for debugging
    console.log("Data received from Clerk OAuth:", data);

    if (!data || data.length === 0) {
      throw new Error("Event Creator has not connected Google Calendar");
    }

    const token = data[0]?.token;
    if (!token) {
      throw new Error("Google Calendar token not found");
    }

    // Set up Google OAuth Client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const meetResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${bookingData.name} - ${event.title}`,
        description: bookingData.additionalInfo,
        start: { dateTime: bookingData.startTime },
        end: { dateTime: bookingData.endTime },
        attendees: [
          { email: bookingData.email },
          { email: event.user.email },
        ],
        conferenceData: {
          createRequest: { requestId: `${event.id}-${Date.now()}` },
        },
      },
    });

    const meetLink = meetResponse.data.hangoutLink;
    const googleEventId = meetResponse.data.id;

    // Create booking in database
    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.userId,
        name: bookingData.name,
        email: bookingData.email,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        additionalInfo: bookingData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });

    return { success: true, booking, meetLink };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
