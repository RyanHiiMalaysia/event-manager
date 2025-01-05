"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const [eventLink, setEventLink] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState(null);

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

  if (status === "loading" || !dataFetched) {
    return <div>Loading...</div>;
  }
  else if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  else {
    return <div>Admin Page</div>;
  }
}
