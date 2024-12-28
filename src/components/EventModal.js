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
  CardBody,
  CardHeader,
  Input,
} from "@nextui-org/react";
import moment from "moment";
import { parseAbsolute, toLocalTimeZone } from "@internationalized/date";

export default function eventModal({ isOpen, onOpenChange, selectedEvent }) {
  const handleOnPress = () => {
    window.open(selectedEvent.url, "_blank");
  };

  const renderEventContent = (event) => {
    const { start, end, scheduled, location, description } = event;
    const getTime = () => {
      if (!start || !end) {
        return (
          <p className="flex items-center">
            Scheduled
            <Checkbox
              isSelected={scheduled}
              disableAnimation
              className="mx-1 align-end"
            ></Checkbox>
          </p>
        );
      } else {
        const startDate = moment(start).format("MMMM Do YYYY, h:mm a");
        const endDate = moment(end).format("MMMM Do YYYY, h:mm a");
        return (
          <p>
            {startDate} - {endDate}
          </p>
        );
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <Card>
          <CardBody>{getTime()}</CardBody>
        </Card>
        <Input
          isReadOnly
          value={location}
          label="Location"
          variant="bordered"
        />
        <Textarea
          label="Description"
          value={description}
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
              {selectedEvent.title}
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
