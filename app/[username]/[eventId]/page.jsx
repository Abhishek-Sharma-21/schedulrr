import { getEventAvailability, getEventDetails } from "@/actions/events";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetails from "./_components/events-details";
import BookingForm from "./_components/booking-form";

export async function generateMetadata({ params }) {
  const { username, eventId } = await params; // Await params properly

  const event = await getEventDetails(username, eventId);
  if (!event) {
    return {
      title: "Event Not Found",
    };
  } else {
    return {
      title: `Book ${event.title} with ${event.user.name} | Schedulrr`,
      description: `Schedule ${event.duration}-minute ${event.title} with ${event.user.name}.`,
    };
  }
}

const EventPage = async ({ params }) => {
  const { username, eventId } = await params; // Await params properly

  const event = await getEventDetails(username, eventId);
  const availability = await getEventAvailability(eventId);

  console.log(availability);

  if (!event) {
    notFound();
  }
  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventPage;
