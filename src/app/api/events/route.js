import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req) {
  try {

    const {title , duration , startdate , enddate ,  maxParticipants, location ,  operatingStart ,  operatingEnd} = await req.json();

    const formatedOperatingStart = new Date(operatingStart).toISOString().replace('T', ' ').replace('Z', '');
    const formatedOperatingEnd = new Date(operatingEnd).toISOString().replace('T', ' ').replace('Z', '');
    

    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
        INSERT INTO events (
            event_name, event_duration, event_max_participants, event_location,
            event_operating_start, event_operating_end, event_schedule_range_start, event_schedule_range_end
        )
        VALUES (
            ${title}, ${duration}, ${maxParticipants}, ${location},
            ${formatedOperatingStart}, ${formatedOperatingEnd}, ${startdate}, ${enddate}
        )
        `;

    // Respond with success
    return NextResponse.json({ message: 'Event created successfully.' }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}