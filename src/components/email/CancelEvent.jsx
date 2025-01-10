export const CancelEvent = (eventName, eventOwnerName, time, timeType) => (
    <div>
      <h1>Cancel event </h1>
      <p>{eventOwnerName} cancelled event({eventName})</p>
      <p>{timeType}: {time}</p>
    </div>
    );