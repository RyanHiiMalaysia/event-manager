export const AllocateRemind = (eventName, allocate, eventLink) => (
    <div>
      <h1>Event is allocated</h1>
      <p>The allocated time for {eventName} is {allocate}.</p>
      <p>Here is the link :{eventLink}</p>
    </div>
    );