import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
// import { getSession } from "next-auth/react";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

async function getTimes() {
  const sql = getDatabaseConnection();
  const query = `
        SELECT
            *
        FROM
        timetest
    `;
    const result = await sql(query);
  return result.map(record => {
    record.time = new Date();
    return record;
  });
}

export async function GET(req) {
  try {
    const strToBool = (str) => (str === null ? null : str === "true");
    const url = new URL(req.url);
    const times = await getTimes();
    console.log(times)
    return new Response(JSON.stringify({ times }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}
