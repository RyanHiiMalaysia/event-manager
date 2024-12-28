"use client";
import React, { useState } from "react";
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
} from "@nextui-org/react";
import { eventData, schedulingData } from "../../../components/demoData";
import EventModal from "../../../components/EventModal";
import moment from "moment";
import blue from "../../../../public/blue.svg";
import green from "../../../../public/green.svg";
import yellow from "../../../../public/yellow.svg";
import Image from "next/image";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    onOpen();
  };

  return (
    <div className="flex flex-col space-y-4 lg:px-16 sm:px-8 px-4 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Events</h1>
        <Button
          color="primary"
          className="p-6 mx-4 text-3xl"
        >
          +
        </Button>
      </div>
      <Tabs aria-label="Options" color="primary">
        <Tab key="scheduling" title="Scheduling">
          <Card>
            <CardBody>
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {schedulingData.map((item, index) => (
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
                        src={blue}
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="text-small justify-between">
                      <b>{item.title}</b>
                      <p>
                        <Checkbox
                          isSelected={item.scheduled}
                          disableAnimation
                        ></Checkbox>
                      </p>
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
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                        src={green}
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
              <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                        src={yellow}
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
