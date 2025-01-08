"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Form, Input, Button, TimeInput, DateRangePicker, DatePicker, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Alert } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import ReactDOMServer from 'react-dom/server';

const generateUniqueLink = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
  return `${timestamp}-${randomString}`;
};

const sendEmail = async (email, layout, subject) => {
  try {
    const htmlContent = ReactDOMServer.renderToString(layout);

    const response = await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_email: email, layout: htmlContent , subject: subject }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
const EmailTemplate = ( firstName, eventLink ) => (
  <div>
    <h1>You have successfully created an event, {firstName}!</h1>
    <p>Here is your event link: {eventLink}</p>
  </div>
);
export default function CreateEventPage() {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventLink, setEventLink] = useState("");
  const [user, setUser] = useState(null);
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (eventLink) {
      const linkSection = document.getElementById("event-link-section");
      if (linkSection) {
        linkSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [eventLink]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const response = await fetch(`/api/user?email=${session.user.email}`);
          if (!response.ok) {
            const result = await response.json();
            setError(result.message);
            setLoading(false);
            return;
          }
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          setError("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (session && !dataFetched) {
      fetchUserDetails();
      setDataFetched(true);
    }
  }, [status, session, dataFetched]);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading......</div>;
  }

  const onSubmit = async (event) => {
    // Helper functions to convert data to the required format
    const convertToUTCTime = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);
      return localDate.toISOString().substring(11, 16); // Returns the time in HH:MM format
    };
    const getDeadlineDateTime = (deadline) => new Date(deadline + "T00:00:00").toISOString();
    const getDuration = (hours, minutes) => `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const convertHourToMinute = (time) => { return (Number(time.hour) * 60 + Number(time.minute)) }

    // Get the form data and validate it
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const { hours, minutes, startDate, deadline } = data;
    if (hours === "0" && minutes === "0") {
      alert("Event duration cannot be 0 hours and 0 minutes");
      return;
    } else if (deadline >= startDate) {
      alert("Registration deadline must be before the event start date");
      return;
    } else if (convertHourToMinute(endTime) - convertHourToMinute(startTime) < Number(hours) * 60 + Number(minutes)) {
      alert("The event duration must not exceed the time difference between the starting and ending times.");
      return;
    }

    // Send the data to the server
    const uniqueLink = generateUniqueLink();
    const response = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        duration: getDuration(hours, minutes),
        deadline: getDeadlineDateTime(deadline),
        startTime: convertToUTCTime(startTime.toString()),
        endTime: convertToUTCTime(endTime.toString()),
        link: uniqueLink,
        creator: user.user_id,
      }),
    });

    if (response.ok) {
      const eventLink = `${path}/event/${uniqueLink}`;
      setEventLink(eventLink);
      alert("Event created successfully!");
      await sendEmail(session.user.email, EmailTemplate(session.user.chosenName, eventLink) , "Event Created Successfully!");
    } else {
      const result = await response.json();
      alert(result.message || "Error creating event.");
    }
  };

  const EventLinkPopup = () => {
    const [isVisible, setIsVisible] = React.useState(true);
    if (eventLink) {
      return (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] z-50">
          {isVisible ? (
            <Alert
            color="success"
            className="w-full h-auto flex flex-col justify-center items-center shadow-lg rounded-lg"
            onClose={() => setIsVisible(false)}
            endContent={
              <p>
                Share this link with participants:

                <a href={eventLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">

                  {eventLink}
                </a>
              </p>
            }
            title="Event created successfully!"
            variant="faded"
            font_size
          />
          ) : null}

        </div>
      );
    }
  };

  const validateInteger = (value) => (Number.isInteger(Number(value)) ? null : "Please enter an integer");

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
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Please enter a title";
              }
            }}
          />
          <I18nProvider locale="en-MY">
            <DateRangePicker
              label="Event Range"
              startName="startDate"
              endName="endDate"
              labelPlacement="outside"
              isRequired
              description="What dates will work?"
              minValue={today(getLocalTimeZone()).add({ days: 1 })}
            />
          </I18nProvider>
          <div className="flex gap-4">
            <TimeInput
              label="Starting Time"
              onChange={setStartTime}
              description="What times will work?"
              isRequired
            />
            <TimeInput
              label="Ending Time"
              onChange={setEndTime}
              isInvalid={endTime && startTime ? endTime <= startTime : false}
              errorMessage="Ending time must be greater than starting time"
              isRequired
            />
          </div>
          <I18nProvider locale="en-MY">
            <DatePicker
              label="Registration Deadline"
              name="deadline"
              isRequired
              minValue={today(getLocalTimeZone()).add({ days: 1 })}
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
                  Number(value) >= 0 && Number(value) <= 23 ? validateInteger(value) : "Hours must be between 0 and 23"
                }
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
            validate={(value) => (Number(value) > 0 ? validateInteger(value) : "Please enter a valid number")}
          />
          <Input
            label="Location"
            labelPlacement="outside"
            name="location"
            isRequired
            placeholder="Enter event location"
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
          />
          <Button type="submit" color="primary" className="self-end">
            Submit
          </Button>
        </div>
      </Form>
      <EventLinkPopup />
    </div>
  );
}