"use client";
import React, { useState, useEffect } from "react";
import { EventCalendar } from "@/components/Calendar";
import EventModal from "@/components/EventModal";
import { useDisclosure } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import useOverflowHandler from "@/hooks/useOverflowHandler";

function EventCalendarPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/user-event?email=${session.user.email}&hasAllocated=true`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to fetch events");
          return;
        }
        setUserEvents(
          result.eventData.map((event) => ({
            ...event,
            start: new Date(event.event_allocated_start),
            end: new Date(event.event_allocated_end),
            title: event.event_title,
          }))
        );
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (session && !dataFetched) {
      fetchUserDetails();
      setDataFetched(true);
    }
  }, [status, session, dataFetched]);

  return (
    <div className="mt-6 md:mt-4 min-h-screen" ref={useOverflowHandler(730)}>
      <div className="max-w-4xl mx-auto rounded-lg">
        <EventCalendar events={userEvents} onSelectEvent={handleSelectEvent} />
        <EventModal isOpen={isOpen} onOpenChange={onOpenChange} selectedEvent={selectedEvent} />
      </div>
    </div>
  );
}
export default EventCalendarPage;
