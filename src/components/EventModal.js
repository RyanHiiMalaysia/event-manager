import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import moment from "moment";

export default function eventModal({ isOpen, onOpenChange, selectedEvent }) {
  const handleOnPress = () => {
    window.open(selectedEvent.url, "_blank");
  };

  const renderEventContent = (event) => {
    const startDate = moment(event.start).format("MMMM Do YYYY, h:mm a");
    const endDate = moment(event.end).format("MMMM Do YYYY, h:mm a");
    return (
      <div>
        <p>
          {startDate} – {endDate}
        </p>
        <br />
        <p>Location: {event.location}</p>
        <p>Description: {event.description}</p>
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
