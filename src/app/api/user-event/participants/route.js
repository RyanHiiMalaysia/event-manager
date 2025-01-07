import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch all participants in an event
async function getAllParticipants(event_link, isAdmin) {
  const sql = getDatabaseConnection();
  const boolToQuery = (bool, trueQuery, falseQuery) => (bool === null ? "" : bool ? trueQuery : falseQuery);
  const adminQuery = boolToQuery(isAdmin, "AND ue_is_admin = TRUE", "AND ue_is_admin = FALSE");
  const query = `
      SELECT
        user_name,
        user_email,
        ue_is_admin
      FROM
        users NATURAL JOIN userevent
      WHERE
        event_id = (SELECT event_id FROM events WHERE event_link = $1)
      ${adminQuery}
    `;
  return await sql(query, [event_link]);
}

// Function to handle GET request to fetch all participants in an event
export async function GET(req) {
  try {
    const strToBool = (str) => (str === null ? null : str === "true");
    const url = new URL(req.url);
    const link = url.searchParams.get("link");
    const isAdmin = strToBool(url.searchParams.get("isAdmin"));
    const participants = await getAllParticipants(link, isAdmin);
    return NextResponse.json({ participants: participants }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
