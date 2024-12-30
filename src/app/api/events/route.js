import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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
      creator,
    } = await req.json();

    const [insertedEvent] = await sql`
      INSERT INTO events (
        event_title, event_duration, event_schedule_start, event_schedule_end, event_deadline, 
        event_max_participants, event_location, event_opening_hour, event_closing_hour, event_description, 
        event_link, event_creator
      ) VALUES (
        ${title}, ${duration}, ${startDate}, ${endDate}, ${deadline}, ${maxParticipants}, ${location}, ${startTime},
        ${endTime}, ${description}, ${link}, ${creator}
      ) RETURNING event_id
    `;

    const eventID = insertedEvent.event_id;

    await sql`
        INSERT INTO userevent (
          ue_user_id, ue_event_id, ue_is_admin
        ) VALUES (
          ${creator}, ${eventID}, true
        )
      `;

    await sql`COMMIT`;

    return NextResponse.json({ message: "Event created successfully." }, { status: 200 });
  } catch (error) {
    console.log(error);
    await sql`ROLLBACK`;
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
