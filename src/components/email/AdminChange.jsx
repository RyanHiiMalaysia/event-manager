export const AdminChange = (becomeAdmin, eventName, eventLink) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: 'navy' }}>{becomeAdmin ? 'You are now an admin' : 'You are no longer an admin'}</h1>
    <p>You {becomeAdmin ? "have been made an admin of the event: " : "have been removed as an admin from the event: "}<strong>{eventName}</strong>.</p>
    <p>Here is the event link: <a href={eventLink} style={{ color: '#1E90FF' }}>{eventLink}</a></p>
  </div>
);