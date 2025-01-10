export const AllocateRemind = (eventName, allocate, eventLink) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: 'navy' }}>A date and time has been allocated for your event</h1>
    <p><strong>Event name:</strong> {eventName}</p>
    <p><strong>Event date and time:</strong> {allocate}</p>
    <p>Here is the event link: <a href={eventLink} style={{ color: '#1E90FF' }}>{eventLink}</a></p>
  </div>
);