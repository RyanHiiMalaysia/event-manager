"use client";
import React, { useState } from "react";
import { EventCalendar } from "../../../components/Calendar";
import { eventData } from "../../../components/demoData";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import moment from "moment";

export default function Page() {
  // const [events, setEvents] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // useEffect(() => {
  //   fetch('/api/availability')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const formattedEvents = data.map((event) => ({
  //         title: event.userEmail,
  //         start: new Date(event.startTime),
  //         end: new Date(event.endTime),
  //       }));
  //       setEvents(formattedEvents);
  //     });
  // }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const renderEventContent = (event) => {
    const startDate = moment(event.start).format("MMMM Do YYYY, h:mm a");
    const endDate = moment(event.end).format("MMMM Do YYYY, h:mm a");
    return (
      <div>
        <p>
          {startDate} – {endDate}
        </p>
        <br />
        <p>Location: {event.location}</p>
        <p>Description: {event.description}</p>
      </div>
    );
  };

  const handleOnPress = () => {
    window.open(selectedEvent.url, "_blank");
  };

  return (
    <div className="bg-custom-page min-h-screen">
      <div className="max-w-4xl mx-auto rounded-lg">
        <EventCalendar events={eventData} onSelectEvent={handleSelectEvent} />
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedEvent.title}
                </ModalHeader>
                <ModalBody>{renderEventContent(selectedEvent)}</ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={handleOnPress}>
                    More Info
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
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
