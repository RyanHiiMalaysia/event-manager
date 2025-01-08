"use client";
import { TableWrapper } from "@/components/Table";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Tooltip,
  Alert,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

export default function Page() {
  const [error, setError] = useState(null);
  const [creator, setCreator] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventLink, setEventLink] = useState(null);
  const [participants, setParticipants] = useState([]);
  const { data: session, status } = useSession();
  const [dataFetched, setDataFetched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditOpen, setIsEditOpen] = useState(false);

  function RemoveModal({ isOpen, onOpenChange, selectedParticipant }) {
    const getDescription = (name) => `Are you sure you want to remove ${name} from the event?`;
    const handleOnPress = () => console.log("Remove participant");
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Remove {selectedParticipant.name}</ModalHeader>
              <ModalBody>{getDescription(selectedParticipant.name)}</ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={handleOnPress}>
                  Remove
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  function EditModal({ isOpen, onOpenChange, selectedParticipant }) {
    const adminAction = ({ name, is_admin }) =>
      is_admin ? `remove ${name} from the admin list` : `make ${name} an admin`;
    const getDescription = (user) => `Are you sure you want to ${adminAction(user)}?`;
    const handleOnAddPress = () => console.log("Adding admin");
    const handleOnRemovePress = () => console.log("Removing admin");
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit {selectedParticipant.name}'s Role</ModalHeader>
              <ModalBody>{getDescription(selectedParticipant)}</ModalBody>
              <ModalFooter>
                {!selectedParticipant.is_admin ? (
                  <Button color="primary" onPress={handleOnAddPress}>
                    Make Admin
                  </Button>
                ) : (
                  <Button color="danger" onPress={handleOnRemovePress}>
                    Remove Admin
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

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

  const handleDeleteIconPress = (user) => {
    setSelectedParticipant(user);
    onOpen();
  };

  const handleEditIconPress = (user) => {
    setSelectedParticipant(user);
    setIsEditOpen(true);
  };

  if (dataFetched && session) {
    return (
      <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h1 className="text-4xl font-bold">Participants</h1>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
            {isVisible ? (
              <Alert
                type="success"
                fill="solid"
                shadow="md"
                color="success"
                title="Link copied to clipboard"
                description="Share this link to invite participants"
                onClose={() => setIsVisible(false)}
                closable
              />
            ) : (
              <Tooltip content="Copy event link to clipboard">
                <Button color="primary" className="text-xl p-6 md:text-lg" onPress={copyLinktoClipboard}>
                  Invite
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <div>
          <TableWrapper
            items={participants}
            creator={creator}
            isAdmin={isAdmin}
            userSession={session.user}
            onDelete={handleDeleteIconPress}
            onEdit={handleEditIconPress}
            columns={[
              { uid: "name", name: "Name" },
              { uid: "email", name: "Email" },
              { uid: "is_admin", name: "Role" },
              { uid: "actions", name: "Actions" },
            ]}
          />
        </div>
        <RemoveModal isOpen={isOpen} onOpenChange={onOpenChange} selectedParticipant={selectedParticipant} />
        <EditModal isOpen={isEditOpen} onOpenChange={setIsEditOpen} selectedParticipant={selectedParticipant} />
      </div>
    );
  }
}
