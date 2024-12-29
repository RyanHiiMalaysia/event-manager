

"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Accordion, AccordionItem } from "@nextui-org/react";


export default function Page({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const path = "https://event-manager-opal.vercel.app";

  // Await the params when the component mounts
  useEffect(() => {
    const fetchParams = async () => {
      const uniqueLinkFromParams = (await params).uniqueLink;
      setUniqueLink(uniqueLinkFromParams);
    };

    fetchParams();
  }, [params]);

  function convertDateTimeToDate(dateTime) {
    const date = new Date(dateTime);
    return date.toISOString().split('T')[0];
  }

  function convertTime(time) {
    return `${time.hours?time.hours:"0"} hours ${time.minutes?time.minutes:"0"} minutes`;
  }

  function timeRange(open, close) {
    if (!open && !close) return "unknown";
    if (!open) return `unknown - ${close}`;
    if (!close) return `${open} - unknown`;
    return `${open} - ${close}`;
  }

  function condition(value) {
    return value || "--";
  }

  function convertDate(unformattedDate){
    let date = new Date(unformattedDate);

    // Format the date
    let formattedDate = date.toLocaleString('en-US', {
      weekday: 'long',   // Optional: Add weekday name
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Ensure the time is in 12-hour format
    }).replace(/,/, '').replace(/:/g, '.');
    return formattedDate;
  }

  useEffect(() => {
    if (!uniqueLink) return;

    const fetchEvent = async () => {
      try {
        const response_event = await fetch(`${path}/api/events`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response_event.ok) throw new Error('Failed to fetch event details');

        const data_events = await response_event.json();
           
        // Find the event matching the uniqueLink
         console.log(data_events)
        const matchedEvent = data_events.events.find((event) => event.event_link === uniqueLink);

        setEvent(matchedEvent || null); // Set null if no event matches
        
        const response_owner = await fetch(`${path}/api/owners?owner=${matchedEvent.event_owner}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data_owner = await response_owner.json();
        
        setOwnerName(data_owner)
      } catch (error) {
        console.error('Error fetching event:', error.message);
        setEvent(null); // Handle not found
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchEvent();
  }, [uniqueLink]);

  if (loading) {
    return <p className="p-6 text-center">Loading event details...</p>;
  }

  if (!event) {
    return <p className="p-6 text-center">Event not found.</p>;
  }

  return (
    <div className="p-10 max-w-sm mx-auto border border-default-200 dark:border-default-100 rounded-lg shadow-lg bg-white dark:bg-transparent">
      <h1 className="text-3xl font-bold">{event.event_name}</h1>
      <p className="text-gray-600 mt-2">Owner: {ownerName.user_name}</p>
      <p className="text-gray-600 mt-2">
        Date: {convertDateTimeToDate(event.event_schedule_range_start)} - {convertDateTimeToDate(event.event_schedule_range_end)}
      </p>
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
          <p>{condition(convertDate(event.event_deadline))}</p>
        </AccordionItem>
      </Accordion>

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push(`/availability/event/${event.event_id}`)} // Use event.event_id
        >
          Set Your Availability
        </button>
      </div>
    </div>
  );
}





