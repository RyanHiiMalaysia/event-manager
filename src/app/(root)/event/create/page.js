"use client";
import {
  Form,
  Input,
  Button,
  TimeInput,
  DateRangePicker,
} from "@nextui-org/react";
import React, { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";

export default function Page() {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const { hours, minutes} = data;
    const duration = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}`;
    
    const response = await fetch("/api/create-event", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        duration: duration,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      }),
    });

    response.ok ? alert("Event created successfully!") : alert("Error creating event.");
  };

  const validateInteger = (value) =>
    Number.isInteger(Number(value)) ? null : "Please enter an integer";

  return (
    <Form
      onSubmit={onSubmit}
      validationBehavior="native"
      className="w-full justify-center items-center w-full space-y-4"
    >
      <div className="flex flex-col gap-4 max-w-md p-4 border border-default-200 dark:border-default-100 rounded-lg">
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
          description="Date range users can select"
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
  );
}
