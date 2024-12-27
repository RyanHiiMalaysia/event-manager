"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure,
  Image,
} from "@nextui-org/react";
import { eventData } from "../../../components/demoData";
import EventModal from "../../../components/EventModal";
import moment from "moment";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const getStart = (event) => {
    return moment(event.start).format("DD/mm/yyyy, h:mm a");
  };

  return (
    <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-4">
      <h1 className="text-4xl font-bold">Events</h1>
      <Tabs aria-label="Options" color="primary">
        <Tab key="scheduling" title="Scheduling">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
                {eventData.map((item, index) => (
                  <Card
                    key={index}
                    isPressable
                    shadow="sm"
                    onPress={() => handleSelectEvent(item)}
                  >
                    <CardBody className="overflow-visible p-0">
                      <Image
                        alt={item.title}
                        className="w-full object-cover h-[140px]"
                        radius="lg"
                        shadow="sm"
                        src="https://raw.githubusercontent.com/RyanHiiMalaysia/event-manager/refs/heads/user-page/public/blue.svg"
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="text-small justify-between">
                      <b>{item.title}</b>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="allocated" title="Allocated">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
                {eventData.map((item, index) => (
                  <Card
                    key={index}
                    isPressable
                    shadow="sm"
                    onPress={() => handleSelectEvent(item)}
                  >
                    <CardBody className="overflow-visible p-0">
                      <Image
                        alt={item.title}
                        className="w-full object-cover h-[140px]"
                        radius="lg"
                        shadow="sm"
                        src="https://raw.githubusercontent.com/RyanHiiMalaysia/event-manager/refs/heads/user-page/public/green.svg"
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="text-small justify-between">
                      <b>{item.title}</b>
                      <p className="text-default-500">
                        <span className="block sm:inline">
                          {moment(item.start).format("DD/MM/YYYY ")}
                        </span>
                        <span className="block sm:inline">
                          {moment(item.start).format("h:mm a")}
                        </span>
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="organising" title="Organising">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
                {eventData.map((item, index) => (
                  <Card
                    key={index}
                    isPressable
                    shadow="sm"
                    onPress={() => handleSelectEvent(item)}
                  >
                    <CardBody className="overflow-visible p-0">
                      <Image
                        alt={item.title}
                        className="w-full object-cover h-[140px]"
                        radius="lg"
                        shadow="sm"
                        src="https://raw.githubusercontent.com/RyanHiiMalaysia/event-manager/refs/heads/user-page/public/yellow.svg"
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="text-small justify-between">
                      <b>{item.title}</b>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
      <EventModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        selectedEvent={selectedEvent}
      />
    </div>
  );
}
