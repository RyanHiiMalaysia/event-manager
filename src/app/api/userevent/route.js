import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    try{

        const sql = neon(`${process.env.DATABASE_URL}`);
        const result = await sql('SELECT * FROM userevent WHERE user_id = $1 AND event_id = $2', 
                                [userId, eventId]);
        
        if (result.length == 0) {//Not in the event yet
            return NextResponse.json({ message: "Not in this event yet" }, { status: 201});
        }

        return NextResponse.json({ message: "Already in this event" }, { status: 200 })

    }catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
}


export async function POST(req) {
    const sql = neon(`${process.env.DATABASE_URL}`);
    try {
        const {
            userId,
            eventId,
        } = await req.json();

        await sql`BEGIN`;
        
        await sql`
        INSERT INTO userevent (
            user_id, event_id, ue_is_admin
        ) VALUES (
            ${userId}, ${eventId}, false)`; 

      return NextResponse.json({ message: "Event scheduled successfully." }, { status: 200 });

    } catch (error) {
        console.log(error);
        await sql`ROLLBACK`;
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
  }