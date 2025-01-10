"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, forwardRef } from "react";
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
        const response = await fetch(
          `/api/user-event?findIsUserIn=true&link=${eventLink}&email=${session.user.email}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }
        setIsAdmin(result.result);
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

  const SetCard = forwardRef(({ title, icon, description, className }, ref) => {
    return (
      <Card ref={ref} className={cn("border-small", "border-default-200", className)} shadow="sm">
        <CardBody className="flex h-full flex-row items-start gap-3 p-4">
          <div className={cn("item-center flex rounded-medium border p-2", "bg-primary-50 border-primary-100")}>
            <Icon className="text-primary" icon={icon} width={24} />
          </div>
          <div className="flex flex-col">
            <p className="text-medium">{title}</p>
            <p className="text-small text-default-400">{description}</p>
          </div>
        </CardBody>
        <Divider />
        <div className="flex flex-col gap-2">
          <Switch
            classNames={{
              base: cn(
                "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent"
              )
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-medium">Force Admin</p>
              <p className="text-tiny text-default-400">Includes all admins in the allocated time</p>
            </div>
          </Switch>
        </div>
      </Card>
    );
  });

  const ChangeTimeCard = forwardRef(({ title, icon, description, className }, ref) => {
    return (
      <Card ref={ref} className={cn("border-small", "border-default-200", className)} shadow="sm">
        <CardBody className="flex h-full flex-row items-start gap-3 p-4">
          <div className={cn("item-center flex rounded-medium border p-2", "bg-primary-50 border-primary-100")}>
            <Icon className="text-primary" icon={icon} width={24} />
          </div>
          <div className="flex flex-col">
            <p className="text-medium">{title}</p>
            <p className="text-small text-default-400">{description}</p>
          </div>

        </CardBody>
        <Divider />
          <div className="flex flex-col gap-2">
            <Select>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="2">2 hours</SelectItem>
              <SelectItem value="3">3 hours</SelectItem>
              <SelectItem value="4">4 hours</SelectItem>
              <SelectItem value="5">5 hours</SelectItem>
            </Select>
          </div>
      </Card>
    );
  });

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
          <SetCard
            description="Edit the allocation settings for the event."
            title="Allocation Settings"
            icon="solar:settings-linear"
          />
          <ChangeTimeCard
            description="Change the time of the event."
            title="Change Allocated Time"
            icon="solar:sort-by-time-linear"
          />
        </div>
      </div>
    );
  }
}
