export const CreateEvent = ( firstName, eventLink ) => (
  <div>
    <h1>You have successfully created an event, {firstName}!</h1>
    <p>Here is your event link: {eventLink}</p>
  </div>
);

export const SignUpAccount = (firstName) => (
  <div>
    <h1>Hello, {firstName}</h1>
    <p>Thanks for using Allocato!</p>
  </div>
);

export const CancelEvent = (eventName, eventOwnerName, time, timeType) => (
<div>
  <h1>Cancel event </h1>
  <p>{eventOwnerName} cancelled event({eventName})</p>
  <p>{timeType}: {time}</p>
</div>
);

export const DeadlineRemind = (eventName, deadline, eventLink) => (
<div>
  <h1>The deadline is coming up soon</h1>
  <p>The deadline for {eventName} is {deadline}. You still have 2 days left.</p>
  <p>Here is the link :{eventLink}</p>
</div>
);

export const AllocateRemind = (eventName, allocate, eventLink) => (
<div>
  <h1>Event is allocated</h1>
  <p>The allocated time for {eventName} is {allocate}.</p>
  <p>Here is the link :{eventLink}</p>
</div>
);