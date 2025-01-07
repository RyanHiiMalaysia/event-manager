import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch user events by email
async function fetchUserEvents(user_email, hasAllocated, isAdmin, isPast) {
  const sql = getDatabaseConnection();
  const boolToQuery = (bool, trueQuery, falseQuery) => (bool === null ? "" : bool ? trueQuery : falseQuery);

  const allocatedQuery = boolToQuery(
    hasAllocated,
    "AND event_allocated_start IS NOT NULL",
    "AND event_allocated_start IS NULL"
  );
  const adminQuery = boolToQuery(isAdmin, "AND ue_is_admin = TRUE", "AND ue_is_admin = FALSE");
  const pastQuery = boolToQuery(isPast, "AND event_allocated_end < NOW()", "AND (event_allocated_end >= NOW() OR event_allocated_end IS NULL)");

  let query = `
  SELECT 
    event_title, 
    event_deadline, 
    event_location, 
    event_description,
    event_allocated_start,
    event_allocated_end,
    event_link,
    ue_is_admin
  FROM 
    userevent 
  NATURAL JOIN 
    events 
  WHERE 
    user_id = (
      SELECT user_id 
      FROM users 
      WHERE user_email = $1
    )
  ${allocatedQuery}
  ${adminQuery}
  ${pastQuery}
`;

  return await sql(query, [user_email]);
}

// Function to verify if user is already in event
// async function verifyParticipation(sql, user_email, event_link) {
//   const [user_id] = await sql`
//     SELECT
//       user_id
//     FROM
//       users NATURAL JOIN userevent
//     WHERE
//       user_email = ${user_email}
//     AND
//       event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
//   `;
//   return user_id ? true : false;
// }


async function verifyParticipation(sql, user_email, event_link, checkAdmin) {
  const boolToQuery = (bool, trueQuery, falseQuery) => (bool === null ? "" : bool ? trueQuery : falseQuery);
  const admin = boolToQuery(checkAdmin, "AND ue_is_admin = TRUE", "");

  let query = `
      SELECT
        user_id
      FROM
        users NATURAL JOIN userevent
      WHERE
        user_email = $1
      AND
        event_id = (SELECT event_id FROM events WHERE event_link = $2)
      ${admin}
    `
  const [user_id] = await sql(query, [user_email, event_link]);
  return user_id ? true : false;

}

//Function to check the event has reached maximum participants 
async function findNumberOfParticipants(sql, event_link) {

  const currentNumberOfParticipants = await sql`
    SELECT
      COUNT(user_id)
    FROM
      users NATURAL JOIN userevent
    WHERE
      event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
  `;

  return currentNumberOfParticipants;
}

// Function to add user to event
async function addUserToEvent(sql, user_email, event_link) {
  await sql`BEGIN`;

  await sql`
    INSERT INTO userevent (
      user_id, event_id
    ) VALUES (
      (SELECT user_id FROM users WHERE user_email = ${user_email}),
      (SELECT event_id FROM events WHERE event_link = ${event_link})
    )
  `;

  await sql`COMMIT`;
}

async function deleteFreetimesForSpecfciUserEvent(sql, user_email, event_link) {
  await sql`BEGIN`;

  await sql`
    DELETE FROM 
        freetimes 
      WHERE 
        ue_id IN (
          SELECT ue_id 
          FROM userevent 
          WHERE 
            event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
            AND 
            user_id = (SELECT user_id FROM users WHERE user_email = ${user_email})

        )
  `;

  await sql`COMMIT`;
}

async function deleteAllFreetimesForSpecfciEvent(sql, event_link) {
  await sql`BEGIN`;

  await sql`
    DELETE FROM 
        freetimes 
      WHERE 
        ue_id IN (
          SELECT ue_id 
          FROM userevent 
          WHERE 
            event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
        )
  `;

  await sql`COMMIT`;
}

async function deleteUserEventForSpecificUser(sql, user_email, event_link) {
  await sql`BEGIN`;

  await sql`
    DELETE FROM 
        userevent
      WHERE 
        event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
        AND 
        user_id = (SELECT user_id FROM users WHERE user_email = ${user_email}) 
        
  `;

  await sql`COMMIT`;
}

async function deleteAllUserEventsForSpecifciEvent(sql, event_link) {
  await sql`BEGIN`;

  await sql`
    DELETE FROM 
        userevent
      WHERE 
        event_id = (SELECT event_id FROM events WHERE event_link = ${event_link})
  `;

  await sql`COMMIT`;
}

async function deleteEvent(sql, event_link) {
  await sql`BEGIN`;

  await sql`
    DELETE FROM 
        events
      WHERE 
        event_link = ${event_link}
  `;

  await sql`COMMIT`;
}



// Function to handle the GET request to fetch user events
export async function GET(req) {
  const sql = getDatabaseConnection();
  try {
    const strToBool = (str) => (str === null ? null : str === "true");
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const hasAllocated = strToBool(url.searchParams.get("hasAllocated"));
    const isAdmin = strToBool(url.searchParams.get("isAdmin"));
    const isPast = strToBool(url.searchParams.get("isPast"));
    const numberOfParticipants = strToBool(url.searchParams.get("findNumberOfParticipants"));
    const link = url.searchParams.get("link")
    const findIsUserInOrAdmin = strToBool(url.searchParams.get("findIsUserInOrAdmin"));
    const leaveEvent = strToBool(url.searchParams.get("leaveEvent"));
    const cancelEvent = strToBool(url.searchParams.get("cancelEvent"));

    if (cancelEvent) {
      await deleteAllFreetimesForSpecfciEvent(sql, link);
      await deleteAllUserEventsForSpecifciEvent(sql, link);
      await deleteEvent(sql, link);
      return new Response(JSON.stringify({ message: "Delete event successfully!" }), { status: 200 });
    }
    if (leaveEvent) {
      await deleteFreetimesForSpecfciUserEvent(sql, email, link);
      await deleteUserEventForSpecificUser(sql, email, link);
      return new Response(JSON.stringify({ message: "Leave event successfully!" }), { status: 200 });
    }
    if (numberOfParticipants) {
      const result = await findNumberOfParticipants(sql, link);
      return new Response(JSON.stringify({ result: result }), { status: 200 });
    }
    if (findIsUserInOrAdmin) {
      const isUserInOrAdmin = await verifyParticipation(sql, email, link, isAdmin);
      return new Response(JSON.stringify({ result: isUserInOrAdmin }), { status: 200 });
    }
    const eventData = await fetchUserEvents(email, hasAllocated, isAdmin, isPast);
    return new Response(JSON.stringify({ eventData }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch events" }), { status: 500 });
  }
}

// Function to handle the POST request to add a user to an event
export async function POST(req) {
  const sql = getDatabaseConnection();
  try {
    const { user_email, event_link } = await req.json();
    const inEvent = await verifyParticipation(sql, user_email, event_link, false);

    if (!inEvent) {
      await addUserToEvent(sql, user_email, event_link);
      return NextResponse.json({ message: "Successfully added into event" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "User already in event" }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    await sql`ROLLBACK`;
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
