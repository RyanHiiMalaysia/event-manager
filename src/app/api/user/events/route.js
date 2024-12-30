import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
// import { getSession } from "next-auth/react";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch user events by email
async function fetchUserEvents(user_email) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT 
      event_title, 
      event_deadline, 
      event_location, 
      event_description,
      event_allocated_time,
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
        WHERE user_email = ${user_email}
      )
  `;
}

export async function POST(req) {
  const sql = getDatabaseConnection();
  try {
    const { user_id, event_id } = await req.json();

    await sql`BEGIN`;

    await sql`
        INSERT INTO userevent (
          ue_user_id, ue_event_id
        ) VALUES (
          ${user_id}, ${event_id}
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
  // const session = await getSession({ req });

  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    // if (session.user.email !== email) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }
    const eventData = await fetchUserEvents(email);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
