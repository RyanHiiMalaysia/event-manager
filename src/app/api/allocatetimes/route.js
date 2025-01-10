import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

async function fetchAllocateTimes(link) {
  const sql = getDatabaseConnection();
  return await sql`
    SELECT
      at_id,
      at_start,
      at_end,
      at_participants
    FROM 
      allocatetimes
    WHERE 
      event_id = (SELECT event_id FROM events WHERE event_link = ${link})
    ORDER BY 
      at_id
  `;
}

async function updateAllocatedTime(at_id, link) {
  const sql = getDatabaseConnection();
  return await sql`
    UPDATE 
      events
    SET 
      event_allocated_start = (SELECT at_start FROM allocatetimes WHERE at_id = ${at_id}),
      event_allocated_end = (SELECT at_end FROM allocatetimes WHERE at_id = ${at_id})
    WHERE 
      event_link = ${link}
  `;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const link = url.searchParams.get("link");
    const allocateTimes = await fetchAllocateTimes(link);
    return new Response(JSON.stringify({ allocateTimes }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { link, at_id } = await req.json();
    await updateAllocatedTime(at_id, link);
    return new Response(JSON.stringify({ message: "Allocated time updated" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
