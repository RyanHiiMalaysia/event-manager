"use client";
import { useRouter, redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Accordion, AccordionItem, Link, Button, Avatar, Card, CardHeader, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";

export default function EventDetailsPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState('');
  const [path, setPath] = useState("");
  const [isUserIn, setIsUserIn] = useState(false);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);
  const { data: session, status } = useSession();
  const [isEventFull, setIsEventFull] = useState(false);
  const [isEventAllocated, setIsEventAllocated] = useState(false);
  const [hasModalBeenShown, setHasModalBeenShown] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleJoin = async () => {
    console.log('Joined the event');

    const response_add_user = await fetch(`/api/user-event?email=${session.user.email}&eventLink=${uniqueLink}`, {
      method: "POST",
      body: JSON.stringify({
        user_email: session.user.email,
        event_link: uniqueLink
      }),
    });

    if (!response_add_user) throw new Error('Failed to add user to this event');
    else {
      setIsUserIn(true);
      onOpenChange(false); // Close the modal
    }
  };

  const handleDecline = () => {
    console.log('Declined the event');
    redirect('/event');
  };

  const InvitationPopup2 = ({event}) => {
    if (!isUserIn && !(isEventFull || isEventAllocated)) {
      return (
        <Modal 
        isOpen={isOpen} 
        onOpenChange={true}
        isDismissable={false}
        isKeyboardDismissDisabled={true}>
          <ModalContent>
        <ModalBody>
          
          <div className="flex flex-col items-center w-full max-w-md p-8 space-y-6">
            <Avatar referrerPolicy={'no-referrer'}
                  className="w-20 h-20 text-large"
                  src={session.user.image}
                  showFallback
                />
          <p>You've been invited you to {event.event_title}!</p>
          <div className="flex justify-between w-3/4">
            <Button color="success" size="auto" variant="flat" onPress={handleJoin}>
              Join
            </Button>
            <Button color="danger" size="auto" variant="flat" onPress={handleDecline}>
              Decline
            </Button>
          </div>
          
          </div>
          
        </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
    return null;
  };

  

  const SetOrEventPageButton = () => {
    if (isEventFull || isEventAllocated) {
      return (
        <div className="mt-6">
          <p>This event has reached maximum number of participants</p>
          <Button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            href={`/event`}
            as={Link}
          >
            Event Page
          </Button>
        </div>
      );
    } else if (isUserIn) {
      return (
        <div className="mt-6">
          <Button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            href={`/event/${uniqueLink}/schedule`}
            as={Link}
          >
            Set Your Availability
          </Button>
        </div>
      );
    }
  };

  const ScheduledOrAllocated = () => {
    if (isEventAllocated) {
      return (
        <p className="text-gray-600 mt-2">
          Allocated DateTime: {convertDateTimeToDate(event.event_allocated_start)} - {convertDateTimeToDate(event.event_allocated_end)}
        </p>
      );
    }

    return (
      <p className="text-gray-600 mt-2">
        Schedule Range: {convertDateTimeToDate(event.event_schedule_start)} - {convertDateTimeToDate(event.event_schedule_end)}
      </p>
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
    const date = new Date(dateTime);
    return date.toISOString().split('T')[0];
  }

  function convertTime(time) {
    return `${time.hours ? time.hours : "0"} hours ${time.minutes ? time.minutes : "0"} minutes`;
  }

  function timeRange(open, close) {
    if (!open && !close) return "unknown";
    if (!open) return `unknown - ${close}`;
    if (!close) return `${open} - unknown`;
    return `${open} - ${close}`;
  }

  function condition(value) {
    return value || "--";
  }

  function convertDate(unformattedDate) {
    let date = new Date(unformattedDate);

    // Format the date
    let formattedDate = date.toLocaleString('en-US', {
      weekday: 'long',   // Optional: Add weekday name
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Ensure the time is in 12-hour format
    }).replace(/,/, '').replace(/:/g, '.');
    return formattedDate;
  }

  useEffect(() => {
    if (!isUserIn && !hasModalBeenShown) {
      onOpen(); // Open the modal
      onOpenChange(true);
      setHasModalBeenShown(true); // Set the modal as shown
    }
    if (!uniqueLink || status !== 'authenticated' || !session?.user?.email) return;

    const fetchUser = async () => {
      if (hasFetchedUser) return; // Prevent duplicate calls
      
      setHasFetchedUser(true);
      try {
        const response = await fetch(`/api/user-event?email=${session.user.email}&eventLink=${uniqueLink}&findIsUserIn=true`);
        const statusCode = response.status;
        console.log(statusCode);
        if (statusCode === 404) {
          setIsUserIn(false);
          
        } else {
          setIsUserIn(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchEvent = async () => {
      try {
        const response_event = await fetch(`${path}/api/events?link=${uniqueLink}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response_event.ok) throw new Error('Failed to fetch event details');

        const data_events = await response_event.json();
        if (data_events.eventData.length === 0) throw new Error('Failed to fetch event details');
        const matchedEvent = data_events.eventData[0];
        setEvent(matchedEvent || null); // Set null if no event matches
        setIsEventAllocated(matchedEvent.event_allocated_start !== null);

        // Check is the event full
        const response_numberOfParticipants = await fetch(`/api/user-event?eventLink=${uniqueLink}&findNumberOfParticipants=true`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response_numberOfParticipants.ok) throw new Error('Failed to fetch number of participants');
        const data_numberOfParticipants = await response_numberOfParticipants.json();
        const numberOfParticipants = data_numberOfParticipants.result;
        setIsEventFull(numberOfParticipants === matchedEvent.event_max_participants);
      } catch (error) {
        console.error('Error fetching event:', error.message);
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
      <InvitationPopup2 event={event}/>
      <div className="flex-grow p-20 max-w-xl mx-auto border border dark:border rounded-lg shadow-lg bg-white dark:bg-transparent" style={{ marginTop: "6%" }}>
        <h1 className="text-3xl font-bold">{event.event_title}</h1>
        <p className="text-gray-600 mt-2">Owner: {event.user_name}</p>
        <ScheduledOrAllocated />
        <p className="text-gray-600 mt-2">Duration: {convertTime(event.event_duration)}</p>
        <Accordion variant="bordered" selectionMode="multiple">
          <AccordionItem key="1" aria-label="Location" title="Location">
            <div className="max-h-40 overflow-y-auto break-words">
              <p>{event.event_location}</p>
              <p>Opening Hours: {condition(timeRange(event.event_opening_hour, event.event_closing_hour))}</p>
            </div>
          </AccordionItem>
          <AccordionItem key="2" aria-label="Description" title="Description">
            <div className="max-h-40 overflow-y-auto break-words">{condition(event.event_description)}</div>
          </AccordionItem>
          <AccordionItem key="3" aria-label="Deadline" title="Deadline">
            <div className="max-h-40 overflow-y-auto break-words">{condition(convertDate(event.event_deadline))}</div>
          </AccordionItem>
        </Accordion>
        <div className="mt-6">
          <SetOrEventPageButton />
        </div>
      </div>
    </div>
  );
}
