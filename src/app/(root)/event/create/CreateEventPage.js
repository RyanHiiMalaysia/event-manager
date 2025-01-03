"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Form, Input, Button, TimeInput, DateRangePicker, DatePicker, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import {Alert} from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";

const generateUniqueLink = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
  return `${timestamp}-${randomString}`;
};

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
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const { hours, minutes, startDate, deadline } = data;
    console.log(data)
    if (hours === "0" && minutes === "0") {
      alert("Event duration cannot be 0 hours and 0 minutes");
      return;
    } else if (deadline >= startDate) {
      alert("Registration deadline must be before the event start date");
      return;
    }

    const duration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const uniqueLink = generateUniqueLink();
    const convertToUTCTime = (date, time) => {
      const [hours, minutes] = time.split(':').map(Number);
      const localDate = new Date(date);
      localDate.setHours(hours, minutes, 0, 0);
      return localDate.toISOString().substring(11, 16); // Returns the time in HH:MM format
    };
    const response = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
      ...data,
      duration: duration,
      deadline: new Date(deadline).toISOString(),
      startTime: convertToUTCTime(new Date(), startTime),
      endTime: convertToUTCTime(new Date(), endTime),
      link: uniqueLink,
      creator: user.user_id,
      }),
    });

    if (response.ok) {
      setEventLink(`${path}/event/${uniqueLink}`);
      alert("Event created successfully!");
    } else {
      alert("Error creating event.");
    }
  };

  const EventLinkPopup = () => {
    if(eventLink){
      return (<div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] z-50">
                <Alert
                  color="success"
                  className="w-full h-auto flex flex-col justify-center items-center shadow-lg rounded-lg"
                  endContent={
                    <p>
                        Share this link with participants:{" "}
                        <a href={eventLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {eventLink}
                        </a>
                      </p>
                  }
                  title={<span style={{ fontSize: "1rem", fontWeight: "bold" }}>Event Created Successfully!</span>}
                  variant="faded"
                  font_size
                />
              </div>)
    }
  }


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
            description="Days where the event can take place"
            minValue={today(getLocalTimeZone())}
          />
          </I18nProvider>
          
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
                Number(value) >= 0 && Number(value) <= 59 ? validateInteger(value) : "Minutes must be between 0 and 59"
              }
            />
          </div>
          <I18nProvider locale="en-MY"><DatePicker label="Registration Deadline" name="deadline" isRequired minValue={today(getLocalTimeZone())} /></I18nProvider>
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
          <div className="flex gap-4">
          <div className="w-full">
          <Input
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
              label="Closing Time"
              list="minute-options"
              id="minutes"
              name="minutes"
              aria-label="Minutes"
              type="time"
              style={{ width: "100%", color: endTime ? "#000" : "#71717A" }}

              onChange={(e) => setEndTime(e.target.value)}
              validate={(time) =>
                time.split(":")[1] % 15 === 0 ? (endTime && startTime ? (startTime < endTime ? null : "Closing time must be greater than opening time"):"Please enter a valid time in 15-minute intervals") : "Please enter a valid time in 15-minute intervals"
              }
            />
          </div>
            
          </div>
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
      {/* {eventLink && (
                    <div
                      id="event-link-section"
                      className="mt-4 p-4 border border-green-500 rounded bg-green-50 dark:bg-green-900"
                    >
                      <p className="font-bold text-green-700">Event Created Successfully!</p>
                      <p>
                        Share this link with participants:{" "}
                        <a href={eventLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          {eventLink}
                        </a>
                      </p>
                    </div>
                  )} */}
      </div>
  );
}
