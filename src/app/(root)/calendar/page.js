"use client";
import React, { useState, useEffect } from "react";
import { EventCalendar } from "../../../components/Calendar";
import EventModal from "../../../components/EventModal";
import { eventData } from "../../../components/demoData";
import { useDisclosure } from "@nextui-org/react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.email) {
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
      } else {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [status, session]);

  return (
    <div className="bg-custom-page min-h-screen">
      <div className="max-w-4xl mx-auto rounded-lg">
        <EventCalendar events={userEvents} onSelectEvent={handleSelectEvent} />
        <EventModal isOpen={isOpen} onOpenChange={onOpenChange} selectedEvent={selectedEvent} />
      </div>
      <style jsx global>{`
        html,
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
