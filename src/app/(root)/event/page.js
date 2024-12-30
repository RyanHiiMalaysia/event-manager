"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody, CardFooter, Checkbox, useDisclosure, Button, Link } from "@nextui-org/react";
import EventModal from "../../../components/EventModal";
import moment from "moment";
import blue from "../../../../public/blue.svg";
import green from "../../../../public/green.svg";
import yellow from "../../../../public/yellow.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/events?email=${session.user.email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const result = await response.json();
          console.log(result);
          if (!response.ok) {
            setError(result.message || "Failed to fetch events");
            return;
          }
          setUserEvents(result.eventData);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [status, session]);

  if (error) {
    return <div>{error}</div>;
  }

  const schedulingEvents = userEvents.filter((event) => event.event_allocated_time === null);
  const allocatedEvents = userEvents.filter((event) => event.event_allocated_time !== null);
  const organisingEvents = userEvents.filter((event) => event.ue_is_admin);

  return (
    <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Events</h1>
        <Button color="primary" className="mx-2 text-3xl p-7" as={Link} href="/event/create">
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
                            <Checkbox isSelected={item.scheduled} disableAnimation></Checkbox>
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
                {allocatedEvents.map(
                  (
                    item,
                    index // if not working, try changing userEvents to eventData
                  ) => (
                    <Card key={index} isPressable shadow="sm" onPress={() => handleSelectEvent(item)}>
                      <CardBody className="overflow-visible p-0">
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
                      <CardFooter className="text-small justify-between">
                        <b>{item.event_title}</b>
                        <p className="text-default-500">
                          <span className="block sm:inline">
                            {moment(item.event_schedule_start).format("DD/MM/YYYY ")}
                          </span>
                          <span className="block sm:inline">{moment(item.event_schedule_start).format("h:mm a")}</span>
                        </p>
                      </CardFooter>
                    </Card>
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
                {organisingEvents.map((item, index) => (
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
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <EventModal isOpen={isOpen} onOpenChange={onOpenChange} selectedEvent={selectedEvent} />
    </div>
  );
}
