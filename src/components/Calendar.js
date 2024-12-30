import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment-timezone";
import "../../styles/calendar.css";
import WeekView from "./WeekView";

const localizer = momentLocalizer(moment);

export function EventCalendar({ events, onSelectEvent }) {
  // Adjust event times to reflect UTC+8
  const adjustedEvents = events.map((event) => ({
    ...event,
    start: moment.utc(event.start).tz('Asia/Singapore').toDate(),
    end: moment.utc(event.end).tz('Asia/Singapore').toDate(),
  }));

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={adjustedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={onSelectEvent}
        popup
      />
    </div>
  );
}

export function ScheduleCalendar({ onSelectEvent, eventRange, freeTimes }) {
  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: eventRange.start,
      views: {
        month: true,
        week: WeekView,
      },
    }),
    []
  );

  return (
    <div className="height-400">
      <Calendar
        localizer={localizer}
        events={freeTimes}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        defaultView={Views.WEEK}
        defaultDate={defaultDate}
        views={views}
        scrollToTime={defaultDate}
        popup
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}
