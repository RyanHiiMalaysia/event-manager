import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Event, User } from "../../../utils/schedule";

// Function to initialize the database connection
function getDatabaseConnection() {
    return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch events whose deadline has passed
async function fetchToBeAllocatedEvents(sql) {
    const query = sql`
      SELECT 
        event_id, 
        event_duration 
      FROM 
        events 
      WHERE 
        event_deadline < NOW()
    `;
    return await query;
}

// Function to fetch user events for a specific event
async function fetchUserEvents(sql, event_id) {
    const query = sql`
      SELECT 
        ue_id, 
        user_id 
      FROM 
        userevent 
      WHERE 
        event_id = ${event_id}
    `;
    return await query;
}

// Function to fetch freetimes for a specific user event
async function fetchFreetimes(sql, ue_id) {
    const query = sql`
      SELECT 
        ft_start as start, 
        ft_end as end 
      FROM 
        freetimes 
      WHERE 
        ue_id = ${ue_id}
    `;
    return await query;
}

// Function to update the allocated start and end times for an event
async function updateEventAllocation(sql, event_id, start, end) {
    await sql`
      UPDATE 
        events 
      SET 
        event_allocated_start = ${start}, 
        event_allocated_end = ${end} 
      WHERE 
        event_id = ${event_id}
    `;
}

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    console.log("Cron Job Ran at ", new Date());

    const sql = getDatabaseConnection();
    // Find events whose deadline has passed
    const toBeAllocatedEvents = await fetchToBeAllocatedEvents(sql);

    for (const event of toBeAllocatedEvents) {
        const { event_id, event_duration } = event;
        const userEvents = await fetchUserEvents(sql, event_id);

        const eventObj = new Event(event_duration);

        // For each user event of event, fetch freetimes and add to event object
        for (const userEvent of userEvents) {
            const { ue_id, user_id } = userEvent;
            const freetimes = await fetchFreetimes(sql, ue_id);

            const user = new User(user_id);
            freetimes.forEach(({ start, end }) => {
                user.addVacantRange(new Date(start), new Date(end));
            });

            eventObj.addUser(user);
        }

        eventObj.setEventRange();

        // Update the event with the allocated start and end times
        if (eventInstance.eventRange) {
            const { start, end } = eventInstance.eventRange;
            await updateEventAllocation(sql, event_id, start.toISOString(), end.toISOString());
        }
    }

    return NextResponse.json({
        message: "Cron Job Rann at " + new Date()
    });
}