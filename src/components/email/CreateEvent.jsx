export const CreateEvent = (firstName, eventLink, eventTitle) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: '#000080' }}>You have successfully created an event, {firstName}!</h1>
    <p><strong>Event title:</strong> {eventTitle}</p>
    <p>Here is the event link: <a href={eventLink} style={{ color: '#1E90FF' }}>{eventLink}</a></p>
  </div>
);