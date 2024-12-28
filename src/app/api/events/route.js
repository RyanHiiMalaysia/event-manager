import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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
      registrationDeadline
    } = await req.json();

    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
        INSERT INTO events (
            event_name, event_duration, event_max_participants, event_description, event_location,
            event_openingHour, event_closingHour, event_schedule_range_start, event_schedule_range_end, 
            event_link, event_deadline
        )
        VALUES (
            ${title}, ${duration}, ${maxParticipants}, ${description}, ${location},
            ${startTime}, ${endTime}, ${startDate}, ${endDate}, ${link}, ${registrationDeadline}
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
