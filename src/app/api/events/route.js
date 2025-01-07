import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

async function fetchEvent(link) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT 
      event_title, 
      event_duration, 
      event_schedule_start, 
      event_schedule_end, 
      event_deadline, 
      event_max_participants, 
      event_location, 
      event_opening_hour, 
      event_closing_hour, 
      event_allocated_start,
      event_allocated_end,
      event_description, 
      event_link, 
      event_creator, 
      user_name 
    FROM 
      events 
    JOIN 
      users 
    ON 
      user_id = event_creator 
    WHERE 
      event_link = ${link}
  `;
}

async function getEventCreator(link) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT 
      event_creator 
    FROM 
      events 
    WHERE 
      event_link = ${link}
  `;
}

export async function POST(req) {
  const sql = getDatabaseConnection();
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
      edit,
    } = await req.json();

    await sql`BEGIN`;

    if (!edit) {
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
          user_id, event_id, ue_is_admin
        ) VALUES (
          ${creator}, ${eventID}, true
        )
      `;
    } else {
      await sql`
        UPDATE events
        SET
          event_title = ${title},
          event_duration = ${duration},
          event_deadline = ${deadline},
          event_max_participants = ${maxParticipants},
          event_location = ${location},
          event_description = ${description}
        WHERE
          event_link = ${link}
      `;
    }

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
    const creator = url.searchParams.get("creator");
    if (creator) {
      const eventData = await getEventCreator(link);
      return new Response(JSON.stringify({ eventData }), { status: 200 });
    }

    const eventData = await fetchEvent(link);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
