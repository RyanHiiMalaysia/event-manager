export const CancelEvent = (eventName, eventOwnerName, time, timeType) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: 'navy' }}>An event has been cancelled</h1>
    <p><strong>{eventOwnerName}</strong> has cancelled the event <strong>{eventName}</strong>.</p>
    <p><strong>{timeType}:</strong> {time}</p>
  </div>
);