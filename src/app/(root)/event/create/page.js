"use client";
import {
  Form,
  Input,
  Button,
  TimeInput,
  DateRangePicker,
  DatePicker,
  Textarea,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useSession } from "next-auth/react";

const generateUniqueLink = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomString}`;
};

export default function Page() {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventLink, setEventLink] = useState("");
  const [user, setUser] = useState(null);
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchUserDetails = async () => {
        if (status === 'authenticated' && session?.user?.email) {
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
            setError('An unexpected error occurred.');
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      };
  
      fetchUserDetails();
    }, [status, session]);
  
    if (status === 'loading' || loading) {
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
    const { hours, minutes, startDate, registrationDeadline } = data;

    if (hours === "0" && minutes === "0") {
      alert("Event duration cannot be 0 hours and 0 minutes");
      return;
    } else if (registrationDeadline >= startDate) {
      alert("Registration deadline must be before the event start date");
      return;
    }

    const duration = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;

    const uniqueLink = generateUniqueLink();

    const response = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        duration: duration,
        startTime: startTime?.toString(),
        endTime: endTime?.toString(),
        link:uniqueLink,
        ownerId:user.user_id
      }),
    });

    if(response.ok){
      setEventLink(`${window.location.origin}/event/${uniqueLink}`); 
      alert("Event created successfully!");
    }else{
      alert("Error creating event.");
    }

  };

  const validateInteger = (value) =>
    Number.isInteger(Number(value)) ? null : "Please enter an integer";

  return (
    <div>
    <Form
      onSubmit={onSubmit}
      validationBehavior="native"
      className="w-full justify-center items-center w-full space-y-4 bg-gray-100 dark:bg-black"
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
        <DateRangePicker
          label="Event Range"
          startName="startDate"
          endName="endDate"
          labelPlacement="outside"
          isRequired
          description="Days where the event can take place"
          minValue={today(getLocalTimeZone())}
        />
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
        <DatePicker
          label="Registration Deadline"
          name="registrationDeadline"
          isRequired
          granularity="minute"
        />
        <Input
          label="Participant Limit"
          labelPlacement="outside"
          name="maxParticipants"
          isRequired
          type="number"
          placeholder="Enter maximum participants"
          validate={(value) =>
            Number(value) > 0
              ? validateInteger(value)
              : "Please enter a valid number"
          }
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
          <TimeInput label="Opening Time" onChange={setStartTime} />
          <TimeInput
            label="Closing Time"
            onChange={setEndTime}
            isInvalid={endTime && startTime ? endTime <= startTime : false}
            errorMessage="Closing time must be greater than opening time"
          />
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

    {eventLink && (
  <div
    className="fixed bottom-0 left-0 right-0 p-4 bg-green-50 dark:bg-green-900 border-t border-green-500 shadow-lg"
  >
    <p className="font-bold text-green-700 text-center">
      Event Created Successfully!
    </p>
    <p className="text-center">
      Share this link with participants:{" "}
      <a
        href={eventLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline break-all"
      >
        {eventLink}
      </a>
    </p>
  </div>
)}
    </div>
  ); 
}
