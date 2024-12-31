import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

async function getUserID(sql, email) {
  const [userData] = await sql`SELECT user_id FROM users WHERE user_email = ${email}`;
  return userData.user_id;
}

async function getEventID(sql, link) {
  const [eventData] = await sql`SELECT event_id FROM events WHERE event_link = ${link}`;
  return eventData.event_id;
}

async function getUsereventID(sql, user_id, event_id) {
  const [usereventData] = await sql`SELECT ue_id FROM userevent WHERE user_id = ${user_id} AND event_id = ${event_id}`;
  return usereventData.ue_id;
}

// Function to fetch the freetimes of a user for a specific event
async function fetchFreetimes(user_email, event_link) {
  const sql = getDatabaseConnection();
  const user_id = await getUserID(sql, user_email);
  const event_id = await getEventID(sql, event_link);
  console.log(user_id, event_id);
  const query = sql`
    SELECT
        ft_start as start,
        ft_end as end
    FROM 
        freetimes NATURAL JOIN userevent
    WHERE
        user_id = ${user_id} AND event_id = ${event_id}
    `;
  return await query;
}

export async function POST(req) {
  const sql = getDatabaseConnection();
  try {
    const { user_email, event_link, freetimes } = await req.json();
    const user_id = await getUserID(sql, user_email);
    const event_id = await getEventID(sql, event_link);
    const ue_id = await getUsereventID(sql, user_id, event_id);

    await sql `BEGIN`
    await sql`
      DELETE FROM freetimes
      WHERE ue_id = ${ue_id}
    `;

    freetimes.forEach(async (freetime) => {
      await sql`
        INSERT INTO freetimes (
          ue_id, ft_start, ft_end
        )
        VALUES (${ue_id}, ${freetime.start}, ${freetime.end})
      `;
    });
    await sql`COMMIT`;

    return NextResponse.json({ message: "Free times updated successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    await sql`ROLLBACK`;
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const link = url.searchParams.get("link");
    const freeTimes = await fetchFreetimes(email, link);
    return new Response(JSON.stringify({ freeTimes }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
