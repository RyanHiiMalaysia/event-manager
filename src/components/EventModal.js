"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Textarea,
  Card,
  CardFooter,
  Input,
  CardBody,
} from "@nextui-org/react";
import moment from 'moment-timezone'

export default function eventModal({ isOpen, onOpenChange, selectedEvent }) {
  const handleOnPress = () => {
    const url = `${window.location.origin}/event/${selectedEvent.event_link}`;
    window.open(url, "_blank");
  };

  const renderEventContent = (event) => {
    const {
      event_allocated_start,
      event_allocated_end,
      event_location,
      event_description,
      event_deadline,
      ue_has_scheduled,
    } = event;
    const getTime = () => {
      if (event_allocated_start === null) {
        const deadline = moment(event_deadline).format("MMMM Do YYYY, h:mm a");
        return (
          <>
            <Card shadow="sm" className="border-default-200 justify-between">
              <CardFooter className="justify-between">
                <p className="font-bold">Deadline</p>
                <p>{deadline}</p>
              </CardFooter>
            </Card>
            <Card shadow="sm" className="border-default-200">
              <CardFooter className="justify-between">
                <p>Scheduled</p>
                <Checkbox isSelected={ue_has_scheduled} disableAnimation className="mx-1"></Checkbox>
              </CardFooter>
            </Card>
          </>
        );
      } else {
        const startDate = moment(event_allocated_start).format("MMMM Do YYYY, h:mm a");
        const endDate = moment(event_allocated_end).format("MMMM Do YYYY, h:mm a");
        return (
          <Card shadow="sm" className="border-default-200">
            <CardBody>
              <p>
                {startDate} – {endDate}
              </p>
            </CardBody>
          </Card>
        );
      }
    };

    return (
      <div className="flex flex-col gap-2">
        {getTime()}
        <Input isReadOnly value={event_location} label="Location" variant="bordered" />
        <Textarea label="Description" value={event_description} isReadOnly variant="bordered" />
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">{selectedEvent.event_title}</ModalHeader>
            <ModalBody>{renderEventContent(selectedEvent)}</ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleOnPress}>
                More Info
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
