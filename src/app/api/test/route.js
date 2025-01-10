import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Event, User } from "@/utils/schedule";

// Function to initialize the database connection
function getDatabaseConnection() {
  return neon(`${process.env.DATABASE_URL}`);
}

// Function to fetch events whose deadline has passed
async function fetchToBeAllocatedEvents(sql) {
  const query = sql`
      SELECT 
        event_id, 
        event_title,
        event_duration,
        event_force_admin,
        event_link
      FROM 
        events 
      WHERE 
        event_deadline < NOW() and event_allocated_start IS NULL and event_allocated_end IS NULL
    `;
  return await query;
}

// Function to fetch user events for a specific event
async function fetchUserEvents(sql, event_id) {
  const query = sql`
      SELECT 
        ue_id, 
        user_id,
        ue_is_admin
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

async function addAllocateTime(sql, event_id, start, end, participants) {
  await sql`
      INSERT INTO 
        allocatetimes 
        (event_id, at_start, at_end, at_participants)
      VALUES 
        (${event_id}, ${start}, ${end}, ${participants})
    `;
}

async function deleteAllocateTimes(sql) {
  await sql`
      DELETE FROM 
        allocatetimes
      WHERE 
        event_id IN (SELECT event_id FROM events WHERE event_allocated_end < NOW());
    `;
}

async function deleteFreeTimes(sql) {
  await sql`
      DELETE FROM 
        freetimes 
      WHERE 
        ue_id IN (
          SELECT ue_id 
          FROM userevent 
          WHERE event_id IN (SELECT event_id FROM events WHERE event_allocated_end < NOW())
        )
    `;
}


// Function to delete all free times associated with a specific event
async function deleteFreetimesForEvent(sql, event_id) {
  await sql`
      DELETE FROM 
        freetimes 
      WHERE 
        ue_id IN (
          SELECT ue_id 
          FROM userevent 
          WHERE event_id = ${event_id}
        )
    `;
};

async function checkEventDeadline(sql) {
  const result = await sql`
                  SELECT 
                    event_title,
                    event_deadline,
                    event_link
                  FROM 
                    events
                  WHERE 
                          NOW() + INTERVAL '1 DAY' >= event_deadline
                      AND event_deadline > NOW()
                  `;
  return result;
}


const sendDeadlineEmail = async (email, subject, eventName, deadline, event_link) => {
  //https://allocato.net/api/send
  try {
    const response = await fetch(`https://event-manager-opal.vercel.app/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: email,
        layout_choice: 'Deadline',
        eventName: eventName,
        deadline: deadline,
        event_link: event_link,
        subject: subject
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


const sendAllocateEmail = async (email, subject, eventName, allocate, event_link) => {
  //https://allocato.net/api/send
  try {
    const response = await fetch(`https://event-manager-opal.vercel.app/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: email,
        layout_choice: 'Allocate',
        eventName: eventName,
        time: allocate,
        event_link: event_link,
        subject: subject
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

function convertDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kuala_Lumpur", // Specify Malaysia Time Zone
  };

  return new Intl.DateTimeFormat("en-MY", options)
    .format(date)
    .replace(/,/, "")
    .replace(/:/g, ".");
};

// function convertDate(date) {
//   const options = { hour: "2-digit", 
//                     minute: "2-digit", 
//                     hour12: true ,
//                     weekday: "long", // Optional: Add weekday name
//                     year: "numeric",
//                     month: "2-digit",
//                     day: "2-digit"};
//   const openingTime = open
//     ? new Intl.DateTimeFormat("en-US", options).format(new Date(Date.UTC(2025, 0, 4, ...open.split(":").map(Number))))
//     : "unknown";

//   return `${openingTime} - ${closingTime}`;
// }



export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  console.log("Cron Job Ran at ", new Date());

  const sql = getDatabaseConnection();
  // Delete all allocate times whose event is over
  await deleteAllocateTimes(sql);
  // Delete all free times whose event is over
  await deleteFreeTimes(sql);

  // Find events whose deadline has passed
  const toBeAllocatedEvents = await fetchToBeAllocatedEvents(sql);

  for (const event of toBeAllocatedEvents) {
    const { event_id, event_duration, event_force_admin, event_link, event_title } = event;
    const userEvents = await fetchUserEvents(sql, event_id);
    const { hours, minutes } = event_duration;
    const duration = ((hours ?? 0) * 60 + (minutes ?? 0)) * 60 * 1000;
    const eventObj = new Event(duration, event_force_admin);

    // For each user event of event, fetch freetimes and add to event object
    for (const userEvent of userEvents) {
      const { ue_id, user_id, ue_is_admin } = userEvent;
      const freetimes = await fetchFreetimes(sql, ue_id);

      const user = new User(user_id, ue_is_admin);
      freetimes.forEach(({ start, end }) => {
        user.addFreeTime(new Date(start), new Date(end));
      });

      eventObj.addUser(user);
    }

    eventObj.setEventRange();

    // Update the event with the allocated start and end times and add the allocated times
    if (eventObj.eventRange) {
      const { start, end } = eventObj.eventRange;
      await updateEventAllocation(sql, event_id, start.toISOString(), end.toISOString());
      eventObj.eventRanges.forEach(({ start, end, users }) => {
        addAllocateTime(sql, event_id, start.toISOString(), end.toISOString(), users.length);
      });
      // Delete all free times associated with the event
      // await deleteFreetimesForEvent(sql, event_id);
      const participants = await fetch(`https://event-manager-opal.vercel.app/api/user-event/participants?link=${event_link}`);
      const data_participants = await participants.json();
      const emails = data_participants.participants.map((x) => x.email);
      const fullEventLink = `https://allocato.net/event/${event_link}`;
      await sendAllocateEmail(emails, "Event time allocated", event_title, `${convertDate(start)}-${convertDate(end)}`, fullEventLink);
    }

  }
  //Deadline reminding
  const events = await checkEventDeadline(sql);
  for (const event of events) {
    const { event_title, event_deadline, event_link } = event;
    const participants = await fetch(`https://event-manager-opal.vercel.app/api/user-event/participants?link=${event_link}`);
    const data_participants = await participants.json();
    const emails = data_participants.participants.map((x) => x.email);
    const fullEventLink = `https://allocato.net/event/${event_link}`;
    await sendDeadlineEmail(emails, "Event deadline approaching", event_title, convertDate(new Date(event_deadline)), fullEventLink);
  }

  return NextResponse.json({
    message: "Cron Job Ran at " + new Date()
  });
}