"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Error from "next/error";
import { Form, Input, Button, DatePicker, Textarea } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

export default function Page() {
  const { data: session, status } = useSession();
  const [eventLink, setEventLink] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [path, setPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 3];
      setEventLink(eventLink);
      setPath(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const response = await fetch(
          `/api/user-event?findIsUserIn=true&isAdmin=true&link=${eventLink}&email=${session.user.email}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }
        setIsAdmin(result.result);
        if (result.result) {
          const response = await fetch(`/api/events?link=${eventLink}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const result = await response.json();
          if (!response.ok) {
            setError(result.message);
            return;
          }
          setEventData(result.eventData[0]);
        }
      } catch (error) {
        setError(error);
      } finally {
        setDataFetched(true);
      }
    };

    if (session && eventLink && !dataFetched) {
      fetchAdminStatus();
    }
  }, [session, eventLink, path, dataFetched]);

  const validateInteger = (value) => (Number.isInteger(Number(value)) ? null : "Please enter an integer");

  const onSubmit = async (event) => {
    // Helper functions to convert data to the required format
    const getDeadlineDateTime = (deadline) => new Date(deadline + "T00:00:00").toISOString();
    const getDuration = (hours, minutes) => `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const convertHourToMinute = (time) => {
      return Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
    };
    const convertToAmPm = (time) => {
      const [hour, minute] = time.split(":").map(Number);
      const ampm = hour >= 12 ? "PM" : "AM";
      const adjustedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };
    const convertDurationToHoursAndMinutes = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours} hours ${minutes} minutes`;
    };
    const getDifference = () =>
      convertHourToMinute(eventData.event_closing_hour) - convertHourToMinute(eventData.event_opening_hour);

    // Get the form data and validate it
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));

    const { hours, minutes, deadline } = data;
    if (hours === "0" && minutes === "0") {
      alert("Event duration cannot be 0 hours and 0 minutes");
      return;
    } else if (getDeadlineDateTime(deadline) >= eventData.event_schedule_start) {
      alert("Registration deadline must be before the event start date");
      return;
    } else if (getDifference() < Number(hours) * 60 + Number(minutes)) {
      const openingHourAmPm = convertToAmPm(eventData.event_opening_hour);
      const closingHourAmPm = convertToAmPm(eventData.event_closing_hour);
      const difference = convertDurationToHoursAndMinutes(getDifference());
      alert(
        `The event duration must not exceed the time difference of ${difference} (${openingHourAmPm} - ${closingHourAmPm}).`
      );
      return;
    }
    // Send the data to the server
    const response = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        duration: getDuration(hours, minutes),
        deadline: getDeadlineDateTime(deadline),
        link: eventLink,
        edit: true,
      }),
    });

    if (response.ok) {
      alert("Event updated successfully!");
    } else {
      alert("Error updating event.");
    }
  };

  if (status === "loading" || !dataFetched) {
    return null;
  } else if (!isAdmin) {
    return <Error statusCode={403} title="You do not have permission to view this page" />;
  } else {
    return (
      <div>
        <Form
          onSubmit={onSubmit}
          validationBehavior="native"
          className="w-full justify-center items-center w-full space-y-4 bg-gray-100 dark:bg-black p-4 "
        >
          <div className="flex flex-col gap-4 max-w-md p-4 border border-default-200 dark:border-default-100 rounded-lg shadow-lg bg-white dark:bg-transparent">
            <Input
              label="Event Title"
              labelPlacement="outside"
              name="title"
              isRequired
              placeholder="Enter event title"
              defaultValue={eventData.event_title}
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) {
                  return "Please enter a title";
                }
              }}
            />
            <I18nProvider locale="en-MY">
              <DatePicker
                label="Registration Deadline"
                name="deadline"
                isRequired
                minValue={today(getLocalTimeZone()).add({ days: 1 })}
                defaultValue={parseDate(eventData.event_deadline.split("T")[0]).add({ days: 1 })}
              />
            </I18nProvider>
            <div className="group flex flex-col data-[has-helper=true]:pb-[calc(theme(fontSize.tiny)_+8px)] gap-y-1.5 w-full">
              <span
                id="react-aria7747362092-:r6:"
                data-slot="label"
                className="block subpixel-antialiased text-small group-data-[required=true]:after:content-['*'] group-data-[required=true]:after:text-danger group-data-[required=true]:after:ml-0.5 group-data-[invalid=true]:text-danger w-full text-foreground"
              >
                Event Duration
              </span>
              <div className="flex gap-4">
                <Input
                  label="Hours"
                  name="hours"
                  isRequired
                  type="number"
                  placeholder="Enter event hours"
                  validate={(value) =>
                    Number(value) >= 0 && Number(value) <= 23
                      ? validateInteger(value)
                      : "Hours must be between 0 and 23"
                  }
                  defaultValue={eventData.event_duration.hours ?? 0}
                />
                <Input
                  label="Minutes"
                  name="minutes"
                  isRequired
                  type="number"
                  placeholder="Enter event minutes"
                  validate={(value) =>
                    Number(value) >= 0 && Number(value) <= 59
                      ? validateInteger(value)
                      : "Minutes must be between 0 and 59"
                  }
                  defaultValue={eventData.event_duration.minutes ?? 0}
                />
              </div>
            </div>
            <Input
              label="Participant Limit"
              labelPlacement="outside"
              name="maxParticipants"
              isRequired
              type="number"
              placeholder="Enter maximum participants"
              defaultValue={eventData.event_max_participants}
              validate={(value) => (Number(value) > 0 ? validateInteger(value) : "Please enter a valid number")}
            />
            <Input
              label="Location"
              labelPlacement="outside"
              name="location"
              isRequired
              placeholder="Enter event location"
              defaultValue={eventData.event_location}
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) {
                  return "Please enter a title";
                }
              }}
            />
            <Textarea
              label="Description"
              labelPlacement="outside"
              name="description"
              placeholder="Enter event description"
              defaultValue={eventData.event_description}
            />
            <Button type="submit" color="primary" className="self-end">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
