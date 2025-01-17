"use client";
import React, { useState, useEffect } from "react";
import { EventCalendar } from "@/components/Calendar";
import EventModal from "@/components/EventModal";
import { useDisclosure } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import useOverflowHandler from "@/hooks/useOverflowHandler";
import { getUserEvents } from "@/utils/api";

function EventCalendarPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data: session, status } = useSession();
  const [userEvents, setUserEvents] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const result = await getUserEvents(session)("hasAllocated=true");
        setUserEvents(
          result.map((event) => ({
            ...event,
            start: new Date(event.event_allocated_start),
            end: new Date(event.event_allocated_end),
            title: event.event_title,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setDataFetched(true);
      }
    };

    if (session && !dataFetched) {
      fetchUserDetails();
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
