"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {Accordion, AccordionItem} from "@nextui-org/react";

const EventDetailsPage = ({ params }) => {
  const router = useRouter();
  const { eventId } = params; // Extract `eventId` from `params`
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const demoData = {
    event_name: 'Demo Event',
    event_duration: '01:01:00',
    event_description: 'This is a demo event used as fallback data.',
    event_max_participants: 10,
    event_location: 'Demo Location',
    event_openinghour: '09:00:00',
    event_closinghour: '17:00:00',
    event_schedule_range_start: '2023-12-01 00:00:00',
    event_schedule_range_end: '2023-12-31 00:00:00', 

    idk_deadline_name: '2023-11-01 00:00:00',

    
  };

  function convertDateTimeToDate(dateTime) {
    const date = new Date(dateTime);
    return date.toISOString().split('T')[0];
  }

  function convertTime(time) {
    const date = time.split(':')[0] + " hours " + time.split(':')[1] + " minutes " + time.split(':')[2] + " seconds";
    return date;
  }

  function timeRange(open, close) {
    if (!open || !close) {
      return null;
    }
    else if (!open) {
        return "unkown" + " - " + close;
    }
    else if (!close) {
        return open + " - " + "unknown";
    }
    return open + " - " + close;
    }

  function condition(value) {
    if (!value) {
      return "--";
    }
    return value;
  }


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Fetch failed, using demo data:', error.message);
        setEvent(demoData); // Use fallback demo data
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <p className="p-6 text-center">Loading event details...</p>;
  }

  if (!event) {
    return <p className="p-6 text-center">Event not found.</p>;
  }

  return (
    <div className="p-10 max-w-sm mx-auto border border-default-200 dark:border-default-100 rounded-lg shadow-lg bg-white dark:bg-transparent">
      <h1 className="text-3xl font-bold">{event.event_name}</h1>
      <p className="text-gray-600 mt-2">Date: {convertDateTimeToDate(event.event_schedule_range_start)} - {convertDateTimeToDate(event.event_schedule_range_end)}</p>
      <p className="text-gray-600 mt-2">Duration: {convertTime(event.event_duration)}</p>
      <Accordion variant="bordered" className="mt-4">
        <AccordionItem key="1" aria-label="Location" title="Location">
            <p>{event.event_location}</p>
            <p>Opening Hours: {condition(timeRange(event.event_openinghour, event.event_closinghour))}</p>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Description" title="Description">
            <p>{condition(event.event_description)}</p>
        </AccordionItem>
        <AccordionItem key="3" aria-label="Deadline" title="Deadline">
            <p>{condition(event.idk_deadline_name)}</p>
        </AccordionItem>
        </Accordion>

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push(`/availability/event/${eventId}`)}
        >
          Set Your Availability
        </button>
      </div>
    </div>
  );
};

export default EventDetailsPage;
