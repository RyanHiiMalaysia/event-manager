"use client";
import { TableWrapper } from "@/components/Table";
import React, { useState, useEffect } from "react";
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
  Textarea,
  Form,
} from "@nextui-org/react";
import { getData, checkAdmin } from "@/utils/api";

export default function Page() {
  const [error, setError] = useState(null);
  const [creator, setCreator] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventLink, setEventLink] = useState(null);
  const [participants, setParticipants] = useState([]);
  const { data: session, status } = useSession();
  const [dataFetched, setDataFetched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [emailsInvalidity, setEmailsInvalidity] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [eventTitle, setEventTitle] = useState(null);
  const [fullEventLink, setFullEventLink] = useState(null);

  const sendAdminEmail = async (email, subject, becomeAdmin, eventName) => {
    try {
      const response = await fetch(`/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: email,
          layout_choice: 'Admin',
          subject: subject,
          event_link: fullEventLink,
          eventName: eventName,
          becomeAdmin: becomeAdmin
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const sendInvitationEmail = async (emails, subject, userName) => {
    try {
      const response = await fetch(`/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: emails, layout_choice: 'Invited', subject: subject, userName: userName, event_link: fullEventLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const sendRemovePaticipantEmail = async (emails, subject, adminName) => {
    try {
      const response = await fetch(`/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: emails, layout_choice: 'Remove', subject: subject, adminName:adminName, eventName:eventTitle, event_link: fullEventLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  function RemoveModal({ isOpen, onOpenChange, selectedParticipant }) {
    const getDescription = (name) => `Are you sure you want to remove ${name} from the event?`;
    const handleOnPress = async () => {
      const response = await fetch("/api/user-event", {
        method: "POST",
        body: JSON.stringify({ user_email: selectedParticipant.email, event_link: eventLink, leave: true }),
      });
      onOpenChange();

      if (response.ok) {
        setParticipants(participants.filter((participant) => participant.email !== selectedParticipant.email));
        setSelectedParticipant(null);
        await sendRemovePaticipantEmail(selectedParticipant.email, "You have been removed from an event", session.user.chosenName);
      } else {
        const result = await response.json();
        alert(result.message || "Error removing participant");
      }
    };
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
    const handleOnAddPress = async () => {
      const response = await fetch("/api/user-event", {
        method: "POST",
        body: JSON.stringify({ user_email: selectedParticipant.email, event_link: eventLink, makeAdmin: true }),
      });
      setIsEditOpen(false);

      if (response.ok) {
        setParticipants(
          participants.map((participant) =>
            participant.email === selectedParticipant.email ? { ...participant, is_admin: true } : participant
          )
        );
        setSelectedParticipant(null);

        //Send email
        await sendAdminEmail(selectedParticipant.email, "Added to admin list", true, eventTitle);

      } else {
        const result = await response.json();
        alert(result.message || "Error adding admin");
      }
    };
    const handleOnRemovePress = async () => {
      const response = await fetch("/api/user-event", {
        method: "POST",
        body: JSON.stringify({ user_email: selectedParticipant.email, event_link: eventLink, makeAdmin: false }),
      });
      onOpenChange();

      if (response.ok) {
        setParticipants(
          participants.map((participant) =>
            participant.email === selectedParticipant.email ? { ...participant, is_admin: false } : participant
          )
        );
        setSelectedParticipant(null);

        //Send email
        await sendAdminEmail(selectedParticipant.email, "Removed from admin list", false, eventTitle);
      } else {
        const result = await response.json();
        alert(result.message || "Error removing admin");
      }
    };
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
      setFullEventLink(window.location.href.replace("/participants", ""));
    }
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const isAdminData = await checkAdmin(eventLink, session);
        const [participantsData, eventData, event] = await Promise.all([
          getData(`/api/user-event/participants?link=${eventLink}`),
          getData(`/api/events?creator=true&link=${eventLink}`),
          getData(`/api/events?link=${eventLink}`),
        ]);
        setParticipants(participantsData.participants);
        setCreator(eventData.eventData[0].event_creator);
        setEventTitle(event.eventData[0].event_title)
        setIsAdmin(isAdminData);

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

  const closeInvite = () => {
    setIsInviteOpen(false);
  };

  /**
   * Validates a string it was a proper email
   * @param {string} email a single email
   * @returns email if it is valid, null otherwise
   */
  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const stringToEmails = (string) => {
    setWordCount(string ? string.length : 0)
    const initialCount = string.split(',').length
    const emails = string.split(',').map(o => o.trim()).filter(validateEmail)
    const finalCount = emails.length
    return initialCount == finalCount ? emails : null
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const { description: data } = Object.fromEntries(new FormData(e.currentTarget));
    const emails = stringToEmails(data)
    setEmailsInvalidity(false);
    if (emails) {
      setEmailsInvalidity(false);
      await sendInvitationEmail(emails, `Invitation to ${session.user.chosenName}'s ${eventTitle}!`, session.user.chosenName)
    }
    else {
      setEmailsInvalidity(true);
    }
  };
  const invitePage = (isInviteOpen, setIsInviteOpen, closeInvite) => {
    return (
      <div>
        <Button color="primary" className="text-xl p-6 md:text-lg" onPress={() => {
          setIsInviteOpen(true);
          setIsVisible(false);
        }}>
          Invite
        </Button>
        <Modal isOpen={isInviteOpen} onOpenChange={setIsInviteOpen} onClose={closeInvite}>
          <ModalContent>
            <ModalHeader>
              Invite your friends to this event!
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={onSubmit} validationBehavior="native">
                <div className="flex flex-col items-center w-full max-w-md  space-y-3">
                  <Textarea
                    label="Emails (if more than one separate it by commas)"
                    labelPlacement="outside"
                    color={emailsInvalidity ? (wordCount == 0 ? "default" : "danger") : "default"}
                    errorMessage="One of the emails is invalid"
                    name="description"
                    placeholder="Enter the emails of the participants you want to invite separated by commas (,)"
                  />
                  <div style={{ color: "#F31260" }}>
                    {emailsInvalidity ? (wordCount == 0 ? "" : "One of the emails is invalid") : ""}
                  </div>
                  <div className="flex flex-row justify-between items-end w-full">
                    {isVisible ? (
                      <Button
                        color="success"
                        className="flex items-center justify-center text-white bg-green-500  "
                        onPress={() => setIsVisible(false)} // Reset to original state when clicked
                      >
                        <span className="material-icons text-lg">Copied</span> {/* Checkmark icon */}
                      </Button>
                    ) : (
                      <Tooltip content="Copy event link to clipboard">
                        <Button
                          color="primary"
                          className="flex items-center justify-center p-2"
                          onPress={copyLinktoClipboard}
                        >
                          Copy Link
                        </Button>
                      </Tooltip>
                    )}
                    {isSubmited ? (
                      <Button
                        type="submit"
                        color="primary"
                        className="flex"
                        onPress={() => setIsSubmited(false)}>
                          Submitted
                        </Button>
                    ) : (
                      <Button
                        type="submit"
                        color="primary"
                        className="flex"
                        onPress={() => setIsSubmited(true)}
                      >
                        Submit
                      </Button>
                    )}
                    
                  </div>

                </div>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    );
  };

  if (dataFetched && session) {
    return (
      <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h1 className="text-4xl font-bold">Participants</h1>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
            {invitePage(isInviteOpen, setIsInviteOpen, closeInvite)}
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
