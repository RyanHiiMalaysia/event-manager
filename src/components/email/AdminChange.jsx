export const AdminChange = (becomeAdmin, eventName, eventLink) => (

  <div>
    <h1>{becomeAdmin ? 'You are now an admin' : 'You are no longer an admin'}</h1>
    <p>You {becomeAdmin ? " have been made an admin of the event: " : " have been removed as an admin from the event: "}<strong>{eventName}</strong>.</p>
    <p>Here is the link : {eventLink}</p>
  </div>
);