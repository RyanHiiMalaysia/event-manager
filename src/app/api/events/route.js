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

async function getForceAdmin(link) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT 
      event_force_admin,
      event_allocated_start
    FROM 
      events 
    WHERE 
      event_link = ${link}
  `;
}

async function fetchUserEventAndPaymentDetails(userId) {
  const sql = getDatabaseConnection();
  const result = await sql`
    SELECT user_events_created, user_has_paid 
    FROM users 
    WHERE user_id = ${userId}
  `;
  return {
    userEventsCreated: result[0]?.user_events_created || 0,
    userHasPaid: result[0]?.user_has_paid || false,
  };
}

async function checkIsEventPast(link) {
  const sql = getDatabaseConnection();
  const result = await sql`
    SELECT event_id 
    FROM events
    WHERE     event_link = ${link}
          AND event_allocated_end IS NOT NULL
          AND event_allocated_end < NOW()
    `;

  return result[0] ? true : false;
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
      forceAdmin,
    } = await req.json();

    const { userEventsCreated, userHasPaid } = await fetchUserEventAndPaymentDetails(creator);

    if (!userHasPaid && userEventsCreated >= 5) {
      return NextResponse.json({ message: "Free users can only create up to 5 events." }, { status: 403 });
    }

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

      await sql`
        UPDATE users
        SET user_events_created = user_events_created + 1
        WHERE user_id = ${creator}
      `;
    } else if (edit && forceAdmin !== undefined) {
      await sql`
        UPDATE events SET event_force_admin = ${forceAdmin} WHERE event_link = ${link}`;
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
    const past = url.searchParams.get("past");
    const forceAdmin = url.searchParams.get("forceAdmin");

    if (creator) {
      const eventData = await getEventCreator(link);
      return new Response(JSON.stringify({ eventData }), { status: 200 });
    }
    if (past) {
      const result = await checkIsEventPast(link);
      return new Response(JSON.stringify({ result: result }), { status: 200 });
    }
    if (forceAdmin) {
      const result = await getForceAdmin(link);
      return new Response(JSON.stringify({ result: result }), { status: 200 });
    }

    const eventData = await fetchEvent(link);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
