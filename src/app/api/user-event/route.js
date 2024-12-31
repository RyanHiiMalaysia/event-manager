import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
// import { getSession } from "next-auth/react";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch user events by email
async function fetchUserEvents(user_email, hasAllocated, isAdmin) {
  const sql = getDatabaseConnection();
  const boolToQuery = (bool, trueQuery, falseQuery) => (bool === null ? "" : bool ? trueQuery : falseQuery);
  const allocatedQuery = boolToQuery(
    hasAllocated,
    "AND event_allocated_start IS NOT NULL",
    "AND event_allocated_start IS NULL"
  );
  const adminQuery = boolToQuery(isAdmin, "AND ue_is_admin = TRUE", "AND ue_is_admin = FALSE");
  let query = `
  SELECT 
    event_title, 
    event_deadline, 
    event_location, 
    event_description,
    event_allocated_start,
    event_allocated_end,
    event_link,
    ue_is_admin
  FROM 
    userevent 
  NATURAL JOIN 
    events 
  WHERE 
    user_id = (
      SELECT user_id 
      FROM users 
      WHERE user_email = $1
    )
  ${allocatedQuery}
  ${adminQuery}
`;

  return await sql(query, [user_email]);
}

async function getEventID(sql, link) {
  const [eventData] = await sql`SELECT event_id FROM events WHERE event_link = ${link}`;
  return eventData.event_id;
}

async function verifyParticipation(sql, user_email, event_id) {
  const [user_id] = await sql`
    SELECT
      user_id
    FROM
      users NATURAL JOIN userevent
    WHERE
      user_email = ${user_email}
    AND
      event_id = ${event_id}
  `;
  return user_id ? true : false;
}

export async function POST(req) {
  const sql = getDatabaseConnection();
  try {
    const { user_email, event_link } = await req.json();
    const event_id = await getEventID(sql, event_link);
    const inEvent = await verifyParticipation(sql, user_email, event_id);

    if (!inEvent) {
      await sql`BEGIN`;

      await sql`
          INSERT INTO userevent (
            user_id, event_id
          ) VALUES (
            (SELECT user_id FROM users WHERE user_email = ${user_email}),
            ${event_id}
          )
        `;

      await sql`COMMIT`;

      return NextResponse.json({ message: "Successfully added into event" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "User already in event" }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    await sql`ROLLBACK`;
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const strToBool = (str) => (str === null ? null : str === "true");
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const hasAllocated = strToBool(url.searchParams.get("hasAllocated"));
    const isAdmin = strToBool(url.searchParams.get("isAdmin"));
    const eventData = await fetchUserEvents(email, hasAllocated, isAdmin);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
