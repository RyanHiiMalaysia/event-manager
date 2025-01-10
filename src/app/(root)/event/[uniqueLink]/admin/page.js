"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ActionCard from "@/components/ActionCard";
import Error from "next/error";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Card, CardBody, Divider, Switch, cn, Select, SelectItem } from "@nextui-org/react";

export default function Page() {
  const { data: session, status } = useSession();
  const [eventLink, setEventLink] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);
  const [forceAdmin, setForceAdmin] = useState(false);
  const [allocatedStart, setAllocatedStart] = useState(null);
  const [allocateTimes, setAllocateTimes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      const eventLink = segments[segments.length - 2];
      setEventLink(eventLink);
    }
  }, []);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const headers = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };

        const fetchData = async (link) => {
          const response = await fetch(link, headers);
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.message || "Failed to fetch events");
          }
          return result;
        };

        const [forceAdminData, isAdminData, allocateTimesData] = await Promise.all([
          fetchData(`/api/events?link=${eventLink}&forceAdmin=true`),
          fetchData(`/api/user-event?findIsUserIn=true&link=${eventLink}&email=${session.user.email}`),
          fetchData(`/api/allocatetimes?link=${eventLink}`),
        ]);

        setForceAdmin(forceAdminData.result[0].event_force_admin);
        setAllocatedStart(forceAdminData.result[0].event_allocated_start);
        setIsAdmin(isAdminData.result);
        setAllocateTimes(
          allocateTimesData.allocateTimes.map((time, index) => {
            const startDate = new Date(time.at_start);
            const endDate = new Date(time.at_end);
            const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
            const startDateString = startDate.toLocaleDateString("en-GB", dateOptions);
            const endDateString = endDate.toLocaleDateString("en-GB", dateOptions);
            const timeOptions = { hour: "2-digit", minute: "2-digit" };
            const startTimeString = startDate.toLocaleTimeString([], timeOptions);
            const endTimeString = endDate.toLocaleTimeString([], timeOptions);

            const label =
              startDateString === endDateString
                ? `${startDateString} ${startTimeString} - ${endTimeString}`
                : `${startDateString} ${startTimeString} - ${endDateString} ${endTimeString}`;

            return { ...time, key: index, label };
          })
        );
      } catch (error) {
        setError(error);
      } finally {
        setDataFetched(true);
      }
    };

    if (session && eventLink && !dataFetched) {
      fetchAdminStatus();
    }
  }, [session, eventLink, dataFetched]);

  const updateForceAdmin = (value) => {
    const update = async (value) => {
      try {
        const response = await fetch(`/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            link: eventLink,
            edit: true,
            forceAdmin: value,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }
      } catch (error) {
        setError(error);
      }
    };
    setForceAdmin(value);
    update(value);
  };

  const updateAllocatedTime = ({ at_id }) => {
    const update = async (at_id) => {
      try {
        const response = await fetch(`/api/allocatetimes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            link: eventLink,
            at_id: at_id,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }
      } catch (error) {
        setError(error);
      }
    };
    update(at_id);
  };

  if (status === "loading" || !dataFetched) {
    return null;
  } else if (!isAdmin) {
    return <Error statusCode={403} title="You do not have permission to view this page" />;
  } else {
    return (
      <div className="flex flex-col space-y-4 justify-between items-center py-2 lg:px-16 sm:px-8 px-4 py-4">
        <h1 className="text-2xl font-bold">Admin Page</h1>
        <div className="flex max-w-sm flex-col gap-3">
          <ActionCard
            description="View the free times of participants."
            icon="solar:calendar-linear"
            title="Open Calendar"
            color="primary"
            onPress={() => router.push(`/event/${eventLink}/admin/calendar`)}
          />
          <ActionCard
            description="Edit the details of the event."
            icon="solar:document-add-linear"
            title="Edit event"
            color="secondary"
            onPress={() => router.push(`/event/${eventLink}/admin/edit`)}
          />
          <ActionCard
            description="Edit and remove participants from the event in the actions section."
            icon="solar:user-id-linear"
            title="Manage participants"
            color="warning"
            onPress={() => router.push(`/event/${eventLink}/participants`)}
          />

          <Card className={cn("border-small", "border-default-200")} shadow="sm">
            <CardBody className="flex h-full flex-row items-start gap-3 p-4">
              <div className={cn("item-center flex rounded-medium border p-2", "bg-primary-50 border-primary-100")}>
                <Icon className="text-primary" icon="solar:settings-linear" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-medium">Allocation Settings</p>
                <p className="text-small text-default-400">Edit the allocation settings for the event.</p>
              </div>
            </CardBody>
            <Divider />
            <div className="flex flex-col gap-2">
              <Switch
                onValueChange={updateForceAdmin}
                isSelected={forceAdmin}
                isDisabled={allocatedStart !== null}
                classNames={{
                  base: cn(
                    "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                    "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent"
                  ),
                }}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-medium">Force Admin</p>
                  <p className="text-tiny text-default-400">Includes all admins in the allocated time</p>
                </div>
              </Switch>
            </div>
          </Card>
          <Card className={cn("border-small", "border-default-200")} shadow="sm">
            <CardBody className="flex h-full flex-row items-start gap-3 p-4">
              <div className={cn("item-center flex rounded-medium border p-2", "bg-secondary-50 border-secondary-100")}>
                <Icon className="text-secondary" icon="solar:sort-by-time-linear" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-medium">Change Allocated Time</p>
                <p className="text-small text-default-400">Change the time of the event.</p>
              </div>
            </CardBody>
            <Divider />
            <div className="flex flex-col gap-2">
              <Select
                variant="flat"
                placeholder={
                  allocatedStart === null
                    ? "Deadline has not passed"
                    : new Date(allocatedStart) < new Date()
                    ? "Event has already ended"
                    : "Select allocated time"
                }
                items={allocateTimes}
                disallowEmptySelection
                isDisabled={new Date(allocatedStart) < new Date()}
                aria-label="Select allocated time"
                onChange={(selected) => updateAllocatedTime(allocateTimes[selected.target.value])}
                {...(allocateTimes.findIndex((time) => time.at_start === allocatedStart) !== -1 && {
                  defaultSelectedKeys: [String(allocateTimes.findIndex((time) => time.at_start === allocatedStart))],
                })}
                // renderValue={(items) => {
                //   return items.map((item) => (
                //     <SelectItem key={item.key}>
                //       <div className="flex gap-2 items-center">
                //         <div className="flex flex-col">
                //           <span className="text-small">{item.data}</span>
                //           <span className="text-small text-default-400">Participants: {item.data.at_participants}</span>
                //         </div>
                //       </div>
                //     </SelectItem>
                //   ));
                // }}
              >
                {allocateTimes.map(({ key, label, at_participants }) => (
                  <SelectItem key={key} textValue={label}>
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col">
                        <span className="text-small">{label}</span>
                        <span className="text-small text-default-400">Participants: {at_participants}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
