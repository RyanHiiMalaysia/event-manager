import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch all participants in an event
async function getAllParticipants(event_link) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT
      user_id as id,
      user_name as name,
      user_email as email,
      ue_is_admin as is_admin
    FROM
      users NATURAL JOIN userevent
    WHERE
      event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
    ORDER BY
      CASE 
        WHEN user_id = (SELECT event_creator FROM events WHERE event_link = $1) THEN 0
        WHEN ue_is_admin = TRUE THEN 1
        ELSE 2
      END
  `;
}

// Function to handle GET request to fetch all participants in an event
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const link = url.searchParams.get("link");
    const participants = await getAllParticipants(link);
    return NextResponse.json({ participants: participants }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
