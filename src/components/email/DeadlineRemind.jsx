export const DeadlineRemind = (eventName, deadline, eventLink) => (
    <div>
      <h1>The deadline is coming up soon</h1>
      <p>The deadline for {eventName} is {deadline}. You still have 1 day left.</p>
      <p>Here is the link :{eventLink}</p>
    </div>
  );