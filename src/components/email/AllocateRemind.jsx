export const AllocateRemind = (eventName, allocate, eventLink) => (
    <div>
      <h1>A date and time has been allocated for your event</h1>
      <p>Event name: {eventName}</p>
      <p>Event date and time: {allocate}</p>
      <p>Here is the event link: {eventLink}</p>
    </div>
    );