"use client";
import React, { useState } from "react";
import { EventCalendar } from "../../../components/Calendar";
import EventModal from "../../../components/EventModal";
import { eventData } from "../../../components/demoData";
import { useDisclosure } from "@nextui-org/react";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  return (
    <div className="bg-custom-page min-h-screen">
      <div className="max-w-4xl mx-auto rounded-lg">
        <EventCalendar events={eventData} onSelectEvent={handleSelectEvent} />
        <EventModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          selectedEvent={selectedEvent}
        />
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
