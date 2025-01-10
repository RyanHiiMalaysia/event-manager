export const RemoveParticipants = (adminName, eventName, eventLink) => (

    <div>
      <h1>You have been removed as a particpant from the event</h1>
      <p>{adminName} has removed you from {eventName}.</p>
      <p>Here is the event link: {eventLink}</p>
    </div>
  );