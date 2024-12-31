"use client";
import React,{ useEffect, useState } from 'react';
import { ScheduleCalendar } from "../../../../components/Calendar";
import { DatePicker } from "@nextui-org/date-picker";
import { TimeInput } from "@nextui-org/date-input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { parseDate, parseTime, parseAbsolute, toLocalTimeZone } from "@internationalized/date";
import moment from "moment";
import { useSession } from "next-auth/react";

export default function Page({ params }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const [selectedDate, setSelectedDate] = useState();
    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();
    const [freeTimes, setFreeTimes] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [start, setStart] = useState('');
    const [startDate, setStartDate] = useState('');
    const [end, setEnd] = useState('');
    const [endDate, setEndDate] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
          const fetchUserDetails = async () => {
            if (status === 'authenticated' && session?.user?.email) {
              try {
                const response = await fetch(`/api/user?email=${session.user.email}`);
                if (!response.ok) {
                  const result = await response.json();
                  setError(result.message);
                  setLoading(false);
                  return;
                }
                const userData = await response.json();
            
                setUser(userData);
              } catch (error) {
                setError('An unexpected error occurred.');
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          };
      
          fetchUserDetails();
        }, [status, session]);
    

    

    useEffect(() => {
        const fetchSpecificEvent = async () => {
          try {
            const linkFromParams = (await params).link;
            
            const response_event = await fetch(`${window.location.origin}/api/events?link=${linkFromParams}`)
  
            if (!response_event.ok) throw new Error('Failed to fetch event details');
        
            const data_events = await response_event.json();
          
            const matchedEvent = data_events.eventData[0];
            
            const s = matchedEvent.event_schedule_start.split("T")[0];

            setStart(s);

            setStartDate(parseDate(s));

            const e = matchedEvent.event_schedule_end.split("T")[0];
            setEnd(e);
            
            setEndDate(parseDate(e));

            setEvent(matchedEvent || null); // Set null if no event matches
      
          } catch (error) {
            console.error('Error fetching event:', error.message);
            setEvent(null); // Handle not found
          } finally {
            setLoading(false); // End loading state
          }
        };
      
        fetchSpecificEvent();
      }, [params]); // Only run when 'params' changes




if (loading) {
return <p className="p-6 text-center">Loading event details...</p>;
}

if (!event) {
return <p className="p-6 text-center">Event not found.</p>;
}

    const addFreeTime = (event) => {
        setFreeTimes([...freeTimes, event]);
    };


  const checkOverlap = (start, end) =>
    freeTimes.find(
      (freeTime) =>
        (start >= freeTime.start && start < freeTime.end) ||
        (end > freeTime.start && end <= freeTime.end)
    );

    const handleOnAddPress = () => {
        if (!selectedDate || !startTime || !endTime) {
          alert("Please fill all fields");
        } else if (endTime <= startTime) {
          alert("End time must be greater than start time");
        } else {
          const startDateTime = new Date(`${selectedDate}T${startTime}`);
          const endDateTime = new Date(`${selectedDate}T${endTime}`);
          const overlappingFreeTime = checkOverlap(startDateTime, endDateTime);
    
          if (overlappingFreeTime) {
            alert(
              `The times overlap with an existing free time: ${overlappingFreeTime.title}`
            );
          } else {
            const freeTime = {
              title: `Free Time ${freeTimes.length + 1}`,
              start: startDateTime,
              end: endDateTime,
            };
            addFreeTime(freeTime);
            setSelectedDate(null);
            setStartTime("");
            setEndTime("");
          }
        }
      };

      const handleSelectEvent = (event) => {
          setSelectedEvent(event);
          onOpen();
        };
      
        const renderEventContent = () => {
          const startDate = moment(selectedEvent.start).format(
            "MMMM Do YYYY, h:mm a"
          );
          const endDate = moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a");
          return (
            <p>
              {startDate} – {endDate}
            </p>
          );
        };

        const renderEditEventContent = () => {
            return (
              <>
                <DatePicker
                  isRequired
                  minValue={startDate}
                  maxValue={endDate}
                  className="max-w-[284px] border rounded p-2"
                  label="Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
                <TimeInput
                  className="max-w-[284px] border rounded p-2"
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
                <TimeInput
                  className="max-w-[284px] border rounded p-2"
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                  isInvalid={endTime && startTime ? endTime <= startTime : false}
                  errorMessage="End time must be greater than start time"
                />
              </>
            );
          };
        
          const deleteSelectedEvent = () => {
            setFreeTimes(
              freeTimes
                .filter((event) => event.start !== selectedEvent.start && event.end !== selectedEvent.end)
            );
            setSelectedEvent(null);
            onOpenChange();
          };
        
          const handleEditOpen = () => {
            onOpenChange();
            setIsEditOpen(true);
            const eventStart = toLocalTimeZone(parseAbsolute(selectedEvent.start.toISOString()))
            const eventEnd = toLocalTimeZone(parseAbsolute(selectedEvent.end.toISOString()))
            setSelectedDate(parseDate(eventStart.toString().split("T")[0]));
            setStartTime(parseTime(eventStart.toString().split("T")[1].slice(0, 5)));
            setEndTime(parseTime(eventEnd.toString().split("T")[1].slice(0, 5)));
          };
        
          const handleSavePress = () => {
            if (!selectedDate || !startTime || !endTime) {
              alert("Please fill all fields");
            } else if (endTime <= startTime) {
              alert("End time must be greater than start time");
            } else {
              const startDateTime = new Date(`${selectedDate}T${startTime}`);
              const endDateTime = new Date(`${selectedDate}T${endTime}`);
              const overlappingFreeTime = checkOverlap(startDateTime, endDateTime);
        
              if (overlappingFreeTime.start !== selectedEvent.start && overlappingFreeTime.end !== selectedEvent.end) {
                alert(
                  `The times overlap with an existing free time: ${overlappingFreeTime.title}`
                );
              } else {
                const freeTime = freeTimes.find((event) => event.start === selectedEvent.start && event.end === selectedEvent.end);
                freeTime.start = startDateTime;
                freeTime.end = endDateTime;
                setSelectedDate(null);
                setStartTime("");
                setEndTime("");
                setIsEditOpen(false);
              }
            }
          }
        
          const handleOnSavePress = async () => {
            
            //Check the user has scheduled this event or not
            const response_check_schedule = await fetch(`/api/userevent?userId=${user.user_id}&eventId=${event.event_id}`);
            const statusCode = response_check_schedule.status;
            

            if(statusCode === 201){

              const userResponse = confirm("You have not scheduled this event yet. Do you want to schedule it now?");

              if (!userResponse) {
                  alert("You chose No! Returning to the previous page...");
                  return;
              } else {
                alert("You chose Yes! Schedule this event");

                const response_schedule_event = await fetch("/api/userevent", {
                  method: "POST",
                  body: JSON.stringify({
                    userId:user.user_id,
                    eventId:event.event_id
                  }),
                });

                if(response_schedule_event.ok){alert("Event scheduled!")}
                else{alert(`Failed to scheduled this event`)};

              }
            }

            const response_save_freeTimes = await fetch("/api/freeTimes", {
              method: "POST",
              body: JSON.stringify({
                user:user.user_id,
                event:event.event_id,
                freetimes:freeTimes
              }),
            });
            
            if(response_save_freeTimes.ok){alert(`Saved ${freeTimes.length} free times`)}
            else{alert(`Failed to save free times`)};

          }

          const eventRange = {
            start: new Date(event.event_schedule_start),
            end: new Date(event.event_schedule_end),
          };

          

          return (
              <div className="bg-custom-page min-h-screen">
                <div className="calendar-container max-w-4xl mx-auto rounded-lg">
                  <ScheduleCalendar
                    onSelectEvent={handleSelectEvent}
                    eventRange={eventRange}
                    freeTimes={freeTimes}
                  />
                  <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                      {() => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">
                            {selectedEvent.title}
                          </ModalHeader>
                          <ModalBody>{renderEventContent(selectedEvent)}</ModalBody>
                          <ModalFooter>
                            <Button color="primary" onPress={handleEditOpen}>
                              Edit
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              onPress={deleteSelectedEvent}
                            >
                              Delete
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                  <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
                    <ModalContent>
                      {() => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">
                            Edit {selectedEvent.title}
                          </ModalHeader>
                          <ModalBody>{renderEditEventContent()}</ModalBody>
                          <ModalFooter>
                              <Button color="primary" onPress={handleSavePress}>
                                Save
                              </Button>
                            </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                </div>
                <div className="date-time-container text-center pt-10">
                  <DatePicker
                    isRequired
                    minValue={startDate}
                    maxValue={endDate}
                    className="max-w-[284px] border rounded p-2"
                    label="Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                  <TimeInput
                    className="max-w-[284px] border rounded p-2"
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                  />
                  <TimeInput
                    className="max-w-[284px] border rounded p-2"
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                    isInvalid={endTime && startTime ? endTime <= startTime : false}
                    errorMessage="End time must be greater than start time"
                  />
                </div>
                <div className="add-button-container text-center mt-4">
                  <Button onPress={handleOnAddPress} className="mr-2">
                    Add
                  </Button>
                  <Button color="primary" onPress={handleOnSavePress}>
                    Save
                  </Button>
                </div>
          
                <style jsx global>{`
                  html,
                  body {
                    overflow: hidden;
                  }
                `}</style>
              </div>
            );
}