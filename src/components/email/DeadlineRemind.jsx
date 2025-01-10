export const DeadlineRemind = (eventName, deadline, eventLink) => (
    <div>
      <h1>The deadline is coming up soon</h1>
      <p>The deadline for {eventName} is {deadline}. You have <strong>less than a day left</strong> to set or change your availability.</p>
      <p>Here is the link :{eventLink}</p>
    </div>
  );