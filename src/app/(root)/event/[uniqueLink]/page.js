

"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Accordion, AccordionItem } from "@nextui-org/react";
import { fetchEvent } from '@/utils/fetchEvent';
import React from 'react';


export default function Page({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState('');
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    const fetchParams = async () => {
      const uniqueLinkFromParams = (await params).uniqueLink;
      setUniqueLink(uniqueLinkFromParams);
    };

    fetchParams();
  }, [params]);

  function convertDateTimeToDate(dateTime) {
    const date = new Date(dateTime);
    console.log(dateTime)
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

    const fetchSpecificEvent = async () => {

      try {

        //For the event
       
        const matchedEvent = await fetchEvent("event_link", uniqueLink);
      
        setEvent(matchedEvent || null); // Set null if no event matches
        
        //setEventId(event.event_id);

        //For the event creator
        const response_owner = await fetch(`${window.location.origin}/api/owners?owner=${matchedEvent.event_creator}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response_owner.ok) throw new Error('Failed to fetch event creator');

        const data_owner = await response_owner.json();
        setOwnerName(data_owner);

      } catch (error) {
        console.error('Error fetching event:', error.message);
        setEvent(null); // Handle not found
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchSpecificEvent();
  }, [uniqueLink]);
  
  if (loading) {
    return <p className="p-6 text-center">Loading event details...</p>;
  }

  if (!event) {
    return <p className="p-6 text-center">Event not found.</p>;
  }

  const handleSetAvailability = () => {
    router.push(`/datepicker/${event.event_id}`); // Correct the route here to include the event's unique identifier
  };

  console.log(event)
  return (
    <div className="p-10 max-w-sm mx-auto border border-default-200 dark:border-default-100 rounded-lg shadow-lg bg-white dark:bg-transparent">
      <h1 className="text-3xl font-bold">{event.event_title}</h1>
      <p className="text-gray-600 mt-2">Owner: {ownerName.user_name}</p>
      <p className="text-gray-600 mt-2">
        Date: {convertDate(event.event_schedule_start)} - {convertDate(event.event_schedule_end)}
      </p>
      <p className="text-gray-600 mt-2">Duration: {convertTime(event.event_duration)}</p>
      <Accordion variant="bordered" className="mt-4">
        <AccordionItem key="1" aria-label="Location" title="Location">
          <p>{event.event_location}</p>
          <p>Opening Hours: {condition(timeRange(event.event_opening_hour, event.event_closing_hour))}</p>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Description" title="Description">
          <p>{condition(event.event_description)}</p>
        </AccordionItem>
        <AccordionItem key="3" aria-label="Deadline" title="Deadline">
          <p>{condition(convertDateTimeToDate(event.event_deadline))}</p>
        </AccordionItem>
      </Accordion>

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSetAvailability} // Use event.event_id
        >
          Set Your Availability
        </button>

        
        
      </div>
    </div>
  );
}







