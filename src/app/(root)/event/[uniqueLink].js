import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";


export async function GET({ params }) {
  const { uniqueLink } = params; // Extract dynamic uniqueLink from the route

  try {
    // Connect to the Neon database
    const sql = neon(process.env.DATABASE_URL);

    // Query the database for event details by uniqueLink
    const result = await sql`
      SELECT 
        event_name, 
        event_description, 
        event_location, 
        event_schedule_range_start, 
        event_schedule_range_end, 
        event_openingHour, 
        event_closingHour, 
        event_max_participants, 
        event_deadline, 
        event_link
      FROM events
      WHERE event_link = ${uniqueLink};
    `;

    // Check if the event was found
    if (result.length === 0) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Return the event details as JSON
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
