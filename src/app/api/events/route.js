import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";


// async function fetchEventsDetails(link) {
//   const sql = neon(`${process.env.DATABASE_URL}`);
//   return await sql('SELECT * FROM events WHERE event_link = $1', [link]);
// }

async function fetchEventsDetails() {
  const sql = neon(`${process.env.DATABASE_URL}`);
  return await sql('SELECT * FROM events');
}
export async function POST(req) {
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
      registrationDeadline,
      ownerId
    } = await req.json();

    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);

    await sql`
        INSERT INTO events (
            event_name, event_duration, event_max_participants, event_description, event_location,
            event_openingHour, event_closingHour, event_schedule_range_start, event_schedule_range_end, 
            event_link, event_deadline, event_owner
        )
        VALUES (
            ${title}, ${duration}, ${maxParticipants}, ${description}, ${location},
            ${startTime}, ${endTime}, ${startDate}, ${endDate}, ${link}, ${registrationDeadline},
            ${ownerId}
        )
        `;

    // Respond with success
    return NextResponse.json(
      { message: "Event created successfully."},
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const events = await fetchEventsDetails();
    
    return new Response(JSON.stringify({ events }), { status: 200 });
  } catch (error) {
    
    return new Response(JSON.stringify({ message: 'Failed to fetch events' }), { status: 500 });
  }
}
