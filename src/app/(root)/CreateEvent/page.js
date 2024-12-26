'use client'
import Link from 'next/link'
import { useState } from 'react';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [startdate, setStartDate] = useState('');
  const [enddate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [minutes, setMinutes] = useState('');
  const [hours, setHours] = useState('');
  const [days, setDays] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setmaxParticipants] = useState('');
  const [operatingStart, setOperatingStart] = useState('');
  const [operatingEnd, setOperatingEnd] = useState('');

  function Division({type, title, variable, setFunction}){
    return ( <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{title}</label>
              <input
                type={type}
                value={variable}
                onChange={(e) => setFunction(e.target.value)}
                className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
              />
            </div>)
   }

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    if(!days || !hours || !minutes){
      alert('Please fill duration');
      return;
    }

    else if (!title || !startdate || !enddate || !location || !operatingStart || !operatingEnd || !maxParticipants) {
        alert('Please fill out all fields.');
        return;
      }

    else if (new Date(startdate) > new Date(enddate)) {
      alert('Start Date cannot be after End Date.');
      return;
    }
    
    else if (new Date(operatingStart) > new Date(operatingEnd)) {
        alert('Operating start tume cannot be after end time.');
        return;
      }

    setDuration(`${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({title , duration , startdate , enddate ,  maxParticipants, location ,  operatingStart ,  operatingEnd}),
    });
    

    if (response.ok) {
      alert('Event created successfully!');
      setTitle('');
      setDuration('');
      setStartDate('');
      setEndDate('');
      setLocation('');
      setmaxParticipants('');
      setOperatingStart('');
      setOperatingEnd('');
    } else {
      alert('Failed to create event.');
    }
  };


  return (
    <form onSubmit={handleCreateEvent}>
    <div className="p-4 max-w-sm mx-auto border border-gray-300 rounded-lg bg-white shadow-lg">
    <div className="p-6 max-w-lg mx-auto border border-black rounded-lg bg-transparent">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>

      <Division type="text" title="Event Title" variable={title} setFunction={setTitle} />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Duration</label>
        <Division type="number" title="Days" variable={days} setFunction={setDays} />
        <Division type="number" title="Hours" variable={hours} setFunction={setHours} />
        <Division type="number"title="Minutes" variable={minutes} setFunction={setMinutes} />
      </div>

      <Division type="textarea" title="Location" variable={location} setFunction={setLocation} />
      <Division type="number" title="Max Participants" variable={maxParticipants} setmaxParticipants={setLocation} />

      <Division type="date" title="Start Date" variable={startdate} setFunction={setStartDate} />
      <Division type="date" title="End Date" variable={enddate} setFunction={setEndDate} />
  
      <Division type="datetime-local" title="Operating Start Date Time" variable={operatingStart} setFunction={setOperatingStart} />
      <Division type="datetime-local" title="Operating End Date Time" variable={operatingEnd} setFunction={setOperatingEnd} />

      <nav className='flex justify-between items-center'>
        <Link 
        href="/event"
        className="px-4 py-2 bg-red-500 text-white rounded"
        > {/* Link to Events */}
              <span>Back</span>
          </Link>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Create Event
        </button>
      </nav>
    </div>
    </div>
    </form>
  );
};

export default CreateEvent;
