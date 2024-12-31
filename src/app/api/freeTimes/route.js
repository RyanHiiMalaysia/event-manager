import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const checking_freetimes = async (userId, start, end) => {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql('SELECT * FROM freetimes WHERE ft_ue_id = $1 AND start_time = $2 AND end_time = $3', 
                            [userId, start, end]);

    if (result.length > 0) {
        // That time slot is already used
        return { message: 'This free time is used.', status: 400 };
    }
    return null;  // No issue, continue checking
};

export async function POST(req) {
    const sql = neon(`${process.env.DATABASE_URL}`);
    try {
      const {
        user,
        freetimes
      } = await req.json();
    
      
      for (let f of freetimes) {
        const result = await checking_freetimes(user, f.start, f.end);
        
        if (result) {
            // If a conflict is found, return the response early
            return NextResponse.json(result, { status: result.status });
            }
        }

        //Insert the free times to freetimes table
        await sql`BEGIN`;
        for (let f of freetimes) {
            await sql`
            INSERT INTO freetimes (
                ft_ue_id, start_time, end_time
            ) VALUES (
                ${user}, ${f.start}, ${f.end} 
            ) 
            `;
        }
    
      return NextResponse.json({ message: "Free times added successfully." }, { status: 200 });

    } catch (error) {
        console.log(error);
        await sql`ROLLBACK`;
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
  }