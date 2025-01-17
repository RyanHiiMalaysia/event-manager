"use client";
import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  Checkbox,
  useDisclosure,
  Button,
  Link,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import EventModal from "../../../components/EventModal";
import moment from "moment";
import blue from "../../../../public/blue.svg";
import green from "../../../../public/green.svg";
import yellow from "../../../../public/yellow.svg";
import grey from "../../../../public/grey.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { InfoIcon } from "@/components/icons/eventDetails/info-icon";
import { getData, getEvents } from "@/utils/api";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isInfoModalOpen, onOpen: onInfoModalOpen, onOpenChange: onInfoModalOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [schedulingEvents, setSchedulingEvents] = useState([]);
  const [allocatedEvents, setAllocatedEvents] = useState([]);
  const [organisingEvents, setOrganisingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const { data: session, status } = useSession();
  const [dataFetched, setDataFetched] = useState(false);
  const [userDetails, setUserDetails] = useState({ user_has_paid: true, user_events_created: 0 });

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  useEffect(() => {
    const getUserEvents = getEvents(session);
    const fetchUserDetails = async () => {
      try {
        const userData = await getData(`/api/user?email=${session.user.email}`);
        const [scheduling, allocated, organising, past] = await Promise.all([
          getUserEvents("hasAllocated=false&isPast=false"),
          getUserEvents("hasAllocated=true&isPast=false"),
          getUserEvents("isAdmin=true&isPast=false"),
          getUserEvents("isPast=true"),
        ]);
        setUserDetails(userData);
        setSchedulingEvents(scheduling);
        setAllocatedEvents(allocated);
        setOrganisingEvents(organising);
        setPastEvents(past);
      } catch (error) {
        console.error(error);
      } finally {
        setDataFetched(true)
      }
    };
    if (session && !dataFetched) {
      fetchUserDetails();
    }
  }, [status, session, dataFetched]);

  return (
    <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">
          Events{" "}
          {userDetails.user_has_paid ? (
            ""
          ) : (
            <span>
              <Tooltip content="Purchase the Pro plan to create unlimited events">
                <span className={userDetails.user_events_created >= 5 ? "text-red-500" : ""}>
                  {`${userDetails.user_events_created}/5`}
                </span>
              </Tooltip>
            </span>
          )}
          <Button isIconOnly onPress={onInfoModalOpen} color="FFFFFF" auto size="sm">
            <InfoIcon />
          </Button>
        </h1>
        <Button
          color="primary"
          className="mx-2 text-3xl p-7"
          as={Link}
          href="/event/create"
          isDisabled={!userDetails.user_has_paid && userDetails.user_events_created >= 5}
        >
          +
        </Button>
      </div>
      <Tabs aria-label="Options" color="primary">
        <Tab key="scheduling" title="Scheduling">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {schedulingEvents.length === 0 ? (
                  <p>No events to display.</p>
                ) : (
                  schedulingEvents.map(
                    (
                      item,
                      index // if not working, try changing userEvents to schedulingData
                    ) => (
                      <Card key={index} isPressable shadow="sm" onPress={() => handleSelectEvent(item)}>
                        <CardBody className="overflow-visible p-0">
                          <Image
                            alt={item.event_title}
                            className="w-full object-cover h-[140px]"
                            radius="lg"
                            shadow="sm"
                            src={blue}
                            width="100%"
                            priority={true}
                          />
                        </CardBody>
                        <CardFooter className="text-small justify-between">
                          <b>{item.event_title}</b>
                          <p>
                            <Checkbox isSelected={item.ue_has_scheduled} disableAnimation></Checkbox>
                          </p>
                        </CardFooter>
                      </Card>
                    )
                  )
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="allocated" title="Allocated">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {allocatedEvents.length === 0 ? (
                  <p>No events to display.</p>
                ) : (
                  allocatedEvents.map(
                    (
                      item,
                      index // if not working, try changing userEvents to eventData
                    ) => (
                      <Card
                        className="justify-stretch"
                        key={index}
                        isPressable
                        shadow="sm"
                        onPress={() => handleSelectEvent(item)}
                      >
                        <CardBody className="overflow-visible p-0 h-[140px] flex-none">
                          <Image
                            alt={item.event_title}
                            className="w-full object-cover h-[140px]"
                            radius="lg"
                            shadow="sm"
                            src={green}
                            width="100%"
                            priority={true}
                          />
                        </CardBody>
                        <CardFooter className="text-small justify-between flex flex-col flex-grow items-center text-center sm:flex-row">
                          <b className="mb-2 sm:mb-0">{item.event_title}</b>
                          <p className="text-default-500">
                            <span className="block sm:inline text-left">
                              {moment(item.event_allocated_start).format("MMMM Do YYYY")}
                            </span>
                            <span className="block sm:inline text-left">
                              {moment(item.event_allocated_start).format(" h:mm a")}
                            </span>
                          </p>
                        </CardFooter>
                      </Card>
                    )
                  )
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="organising" title="Organising">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {organisingEvents.length === 0 ? (
                  <p>No events to display.</p>
                ) : (
                  organisingEvents.map((item, index) => (
                    <Card key={index} isPressable shadow="sm" onPress={() => handleSelectEvent(item)}>
                      <CardBody className="overflow-visible p-0">
                        <Image
                          alt={item.event_title}
                          className="w-full object-cover h-[140px]"
                          radius="lg"
                          shadow="sm"
                          src={yellow}
                          width="100%"
                          priority={true}
                        />
                      </CardBody>
                      <CardFooter className="text-small justify-between">
                        <b>{item.event_title}</b>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="past" title="Past">
          {" "}
          {/* New tab for past events */}
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pastEvents.length === 0 ? (
                  <p>No events to display.</p>
                ) : (
                  pastEvents.map((item, index) => (
                    <Card key={index} isPressable shadow="sm" onPress={() => handleSelectEvent(item)}>
                      <CardBody className="overflow-visible p-0">
                        <Image
                          alt={item.event_title}
                          className="w-full object-cover h-[140px]"
                          radius="lg"
                          shadow="sm"
                          src={grey}
                          width="100%"
                          priority={true}
                        />
                      </CardBody>
                      <CardFooter className="text-small justify-between">
                        <b>{item.event_title}</b>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <EventModal isOpen={isOpen} onOpenChange={onOpenChange} selectedEvent={selectedEvent} />

      <Modal isOpen={isInfoModalOpen} onOpenChange={onInfoModalOpenChange}>
        <ModalContent>
          <ModalHeader>Info</ModalHeader>
          <ModalBody>
            <p>
              <b>Scheduling:</b> Events that are currently being scheduled and are not yet allocated. The checkbox
              indicates whether you have set your availability for the event.
            </p>
            <p>
              <b>Allocated:</b> Events that have been allocated to a date and time that suits the most participants as
              possible.
            </p>
            <p>
              <b>Organising:</b> Events that you created or have been made an admin of.
            </p>
            <p>
              <b>Past:</b> Events whose allocated ending time has passed.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onInfoModalOpenChange}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
