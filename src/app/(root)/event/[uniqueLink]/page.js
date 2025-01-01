

"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'
import { Accordion, AccordionItem, Link, Button, Alert} from "@nextui-org/react";


export default function Page({ params }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueLink, setUniqueLink] = useState('');
  const [path, setPath] = useState("");
  const { data: session, status } = useSession();
  const [hasFetchedUser, setHasFetchedUser] = useState(false);
  const [isUserIn, setIsUserIn] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(true);


  const handleJoin = async() => {
    console.log('Joined the event');

    const response_add_user = await fetch(`/api/user-event?email=${session.user.email}&eventLink=${uniqueLink}`,{
        method: "POST",
        body: JSON.stringify({
          user_email:session.user.email, 
          event_link:uniqueLink
        }),
      })

    if(!response_add_user)throw new Error('Failed to add user to this event'); 
    else{
      setIsUserIn(true);
      setIsAlertVisible(false)
    }
    setIsAlertVisible(false)
  };

  const handleDecline = () => {
    console.log('Declined the event');
    redirect('/event') 
  };
  
  const InvitationPopup = () =>{
    if(!isUserIn && isAlertVisible){
      return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[50%] max-w-[600px] h-auto flex justify-center items-center">
        <Alert
            color="primary"
            className="w-[80%] max-w-[600px] h-[400px] flex justify-center items-center"
            endContent={
                <div className="flex justify-center w-full space-x-4">
                <Button color="warning" size="auto" variant="flat" onPress={handleJoin}>
                    Join
                </Button>
                <Button color="warning" size="auto" variant="flat" onPress={handleDecline}>
                  Decline
                </Button>
            </div>
            }
        title="You are invited to this event"
        variant="faded"
      />
    </div>
      );
    }
        
  }

  const SetAvailabilityButton = () => {
    if(isUserIn){
      return (<div className="mt-6">
              <Button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                href={`/event/${uniqueLink}/schedule`}
                as={Link}
              >
                Set Your Availability
              </Button>
            </div>)
    }
  }

  
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
    if (!uniqueLink || status !== 'authenticated' || !session?.user?.email) return;
    
    const fetchUser = async () => {
      if (hasFetchedUser) return; // Prevent duplicate calls
      setHasFetchedUser(true);
        try {
          const response = await fetch(`/api/user-event?email=${session.user.email}&eventLink=${uniqueLink}`);
          const statusCode = response.status;

          if(statusCode === 404){
            setIsUserIn(false);
            
          }else{
            setIsUserIn(true);
          }
        } catch (error) {
          console.log(error)
        } 
    };

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
        
      } catch (error) {
        console.error('Error fetching event:', error.message);
        setEvent(null); // Handle not found
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchEvent();
    fetchUser();
  }, [uniqueLink, status, session]);

  if (loading) {
    return <p className="p-6 text-center">Loading event details...</p>;
  }

  if (!event) {
    return <p className="p-6 text-center">Event not found.</p>;
  }

  return (
    <div className="flex">
    <InvitationPopup />
    <div className="flex-grow  p-20 max-w-xl mx-auto border border dark:border rounded-lg shadow-lg bg-white dark:bg-transparent">
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
      <SetAvailabilityButton/>
      {/* <div className="mt-6">
        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          href={`/event/${uniqueLink}/schedule`}
          as={Link}
        >
          Set Your Availability
        </Button>
      </div> */}
    </div>
    </div>
  );
}





