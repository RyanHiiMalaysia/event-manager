export const DeadlineRemind = (eventName, deadline, eventLink) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: 'navy' }}>A deadline for an event is coming up soon</h1>
    <p>The deadline for <strong>{eventName}</strong> is <strong>{deadline}</strong>. You have <strong>less than a day left</strong> to set or change your availability.</p>
    <p>Here is the event link: <a href={eventLink} style={{ color: '#1E90FF' }}>{eventLink}</a></p>
  </div>
);