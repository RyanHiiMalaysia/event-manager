import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
const getUserAndFreeTimes = async (eventId) => {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql   `SELECT user_id, ft_start, ft_end 
                                FROM freetimes NATURAL JOIN userevent
                                WHERE event_id = ${eventId}`
    return result;
}

export async function GET(req) {
    const sql = neon(`${process.env.DATABASE_URL}`);
    try {
        const result = await sql`   SELECT * 
                                    FROM events 
                                    WHERE   event_deadline < NOW() 
                                            AND event_allocated_start is NULL 
                                            AND event_allocated_end is NULL`;

        if (result.length === 0) {
            return NextResponse.json({ message: "No overdue event found" }, { status: 404 });
        }
        
        const gettingFreetimes = await getUserAndFreeTimes(result[0]["event_id"])
        const{user_id, ft_start, ft_end} = gettingFreetimes[0]

        
        

        return NextResponse.json({ events: result }, { status: 200 })

    } catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
