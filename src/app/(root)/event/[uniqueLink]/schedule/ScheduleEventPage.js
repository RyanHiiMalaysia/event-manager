"use client";
import { I18nProvider } from "@react-aria/i18n";
import React, { useState, useEffect, useRef } from "react";
import { ScheduleCalendar } from "@/components/Calendar";
import { DatePicker } from "@nextui-org/date-picker";
import { TimeInput } from "@nextui-org/date-input";
import { useSession } from "next-auth/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { parseDate, parseTime, parseAbsolute, toLocalTimeZone } from "@internationalized/date";
import useOverflowHandler from "@/hooks/useOverflowHandler";
import moment from "moment";

export default function Page() {
  const [selectedDate, setSelectedDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [freeTimes, setFreeTimes] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventLink, setEventLink] = useState("");
  const [dataFetched, setDataFetched] = useState(false);
  const [startDate, setStartDateRange] = useState();
  const [endDate, setEndDateRange] = useState();
  const [open, setOpen] = useState();
  const [close, setClose] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 2];
      setEventLink(eventLink);
    }
  }, []);

  useEffect(() => {
    const fetchFreetimes = async () => {
      try {
        const response = await fetch(`/api/user-event/schedule?link=${eventLink}&email=${session.user.email}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const response_event_date = await fetch(`/api/events?link=${eventLink}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        const result_event_date = await response_event_date.json();

        const start = result_event_date.eventData[0].event_schedule_start.split("T")[0];
        setStartDateRange(parseDate(start));
        const end = result_event_date.eventData[0].event_schedule_end.split("T")[0];
        setEndDateRange(parseDate(end));

        setOpen(result_event_date.eventData[0].event_opening_hour);
        setClose(result_event_date.eventData[0].event_closing_hour);


        if (!response.ok || !response_event_date.ok) {
          setError(result.message);
          setLoading(false);
          return;
        }
        let freeTimeCounter = 1;
        result.freeTimes.forEach((freeTime) => {
          freeTime.start = new Date(freeTime.start);
          freeTime.end = new Date(freeTime.end);
          freeTime.title = `Free Time ${freeTimeCounter++}`;
          setFreeTimes((prevFreeTimes) => [...prevFreeTimes, freeTime]);
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
        setDataFetched(true);
      }
    };

    if (session && eventLink && !dataFetched) {
      fetchFreetimes();
    }
  }, [session, eventLink, dataFetched]);

  const addFreeTime = (event) => {
    setFreeTimes([...freeTimes, event]);
  };

  const checkOverlap = (start, end) =>
    freeTimes.find(
      (freeTime) => (start >= freeTime.start && start < freeTime.end) || (end > freeTime.start && end <= freeTime.end)
    );

  const handleOnAddPress = () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("Please fill all fields");
    } else if (endTime <= startTime) {
      alert("End time must be greater than start time");
    } else if (!(checkStarting && checkClosing)) {
      alert("Freetime should between opening hour and closing hour");
    } else {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      const overlappingFreeTime = checkOverlap(startDateTime, endDateTime);

      if (overlappingFreeTime) {
        alert(`The times overlap with an existing free time: ${overlappingFreeTime.title}`);
      } else {
        const freeTime = {
          title: `Free Time ${freeTimes.length + 1}`,
          start: startDateTime,
          end: endDateTime,
        };
        addFreeTime(freeTime);
        setSelectedDate(null);
        setStartTime("");
        setEndTime("");
      }
    }
  };

  const checkStarting = () => {
    const dummyDate = "2024-01-01"
    const event_opening = new Date(`${dummyDate}T${open}`);
    const user_opening = new Date(`${dummyDate}T${startTime}`);

    return (event_opening <= user_opening);
  }

  const checkClosing = () => {
    const dummyDate = "2024-01-01"
    const event_closing = new Date(`${dummyDate}T${close}`);
    const user_closing = new Date(`${dummyDate}T${endTime}`);

    return (event_closing >= user_closing);
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const renderEventContent = () => {
    const startDate = moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a");
    const endDate = moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a");
    return (
      <p>
        {startDate} – {endDate}
      </p>
    );
  };

  const renderEditEventContent = () => {
    return (
      <>
        <DatePicker
          isRequired
          minValue={startDate}
          maxValue={endDate}
          className="max-w-[284px] border rounded p-2"
          label="Date"
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <TimeInput
          className="max-w-[284px] border rounded p-2"
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          isInvalid={startTime ? startTime.minute % 15 !== 0 ? true : !checkStarting() : false}
          errorMessage={
            () => {
              if (!endTime) {
                return "";
              }
              return endTime.minute % 15 !== 0 ?
                "Please enter a valid time in 15-minute intervals" :
                checkClosing() ?
                  "" : `End time should before the closing hour(${close})`
            }
          }
        />
        <TimeInput
          className="max-w-[284px] border rounded p-2"
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          isInvalid={endTime ?
            endTime && startTime ?
              endTime <= startTime ?
                true :
                endTime.minute % 15 !== 0 ?
                  true :
                  !checkClosing() :
              false :
            false}

          errorMessage={
            () => {
              if (!endTime) {
                return "";
              } else if (endTime <= startTime) {
                return "End time must be greater than start time ";
              }
              return endTime.minute % 15 !== 0 ?
                "Please enter a valid time in 15-minute intervals" :
                checkClosing() ?
                  "" : `End time should before the closing hour(${close})`
            }
          }
        />
      </>
    );
  };

  const deleteSelectedEvent = () => {
    setFreeTimes(freeTimes.filter((event) => event.start !== selectedEvent.start && event.end !== selectedEvent.end));
    setSelectedEvent(null);
    onOpenChange();
  };

  const handleEditOpen = () => {
    onOpenChange();
    setIsEditOpen(true);
    const eventStart = toLocalTimeZone(parseAbsolute(selectedEvent.start.toISOString()));
    const eventEnd = toLocalTimeZone(parseAbsolute(selectedEvent.end.toISOString()));
    setSelectedDate(parseDate(eventStart.toString().split("T")[0]));
    setStartTime(parseTime(eventStart.toString().split("T")[1].slice(0, 5)));
    setEndTime(parseTime(eventEnd.toString().split("T")[1].slice(0, 5)));
  };

  const handleEditSavePress = () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("Please fill all fields");
    } else if (endTime <= startTime) {
      alert("End time must be greater than start time");
    } else if (!(checkStarting && checkClosing)) {
      alert("Freetime should between opening hour and closing hour");
    } else {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      const overlappingFreeTime = checkOverlap(startDateTime, endDateTime);

      if (overlappingFreeTime.start !== selectedEvent.start && overlappingFreeTime.end !== selectedEvent.end) {
        alert(`The times overlap with an existing free time: ${overlappingFreeTime.title}`);
      } else {
        const freeTime = freeTimes.find(
          (event) => event.start === selectedEvent.start && event.end === selectedEvent.end
        );
        freeTime.start = startDateTime;
        freeTime.end = endDateTime;
        setSelectedDate(null);
        setStartTime("");
        setEndTime("");
        setIsEditOpen(false);
      }
    }
  };

  const handleSavePress = async () => {
    const response = await fetch("/api/user-event/schedule", {
      method: "POST",
      body: JSON.stringify({
        user_email: session.user.email,
        event_link: eventLink,
        freetimes: freeTimes,
      }),
    });

    if (response.ok) {
      alert("Successfully updated your free times");
    } else {
      alert("An error occurred while updating your free times");
    }
  };



  return (
    <div className="mt-6 md:mt-4 min-h-screen" ref={useOverflowHandler(730)}>
      <div className="max-w-4xl mx-auto rounded-lg">
        <ScheduleCalendar onSelectEvent={handleSelectEvent} start={startDate} freeTimes={freeTimes} />
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">{selectedEvent.title}</ModalHeader>
                <ModalBody>{renderEventContent(selectedEvent)}</ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={handleEditOpen}>
                    Edit
                  </Button>
                  <Button color="danger" variant="light" onPress={deleteSelectedEvent}>
                    Delete
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">Edit {selectedEvent.title}</ModalHeader>
                <ModalBody>{renderEditEventContent()}</ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={handleEditSavePress}>
                    Save
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <div className="date-time-container text-center overflow-x-auto">
        <I18nProvider locale="en-MY">
          <DatePicker
            isRequired
            minValue={startDate}
            maxValue={endDate}
            className="max-w-[284px] border rounded p-2"
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </I18nProvider>
        <div className="w-full">
          <TimeInput
            className="max-w-[350px] border rounded p-2"
            label="Start Time"
            onChange={setStartTime}
            value={startTime}
            isInvalid={startTime ? startTime.minute % 15 !== 0 ? true : !checkStarting() : false}
            errorMessage={
              () => {
                if (!startTime) {
                  return "";
                }
                return startTime.minute % 15 !== 0 ?
                  "Please enter a valid time in 15-minute intervals" :
                  checkClosing() ?
                    "" : `Start time should after the opening hour(${open})`
              }
            }
          />
        </div>
        <div className="w-full">
          <TimeInput
            className="max-w-[350px] border rounded p-2"
            label="End Time"
            type="time"
            value={endTime}
            onChange={setEndTime}
            isInvalid={endTime ?
              endTime && startTime ?
                endTime <= startTime ?
                  true :
                  endTime.minute % 15 !== 0 ?
                    true :
                    !checkClosing() :
                false :
              false}

            errorMessage={
              () => {
                if (!endTime) {
                  return "";
                } else if (endTime <= startTime) {
                  return "End time must be greater than start time ";
                }
                return endTime.minute % 15 !== 0 ?
                  "Please enter a valid time in 15-minute intervals" :
                  checkClosing() ?
                    "" : `End time should before the closing hour(${close})`
              }
            }
          />
        </div>
      </div>
      <div className="add-button-container text-center pt-1 pb-4 px-1 lg:px-0 md:pt-2">
        <Button onPress={handleOnAddPress} className="mr-2">
          Add
        </Button>
        <Button color="primary" onPress={handleSavePress}>
          Save
        </Button>
      </div>
    </div>
  );
}
