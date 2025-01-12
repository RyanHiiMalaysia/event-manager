"use client";
import { I18nProvider } from "@react-aria/i18n";
import React, { useState, useEffect } from "react";
import { ScheduleCalendar } from "@/components/Calendar";
import { useSession } from "next-auth/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  DateRangePicker,
  TimeInput,
  DatePicker,
} from "@nextui-org/react";
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [validateTimes, setValidateTimes] = useState(false);

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

        //const start = result_event_date.eventData[0].event_schedule_start.split("T")[0];
        const start = convertDate(result_event_date.eventData[0].event_schedule_start);
        setStartDateRange(parseDate(start));
        // const end = result_event_date.eventData[0].event_schedule_end.split("T")[0];
        const end = convertDate(result_event_date.eventData[0].event_schedule_end);
        setEndDateRange(parseDate(end));

        setOpen(convertTime(result_event_date.eventData[0].event_opening_hour));
        setClose(convertTime(result_event_date.eventData[0].event_closing_hour));

        if (!response.ok || !response_event_date.ok) {
          setError(result.message);
          setLoading(false);
          return;
        }
        let freeTimeCounter = 1;
        result.freeTimes.map((freeTime) => {
          freeTime.start = new Date(freeTime.start);
          freeTime.end = new Date(freeTime.end);
          freeTime.title = `Free Time ${freeTimeCounter++}`;
        });
        setFreeTimes(result.freeTimes);
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

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const deleteSelectedEvent = () => {
    setFreeTimes(freeTimes.filter((event) => event.start !== selectedEvent.start && event.end !== selectedEvent.end));
    setSelectedEvent(null);
    onOpenChange();
  };

  function convertDate(unformattedDate) {
    let date = new Date(unformattedDate);

    let localYear = date.getFullYear();
    let localMonth = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    let localDay = String(date.getDate()).padStart(2, "0");

    return `${localYear}-${localMonth}-${localDay}`;
  }

  function convertTime(time) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: false };
    const convertedTime = time
      ? new Intl.DateTimeFormat("en-US", options).format(new Date(Date.UTC(2025, 0, 4, ...time.split(":").map(Number))))
      : "unknown";
    return convertedTime;
  }

  function formatTimeRange(open, close) {
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formatTime = (time) =>
      new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], options).replace(" ", "\u00A0");
    return `${formatTime(open)}\u00A0-\u00A0${formatTime(close)}`;
  }

  const isStartTimeWithinRange = () => {
    const dummyDate = "2024-01-01";

    const eventOpening = new Date(`${dummyDate}T${open}`);
    const eventClosing = new Date(`${dummyDate}T${close}`);
    const userOpening = new Date(`${dummyDate}T${startTime}`);

    // Adjust event closing time if it is after midnight
    if (eventClosing <= eventOpening) {
      eventClosing.setDate(eventClosing.getDate() + 1);
    }

    return eventOpening <= userOpening && userOpening <= eventClosing;
  };

  const isEndTimeWithinRange = () => {
    const dummyDate = "2024-01-01";

    const eventOpening = new Date(`${dummyDate}T${open}`);
    const eventClosing = new Date(`${dummyDate}T${close}`);
    const userClosing = new Date(`${dummyDate}T${endTime}`);

    // Adjust event closing time if it is after midnight
    if (eventClosing <= eventOpening) {
      eventClosing.setDate(eventClosing.getDate() + 1);
    }

    // Adjust user closing time if it is after midnight
    if (userClosing <= eventOpening) {
      userClosing.setDate(userClosing.getDate() + 1);
    }

    return eventOpening <= userClosing && userClosing <= eventClosing;
  };

  const checkOverlap = (start, end) =>
    freeTimes.find(
      (freeTime) => (start >= freeTime.start && start < freeTime.end) || (end > freeTime.start && end <= freeTime.end)
    );

  const handleOnAddPress = () => {
    if (!selectedDate || !startTime || !endTime) {
      setValidateTimes(true);
    } else if (!(isStartTimeWithinRange() && isEndTimeWithinRange())) {
      alert(`Freetime should be within possible times ${formatTimeRange(open, close)}`);
    } else {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      if (endTime < startTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
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
        setValidateTimes(false);
      }
    }
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
      setValidateTimes(true);
    } else if (!(isStartTimeWithinRange() && isEndTimeWithinRange())) {
      alert(`Freetime should be within possible times ${formatTimeRange(open, close)}`);
    } else {
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      if (endTime < startTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      const overlappingFreeTime = checkOverlap(startDateTime, endDateTime);
      if (
        overlappingFreeTime &&
        overlappingFreeTime.start !== selectedEvent.start &&
        overlappingFreeTime.end !== selectedEvent.end
      ) {
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
        setValidateTimes(false);
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

  const renderEventContent = () => {
    const startDate = moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a");
    const endDate = moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a");
    return (
      <p>
        {startDate} – {endDate}
      </p>
    );
  };
  const isSameTime = (time1, time2) => time1?.hour === time2?.hour && time1?.minute === time2?.minute;

  const isInvalidStartTime =
    (!startTime && validateTimes) || (startTime && (startTime.minute % 15 !== 0 || !isStartTimeWithinRange()));

  const isInvalidEndTime =
    (!endTime && validateTimes) ||
    (endTime && (endTime.minute % 15 !== 0 || isSameTime(startTime, endTime) || !isEndTimeWithinRange()));

  const startTimeErrorMessage = !startTime
    ? "Please enter a starting time"
    : startTime.minute % 15 !== 0
    ? "Please enter a valid time in 15-minute intervals"
    : !isStartTimeWithinRange()
    ? `Start time should be within ${formatTimeRange(open, close)}`
    : "";

  const endTimeErrorMessage = !endTime
    ? "Please enter an ending time"
    : endTime.minute % 15 !== 0
    ? "Please enter a valid time in 15-minute intervals"
    : isSameTime(startTime, endTime)
    ? "Ending time must not be equal to starting time"
    : !isEndTimeWithinRange(endTime, open, close)
    ? `End time should be within ${formatTimeRange(open, close)}`
    : "";

  const renderEditEventContent = () => {
    return (
      <>
        <I18nProvider locale="en-MY">
          <DatePicker
            isRequired
            minValue={startDate}
            maxValue={endDate}
            className="max-w-[284px] border rounded p-2"
            label="Start Date"
            value={selectedDate}
            onChange={setSelectedDate}
            isInvalid={!selectedDate && validateTimes}
            errorMessage="Please select a date"
          />
        </I18nProvider>
        <TimeInput
          isRequired
          className="max-w-[284px] border rounded p-2"
          label="Start Time"
          onChange={setStartTime}
          value={startTime}
          isInvalid={isInvalidStartTime}
          errorMessage={startTimeErrorMessage}
        />
        <TimeInput
          isRequired
          className="max-w-[284px] border rounded p-2"
          label="End Time"
          type="time"
          value={endTime}
          onChange={setEndTime}
          isInvalid={isInvalidEndTime}
          errorMessage={endTimeErrorMessage}
        />
      </>
    );
  };

  return (
    <div className="mt-6 md:mt-4 min-h-screen" ref={useOverflowHandler(790)}>
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
      <div className="date-time-container text-center overflow-x-auto">{renderEditEventContent()}</div>
      <div className="add-button-container flex justify-between items-center pt-1 pb-4 px-1 lg:px-0 md:pt-2">
        <p className="text-gray-500 text-sm">
          {open && close ? `Possible times lie between: ${formatTimeRange(open, close)}` : null}
        </p>
        <div className="flex space-x-2">
          <Button onPress={handleOnAddPress} className="mr-2">
            Add
          </Button>
          <Button color="primary" onPress={handleSavePress}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
