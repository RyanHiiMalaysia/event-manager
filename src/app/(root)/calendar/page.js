"use client";
import React from 'react';
import Calendar from "../../../../components/Calendar";

export default function Page() {
  // const [events, setEvents] = useState([]);
  const events = [
    {
      title: "Test Event",
      start: new Date("2024-12-19T10:00:00"),
      end: new Date("2024-12-19T12:00:00"),
    },
    {
      title: "Test Event 2",
      start: new Date("2024-12-19T10:00:00"),
      end: new Date("2024-12-19T12:00:00"),
    },
  ];

  // useEffect(() => {
  //   fetch('/api/availability')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const formattedEvents = data.map((event) => ({
  //         title: event.userEmail,
  //         start: new Date(event.startTime),
  //         end: new Date(event.endTime),
  //       }));
  //       setEvents(formattedEvents);
  //     });
  // }, []);

  return (
    <div className='bg-custom-page'>
      <h1>Shared Calendar</h1>
      <Calendar events={events}/>
    </div>
  );
}
