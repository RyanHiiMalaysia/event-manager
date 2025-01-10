"use client";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Accordion,
  AccordionItem,
  Link,
  Button,
  Avatar,
  Card,
  CardHeader,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

export default function EventDetailsPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState("");
  const [path, setPath] = useState("");
  const [isUserIn, setIsUserIn] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);
  const { data: session, status } = useSession();
  const [isEventFull, setIsEventFull] = useState(false);
  const [isEventPast, setIsEventPast] = useState(false);
  const [isEventAllocated, setIsEventAllocated] = useState(false);
  const [hasModalBeenShown, setHasModalBeenShown] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const sendEmail = async (email, subject, eventName, eventOwnerName, schedule, allocate, type) => {
    try {
      const response = await fetch(`/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: email,
          layout_choice: "CancelEvent",
          subject: subject,
          eventName: eventName,
          userName: eventOwnerName,
          time: allocate !== null ? allocate : schedule,
          timeType: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleJoin = async () => {
    const response_add_user = await fetch(`/api/user-event?email=${session.user.email}&link=${uniqueLink}`, {
      method: "POST",
      body: JSON.stringify({
        user_email: session.user.email,
        event_link: uniqueLink,
      }),
    });

    if (!response_add_user) throw new Error("Failed to add user to this event");
    else {
      setIsUserIn(true);
      onOpenChange(false); // Close the modal
    }
  };

  const handleDecline = () => {
    redirect("/event");
  };

  const handleLeave = async () => {
    try {
      await fetch("/api/user-event", {
        method: "POST",
        body: JSON.stringify({ user_email: session.user.email, event_link: uniqueLink, leave: true }),
      });
      setIsUserIn(false);
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleCancel = async () => {
    try {
      const participants = await fetch(`/api/user-event/participants?link=${uniqueLink}`);
      const data_participants = await participants.json();
      const emails = data_participants.participants.map((x) => x.email);

      await fetch("/api/user-event", {
        method: "POST",
        body: JSON.stringify({ event_link: uniqueLink, cancel: true }),
      });

      const allocate =
        event.event_allocated_start !== null
          ? `${convertDate(event.event_allocated_start)} - ${convertDate(event.event_allocated_end)}`
          : null;
      const schedule = `${convertDateTimeToDate(event.event_schedule_start)} -${convertDateTimeToDate(
        event.event_schedule_end
      )}`;
      const type = allocate !== null ? "Allocated time" : "Schedule Range";

      await sendEmail(emails, "Event is cancelled", event.event_title, event.user_name, schedule, allocate, type);
    } catch (error) {
      throw new Error(error);
    }
    redirect("/event");
  };

  const LeaveOrCancelEventButton = () => {
    if (isEventPast) {
      return;
    }
    if (isUserAdmin) {
      return (
        <Button color="danger" onPress={handleCancel} className="flex px-4 py-2 text-white rounded">
          Cancel Event
        </Button>
      );
    }
    if (isUserIn) {
      return (
        <Button color="danger" onPress={handleLeave} className="flex px-4 py-2 text-white rounded">
          Leave Event
        </Button>
      );
    }
  };

  const ShowAdmin = () => {
    if (isUserAdmin) {
      return (
        <Button className="flex px-4 py-2 text-black rounded" href={`/event/${uniqueLink}/admin`} as={Link}>
          <strong>Admin</strong>
        </Button>
      );
    }
  };

  const SetOrInviteOrEventPageButton = () => {
    if (isEventAllocated || isEventPast || isEventFull) {
      const description = isEventPast
        ? "This event is finished"
        : isEventAllocated
        ? "This event is allocated"
        : "This event is full";

      return (
        <div className="mt-6">
          <p>{description}</p>
          <div className="relative flex flex-row justify-between gap-x-2">
            <Button className="flex px-4 py-2 bg-blue-500 text-white rounded" href={`/event`} as={Link}>
              Event Page
            </Button>
            <LeaveOrCancelEventButton />
          </div>
        </div>
      );
    } else if (isUserIn) {
      return (
        <div className="relative flex flex-row justify-between gap-x-2">
          <Button
            className="flex px-4 py-2 bg-blue-500 text-white rounded"
            href={`/event/${uniqueLink}/schedule`}
            as={Link}
          >
            Set Your Availability
          </Button>
          <LeaveOrCancelEventButton />
        </div>
      );
    }
    return (
      <div>
        <h1>You've been invited to {event.event_title}!</h1>
        <div className="flex justify-between w-3/4">
          <Button color="success" size="auto" variant="flat" onPress={handleJoin}>
            Join
          </Button>
          <Button color="danger" size="auto" variant="flat" onPress={handleDecline}>
            Decline
          </Button>
        </div>
      </div>
    );
  };

  const ScheduledOrAllocated = () => {
    if (isEventAllocated) {
      return (
        <p className="text-gray-600 mt-2">
          <strong>DateTime</strong>: {convertDate(event.event_allocated_start)} -{" "}
          {convertDate(event.event_allocated_end)}
        </p>
      );
    }

    return (
      <div>
        <p className="text-gray-600 mt-2">
          <strong>Possible Dates</strong>: {convertDateTimeToDate(event.event_schedule_start)} -{" "}
          {convertDateTimeToDate(event.event_schedule_end)}
        </p>
        <p className="text-gray-600 mt-2">
          <strong>Possible Times</strong>: {condition(timeRange(event.event_opening_hour, event.event_closing_hour))}
        </p>
      </div>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.origin);
    }
  }, []);

  // Await the params when the component mounts
  useEffect(() => {
    const fetchParams = async () => {
      const uniqueLinkFromParams = (await params).uniqueLink;
      setUniqueLink(uniqueLinkFromParams);
    };

    fetchParams();
  }, [params]);

  function convertDateTimeToDate(dateTime) {
    let date = new Date(dateTime);

    // Format the date
    let formattedDate = date.toLocaleString("en-MY").split(",")[0];
    return formattedDate;
  }

  function convertTime(time) {
    return `${time.hours ? time.hours : "0"} hours ${time.minutes ? time.minutes : "0"} minutes`;
  }

  function timeRange(open, close) {
    if (!open && !close) return "unknown";

    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const openingTime = open
      ? new Intl.DateTimeFormat("en-US", options).format(new Date(Date.UTC(2025, 0, 4, ...open.split(":").map(Number))))
      : "unknown";

    const closingTime = close
      ? new Intl.DateTimeFormat("en-US", options).format(
          new Date(Date.UTC(2025, 0, 4, ...close.split(":").map(Number)))
        )
      : "unknown";

    return `${openingTime} - ${closingTime}`;
  }

  function condition(value) {
    return value || "--";
  }

  function convertDate(unformattedDate) {
    let date = new Date(unformattedDate);

    // Format the date
    let formattedDate = date
      .toLocaleString("en-MY", {
        weekday: "long", // Optional: Add weekday name
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Ensure the time is in 12-hour format
      })
      .replace(/,/, "")
      .replace(/:/g, ".");
    return formattedDate;
  }

  useEffect(() => {
    if (!isUserIn && !hasModalBeenShown) {
      onOpen(); // Open the modal
      onOpenChange(true);
      setHasModalBeenShown(true); // Set the modal as shown
    }
    if (!uniqueLink || status !== "authenticated" || !session?.user?.email) return;

    const fetchUser = async () => {
      if (hasFetchedUser) return; // Prevent duplicate calls

      setHasFetchedUser(true);
      try {
        const response_isUserAdmin = await fetch(
          `/api/user-event?email=${session.user.email}&link=${uniqueLink}&findIsUserIn=true&isAdmin=true`
        );
        const data_isUserAdmin = await response_isUserAdmin.json();
        setIsUserAdmin(data_isUserAdmin.result);

        // If the user is the admin of this event, he/she is of couse in this event
        if (data_isUserAdmin.result) {
          setIsUserIn(true);
        } else {
          const response_isUserIn = await fetch(
            `/api/user-event?email=${session.user.email}&link=${uniqueLink}&findIsUserIn=true`
          );
          const data_response = await response_isUserIn.json();
          setIsUserIn(data_response.result);
        }
      } catch (error) {
        throw new Error(error);
      }
    };

    const fetchEvent = async () => {
      try {
        const response_event = await fetch(`${path}/api/events?link=${uniqueLink}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response_event.ok) throw new Error("Failed to fetch event details");

        const data_events = await response_event.json();
        if (data_events.eventData.length === 0) throw new Error("Failed to fetch event details");
        const matchedEvent = data_events.eventData[0];
        setEvent(matchedEvent || null); // Set null if no event matches
        setIsEventAllocated(matchedEvent.event_allocated_start !== null);

        //Check is the event full
        const response_numberOfParticipants = await fetch(
          `/api/user-event?link=${uniqueLink}&findNumberOfParticipants=true`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response_numberOfParticipants.ok) throw new Error("Failed to fetch number of participants");
        const data_numberOfParticipants = await response_numberOfParticipants.json();
        const numberOfParticipants = data_numberOfParticipants.result;
        setIsEventFull(numberOfParticipants[0].count === matchedEvent.event_max_participants.toString());

        const response_past = await fetch(`/api/events?link=${uniqueLink}&past=true`);
        if (!response_past.ok) throw new Error("Failed to fetch event");
        const data_past = await response_past.json();
        setIsEventPast(data_past.result);
      } catch (error) {
        console.error("Error fetching event:", error.message);
        setEvent(null); // Handle not found
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchEvent();
    fetchUser();
  }, [uniqueLink, status, session]);

  if (loading) {
    return <p className="p-6 text-center">Loading event details...</p>;
  }

  if (!event) {
    return <p className="p-6 text-center">Event not found.</p>;
  }

  return (
    <div className="relative flex flex-col gap-y-4">
      <div
        className="flex-grow p-20 max-w-xl mx-auto border border dark:border rounded-lg shadow-lg bg-white dark:bg-transparent"
        style={{ marginTop: "40px" }}
      >
        <h1 className="text-3xl font-bold">{event.event_title}</h1>
        <p className="text-gray-600 mt-2">
          <strong>Owner</strong>: {event.user_name}
        </p>
        <ScheduledOrAllocated />
        <p className="text-gray-600 mt-2">
          <strong>Duration</strong>: {convertTime(event.event_duration)}
        </p>
        <Accordion variant="bordered" selectionMode="multiple">
          <AccordionItem key="1" aria-label="Location" title="Location">
            <div className="max-h-40 overflow-y-auto break-words">
              <p>{event.event_location}</p>
            </div>
          </AccordionItem>
          <AccordionItem key="2" aria-label="Description" title="Description">
            <div className="max-h-40 overflow-y-auto break-words">{condition(event.event_description)}</div>
          </AccordionItem>
          <AccordionItem key="3" aria-label="Deadline" title="Deadline">
            <div className="max-h-40 overflow-y-auto break-words">{condition(convertDate(event.event_deadline))}</div>
          </AccordionItem>
        </Accordion>
        <br></br>
        <div className="relative flex flex-col justify-between gap-x-2">
          <Button className="flex px-4 py-2 text-blue rounded" href={`/event/${uniqueLink}/participants`} as={Link}>
            <strong>Participants</strong>
          </Button>
          <br></br>
          <ShowAdmin />
        </div>
        <div className="mt-6">
          <SetOrInviteOrEventPageButton />
        </div>
      </div>
    </div>
  );
}
