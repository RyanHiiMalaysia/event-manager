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
} from "@nextui-org/react";
import moment from "moment";

export default function eventModal({ isOpen, onOpenChange, selectedEvent }) {
  const handleOnPress = () => {
    window.open(selectedEvent.url, "_blank");
  };

  const renderEventContent = (event) => {
    const { event_schedule_start, event_schedule_end, scheduled, event_location, event_description } = event;
    const getTime = () => {
      if (!event_schedule_start || !event_schedule_end) {
        return (
          <>
            <p>Scheduled</p>
            <Checkbox
              isSelected={scheduled}
              disableAnimation
              className="mx-1"
            ></Checkbox>
          </>
        );
      } else {
        const startDate = moment(event_schedule_start).format("MMMM Do YYYY, h:mm a");
        const endDate = moment(event_schedule_end).format("MMMM Do YYYY, h:mm a");
        return (
          <p>
            {startDate} – {endDate}
          </p>
        );
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <Card shadow="sm" className="border-default-200"> 
          <CardFooter className="justify-between">{getTime()}</CardFooter>
        </Card>
        <Input
          isReadOnly
          value={event_location}
          label="Location"
          variant="bordered"
        />
        <Textarea
          label="Description"
          value={event_description}
          isReadOnly
          variant="bordered"
        />
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {selectedEvent.event_title}
            </ModalHeader>
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
