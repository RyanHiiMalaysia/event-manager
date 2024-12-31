

"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Accordion, AccordionItem, Link, Button } from "@nextui-org/react";


export default function Page({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [path, setPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.origin);
    }
  }, []);

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
        const response_event = await fetch(`${path}/api/events?link=${uniqueLink}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response_event.ok) throw new Error('Failed to fetch event details');


        const data_events = await response_event.json();
        if (data_events.eventData.length === 0) throw new Error('Failed to fetch event details');
        // Find the event matching the uniqueLink
        
        const matchedEvent = data_events.eventData[0]

        setEvent(matchedEvent || null); // Set null if no event matches
        
        // const response_owner = await fetch(`${path}/api/owners?owner=${matchedEvent.event_creator}`, {
        //   method: 'GET',
        //   headers: { 'Content-Type': 'application/json' },
        // });

        // const data_owner = data_events.eventData[0].event_creator;
        
        // setOwnerName(data_owner)
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
    <div className="p-10 max-w-xl mx-auto border border dark:border rounded-lg shadow-lg bg-white dark:bg-transparent">
      <h1 className="text-3xl font-bold">{event.event_title}</h1>
      <p className="text-gray-600 mt-2">Owner: {event.user_name}</p>
      <p className="text-gray-600 mt-2">
        Date: {convertDateTimeToDate(event.event_schedule_start)} - {convertDateTimeToDate(event.event_schedule_end)}
      </p>
      <p className="text-gray-600 mt-2">Duration: {convertTime(event.event_duration)}</p>
      <Accordion variant="bordered" selectionMode="multiple">
        <AccordionItem key="1" aria-label="Location" title="Location">
        <div className="max-h-40 overflow-y-auto break-words">
          <p>{event.event_location}</p>
          <p>Opening Hours: {condition(timeRange(event.event_opening_hour, event.event_closing_hour))}</p>
        </div>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Description" title="Description">
        <div className="max-h-40 overflow-y-auto break-words">{condition(event.event_description)}</div> 
        </AccordionItem>
        <AccordionItem key="3" aria-label="Deadline" title="Deadline">
        <div className="max-h-40 overflow-y-auto break-words">{condition(convertDate(event.event_deadline))}</div>
        </AccordionItem>
      </Accordion>

      <div className="mt-6">
        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          href={`/event/${uniqueLink}/schedule`}
          as={Link}
        >
          Set Your Availability
        </Button>
      </div>
    </div>
  );
}





