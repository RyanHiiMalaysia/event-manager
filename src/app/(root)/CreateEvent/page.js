'use client'
import { useState } from 'react';

const CreateEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startdate, setStartDate] = useState('');
  const [enddate, setEndDate] = useState('');
  const [validitydate, setValidDate] = useState('');
  const [validitytime, setValidTime] = useState('');

  const handleCreateEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date, time }),
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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Event Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input text-black w-full"

        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input text-black w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={startdate}
          onChange={(e) => setDate(e.target.value)}
          className="input text-black w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">End Date</label>
        <input
          type="date"
          value={enddate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input text-black w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Valid until Date</label>
        <input
          type="date"
          value={validitydate}
          onChange={(e) => setValidDate(e.target.value)}
          className="input text-black w-full"
        />
        <label className="block text-sm font-medium mb-1">Valid until Time</label>
        <input
          type="time"
          value={validitytime}
          onChange={(e) => setValidTime(e.target.value)}
          className="input text-black w-full"
        />
      </div>
      <button
        onClick={handleCreateEvent}
        className="btn-primary w-full"
      >
        Create Event
      </button>
    </div>
  );
};

export default CreateEvent;
