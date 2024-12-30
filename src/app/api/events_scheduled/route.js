import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchEventData() {
    const sql = neon(`${process.env.DATABASE_URL}`);
    return await sql(`
        SELECT u.user_id, u.user_email, u.user_name, e.event_id, e.event_title, e.event_location, e.event_description, e.event_duration, e.event_schedule_start, e.event_schedule_end, e.event_deadline, e.event_max_participants, e.event_opening_hour, e.event_closing_hour    
        FROM users u
        LEFT JOIN events e ON u.user_id = e.event_creator
        ORDER BY u.user_id, e.event_id
    `);
}


export async function GET(req) {

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await fetchEventData();

            if (result.length === 0) {
                return NextResponse.json({ message: 'No events found' }, { status: 404 });
            }

            return NextResponse.json(result, { status: 200 });
        } catch (error) {
            console.log(error);
            if (attempt === MAX_RETRIES) {
                return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}
