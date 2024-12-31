import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to get the userevent ID of a user for a specific event
async function getUsereventID(sql, email, link) {
  const [{ ue_id }] = await sql`
    SELECT 
      ue_id 
    FROM 
      userevent 
    WHERE 
      user_id = (SELECT user_id FROM users WHERE user_email = ${email}) 
    AND 
      event_id = (SELECT event_id FROM events WHERE event_link = ${link})
    `;
  return ue_id;
}

// Function to get the freetimes of a user for a specific event
async function fetchFreetimes(user_email, event_link) {
  const sql = getDatabaseConnection();
  const query = sql`
    SELECT
      ft_start as start,
      ft_end as end
    FROM 
      freetimes NATURAL JOIN userevent
    WHERE
      user_id = (SELECT user_id FROM users WHERE user_email = ${user_email})
    AND 
      event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
    `;
  return await query;
}

// Function to update the freetimes of a user for a specific event
async function updateFreetimes(sql, ue_id, freetimes) {
  await sql`BEGIN`;

  await sql`DELETE FROM freetimes WHERE ue_id = ${ue_id}`;

  freetimes.forEach(async (freetime) => {
    await sql`
      INSERT INTO freetimes (
        ue_id, ft_start, ft_end
      )
      VALUES (${ue_id}, ${freetime.start}, ${freetime.end})
    `;
  });

  await sql`COMMIT`;
}

// Function to handle the GET request to fetch the freetimes of a user for a specific event
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const link = url.searchParams.get("link");

    const freeTimes = await fetchFreetimes(email, link);
    return new Response(JSON.stringify({ freeTimes }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}

// Function to handle the POST request to update the freetimes of a user for a specific event
export async function POST(req) {
  const sql = getDatabaseConnection();
  try {
    const { user_email, event_link, freetimes } = await req.json();
    const ue_id = await getUsereventID(sql, user_email, event_link);

    await updateFreetimes(sql, ue_id, freetimes);
    return NextResponse.json({ message: "Free times updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    await sql`ROLLBACK`;
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
