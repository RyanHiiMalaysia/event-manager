"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { EventCalendar } from "@/components/Calendar";
import { ModalFooter, useDisclosure } from "@nextui-org/react";
import useOverflowHandler from "@/hooks/useOverflowHandler";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import moment from "moment";
import Error from "next/error";
import { getData, checkAdmin } from "@/utils/api";

export default function Page() {
  const { data: session, status } = useSession();
  const [eventLink, setEventLink] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [eventData, setEventData] = useState({});

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const renderEventContent = (event) => {
    const startDate = moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a");
    const endDate = moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a");
    return (
      <>
        <p>
          {startDate} – {endDate}
        </p>
      </>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 3];
      setEventLink(eventLink);
    }
  }, []);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const isAdminData = await checkAdmin(eventLink, session);
        setIsAdmin(isAdminData);
        if (isAdminData) {
          const [userEventsResult, eventResult] = await Promise.all([
            getData(`/api/user-event/schedule?link=${eventLink}`),
            getData(`/api/events?link=${eventLink}`),
          ]);
          setUserEvents(
            userEventsResult.freeTimes.map((ft) => ({
              title: ft.title,
              start: new Date(ft.start),
              end: new Date(ft.end),
            }))
          );
          setEventData(eventResult.eventData[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setDataFetched(true);
      }
    };

    if (session && eventLink && !dataFetched) {
      fetchAdminStatus();
    }
  }, [session, eventLink, dataFetched]);

  const renderPage = () => {
    if (status === "loading" || !dataFetched || isAdmin) {
      return (
        <div className="max-w-4xl mx-auto rounded-lg">
          <EventCalendar events={userEvents} onSelectEvent={handleSelectEvent} />
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1">{selectedEvent.title}</ModalHeader>
                  <ModalBody>{renderEventContent(selectedEvent)}</ModalBody>
                  <ModalFooter></ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      );
    } else if (eventData.event_allocated_end !== null && eventData.event_allocated_end < new Date()) {
      return <Error statusCode={400} title="The event has already ended" />;
    } else {
      return <Error statusCode={403} title="You do not have permission to view this page" />;
    }
  };

  return (
    <div className="mt-6 md:mt-4 min-h-screen" ref={useOverflowHandler(730)}>
      {renderPage()}
    </div>
  );
}
