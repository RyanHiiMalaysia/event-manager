"use client";
import { TableWrapper } from "@/components/Table";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, Tooltip, Alert } from "@nextui-org/react";

export default function Page() {
  const [error, setError] = useState(null);
  const [creator, setCreator] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventLink, setEventLink] = useState(null);
  const [participants, setParticipants] = useState([]);
  const { data: session, status } = useSession();
  const [dataFetched, setDataFetched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 2];
      setEventLink(eventLink);
    }
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const headers = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };

        const fetchData = async (link) => {
          const response = await fetch(link, headers);
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.message || "Failed to fetch events");
          }
          return result;
        };

        const [participantsData, eventData, adminData] = await Promise.all([
          fetchData(`/api/user-event/participants?link=${eventLink}`),
          fetchData(`/api/events?creator=true&link=${eventLink}`),
          fetchData(`/api/user-event?findIsUserIn=true&link=${eventLink}&email=${session.user.email}`),
        ]);
        setParticipants(participantsData.participants);
        setCreator(eventData.eventData[0].event_creator);
        setIsAdmin(adminData.result);
      } catch (error) {
        setError(error);
      }
    };
    if (session && eventLink && !dataFetched) {
      fetchParticipants();
      setDataFetched(true);
    }
  }, [session, eventLink, dataFetched]);

  function copyLinktoClipboard() {
    navigator.clipboard.writeText(`${window.location.origin}/event/${eventLink}`);
    setIsVisible(true);
  }

  if (dataFetched && session) {
    return (
      <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-8">
        {/* <div className="flex self-end max-w-md">
        {  isVisible ?
          <Alert
            type="success"
            fill="solid"
            shadow="md"
            color="success"
            title="Link copied to clipboard"
            description="You can now share the event link to invite more participants"
            onClose={() => setIsVisible(false)}
            closable
          /> : null
        }
        </div> */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h1 className="text-4xl font-bold">Participants</h1>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
          {  isVisible ?
          <Alert
            type="success"
            fill="solid"
            shadow="md"
            color="success"
            title="Link copied to clipboard"
            description="You can now share the event link to invite more participants"
            onClose={() => setIsVisible(false)}
            closable
          /> : <Tooltip content="Copy event link to clipboard">
              <Button color="primary" className="mx-2 text-md p-5" onPress={copyLinktoClipboard}>
                Invite
              </Button>
            </Tooltip>
        }
          </div>
        </div>
        <TableWrapper
          items={participants}
          creator={creator}
          userSession={session.user}
          columns={[
            { uid: "name", name: "Name" },
            { uid: "email", name: "Email" },
            { uid: "is_admin", name: "Role" },
            { uid: "actions", name: "Actions" },
          ]}
        />
      </div>
    );
  }
}
