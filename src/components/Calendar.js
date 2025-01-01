"use client";
import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "../../styles/calendar.css";
import WeekView from "./WeekView";

const localizer = momentLocalizer(moment);

export function EventCalendar({ events, onSelectEvent }) {
  const { views } = useMemo(
    () => ({
      views: {
        day: true,
        week: WeekView,
        month: true,
      },
    }),
    []
  );
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      onSelectEvent={onSelectEvent}
      views={views}
      popup
    />
  );
}

export function ScheduleCalendar({ onSelectEvent, eventRange, freeTimes }) {
  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: eventRange.start,
      views: {
        day: true,
        week: WeekView,
        month: true,
      },
    }),
    []
  );

  return (
    <Calendar
      localizer={localizer}
      events={freeTimes}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500}}
      defaultDate={defaultDate}
      views={views}
      scrollToTime={defaultDate}
      popup
      onSelectEvent={onSelectEvent}
    />
  );
}
