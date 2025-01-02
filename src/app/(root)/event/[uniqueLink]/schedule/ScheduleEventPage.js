"use client";
import { I18nProvider } from "@react-aria/i18n";
import React, { useState, useEffect, useRef } from "react";
import { ScheduleCalendar } from "@/components/Calendar";
import { eventRange } from "@/components/demoData";
import { DatePicker } from "@nextui-org/date-picker";
import { TimeInput } from "@nextui-org/date-input";
import {Input} from "@nextui-org/input";
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
        />
        <TimeInput
          className="max-w-[284px] border rounded p-2"
          label="End Time"
          value={endTime}
          onChange={setEndTime}
          isInvalid={endTime && startTime ? endTime <= startTime : false}
          errorMessage="End time must be greater than start time"
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

  // const minuteOptions = [];
  // for (let minute = 0; minute < 60; minute += 15) {
  //   minuteOptions.push(`${String(minute).padStart(2, "0")}`);
  // }

  // const generateTimeOptions = (interval) => {
  //   const times = [];
  //   let current = new Date(`1970-01-01T00:00:00`);
  //   const endTime = new Date(`1970-01-01T23:59:00`);
  //   while (current <= endTime) {
  //     times.push(
  //       current
  //         .toTimeString()
  //         .slice(0, 5) // Format HH:mm
  //     );
  //     current = new Date(current.getTime() + interval * 60 * 1000); // Add interval
  //   }
  //   return times;
  // };

  // const minuteOptions = generateTimeOptions(15); // 15-minute intervals
  


  return (
    <div className="mt-6 md:mt-4 min-h-screen" ref={useOverflowHandler(730)}>
      <div className="max-w-4xl mx-auto rounded-lg">
        <ScheduleCalendar onSelectEvent={handleSelectEvent} eventRange={eventRange} freeTimes={freeTimes} />
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
            <Input
              className="max-w-[350px] border rounded p-2"
              label="Start Time"
              list="minute-options"
              id="minutes"
              name="minutes"
              aria-label="Minutes"
              type="time"
              style={{ width: "100%", color: startTime ? "#000" : "#71717A" }}
              onChange={(e) => setStartTime(e.target.value)}
              validate={(time) =>
                time.split(":")[1] % 15 === 0 ? null : "Please enter a valid time in 15-minute intervals"
              }
            />
          </div>
        <div className="w-full">
            <Input
            className="max-w-[350px] border rounded p-2"
              label="End Time"
              list="minute-options"
              id="minutes"
              name="minutes"
              aria-label="Minutes"
              type="time"
              style={{ width: "100%", color: endTime ? "#000" : "#71717A" }}
              onChange={(e) => setEndTime(e.target.value)}
              validate={(time) =>
                time.split(":")[1] % 15 === 0 ? null : "Please enter a valid time in 15-minute intervals"
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
