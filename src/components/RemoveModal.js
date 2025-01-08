"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

export default function removeModal({ getDescription, isOpen, onOpenChange, handleOnPress, selectedParticipant }) {
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
