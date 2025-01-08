"use client";
import { TableWrapper } from "@/components/Table";
import RemoveModal from "@/components/RemoveModal";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, Tooltip, useDisclosure } from "@nextui-org/react";

export default function Page() {
  const [error, setError] = useState(null);
  const [creator, setCreator] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventLink, setEventLink] = useState(null);
  const [admins, setAdmins] = useState([]);
  const { data: session, status } = useSession();
  const [dataFetched, setDataFetched] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 3];
      setEventLink(eventLink);
    }
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
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

        const [adminsData, eventData, isAdminData] = await Promise.all([
          fetchData(`/api/user-event/participants?link=${eventLink}&isAdmin=true`),
          fetchData(`/api/events?creator=true&link=${eventLink}`),
          fetchData(`/api/user-event?findIsUserIn=true&link=${eventLink}&email=${session.user.email}`),
        ]);
        setAdmins(adminsData.participants);
        setCreator(eventData.eventData[0].event_creator);
        setIsAdmin(isAdminData.result);
      } catch (error) {
        setError(error);
      }
    };
    if (session && eventLink && !dataFetched) {
      fetchAdmins();
      setDataFetched(true);
    }
  }, [session, eventLink, dataFetched]);

  const handleDeleteIconPress = (user) => {
    setSelectedParticipant(user);
    onOpen();
  };

  const getDescription = (name) => `Are you sure you want to remove ${name} from the admin list?`;

  function addAdmin() {}

  if (dataFetched && session) {
    return (
      <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h1 className="text-4xl font-bold">Administrators</h1>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
            <Tooltip content="Add an admin">
              <Button color="primary" className="text-xl p-6 md:text-lg" onPress={addAdmin}>
                Add
              </Button>
            </Tooltip>
          </div>
        </div>
        <div>
          <TableWrapper
            items={admins}
            creator={creator}
            userSession={session.user}
            onDelete={handleDeleteIconPress}
            columns={[
              { uid: "name", name: "Name" },
              { uid: "email", name: "Email" },
              { uid: "is_admin", name: "Role" },
              { uid: "actions", name: "Actions" },
            ]}
          />
        </div>
        <RemoveModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          selectedParticipant={selectedParticipant}
          handleOnPress={() => console.log("Remove Admin")}
          getDescription={getDescription}
        />
      </div>
    );
  }
}
