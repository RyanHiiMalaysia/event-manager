import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

async function fetchEventsDetails() {
  const sql = neon(`${process.env.DATABASE_URL}`);
  return await sql("SELECT * FROM events");
}

async function fetchEventDetails(link) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  return await sql("SELECT * FROM events WHERE event_link = $1", [link]);
}

export async function POST(req) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  try {
    const {
      title,
      startDate,
      endDate,
      duration,
      location,
      startTime,
      endTime,
      maxParticipants,
      description,
      link,
      deadline,
      ownerId,
    } = await req.json();

    await sql`
        INSERT INTO events (
            event_title, event_duration, event_schedule_start, event_schedule_end, event_deadline, 
            event_max_participants, event_location, event_opening_hour, event_closing_hour, event_description, 
            event_link, event_creator
        )
        VALUES (
            ${title}, ${duration}, ${startDate}, ${endDate}, ${deadline}, ${maxParticipants}, ${location}, ${startTime},
             ${endTime}, ${description}, ${link}, ${ownerId}
        )
        `;

    // Respond with success
    return NextResponse.json({ message: "Event created successfully." }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const link = url.searchParams.get("link");
    const eventData = await fetchEventDetails(link);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
