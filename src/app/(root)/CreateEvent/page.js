'use client'
import Link from 'next/link'
import { useState } from 'react';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startdate, setStartDate] = useState('');
  const [enddate, setEndDate] = useState('');
  const [validitydate, setValidDate] = useState('');
  const [validitytime, setValidTime] = useState('');

  const handleCreateEvent = async () => {
    if (!title || !description || !startdate || !enddate || !validitydate || !validitytime) {
      alert('Please fill out all fields.');
      return;
    }
    else if (new Date(startdate) > new Date(enddate)) {
      alert('Start Date cannot be after End Date.');
      return;
    }
    else if (new Date(validitydate) > new Date(startdate)) {
      alert('Valid until Date cannot be after Start Date.');
      return;
    }
    
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, startdate, enddate, validitydate, validitytime }),
    });

    if (response.ok) {
      alert('Event created successfully!');
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setValidDate('');
      setValidTime('');
    } else {
      alert('Failed to create event.');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto border border-gray-300 rounded-lg bg-white shadow-lg">
    <div className="p-6 max-w-lg mx-auto border border-black rounded-lg bg-transparent">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Event Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"

        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={startdate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">End Date</label>
        <input
          type="date"
          value={enddate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Valid until Date</label>
        <input
          type="date"
          value={validitydate}
          onChange={(e) => setValidDate(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
        />
        <label className="block text-sm font-medium mb-1">Valid until Time</label>
        <input
          type="time"
          value={validitytime}
          onChange={(e) => setValidTime(e.target.value)}
          className="input text-black w-full p-1 max-w-lg mx-auto border border-black rounded-lg"
        />
      </div>
      <nav className='flex justify-between items-center'>
        <Link 
        href="/event"
        className="px-4 py-2 bg-red-500 text-white rounded"
        > {/* Link to Events */}
              <span>Back</span>
          </Link>
        <button
          onClick={handleCreateEvent}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Create Event
        </button>
      </nav>
    </div>
    </div>
  );
};

export default CreateEvent;