"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Spinner } from "@nextui-org/react";
import { Card, CardBody, CardHeader, CardFooter } from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";

const Profile = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (status === 'loading' || loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <CardHeader className="flex flex-col items-center">
          <Avatar referrerPolicy={'no-referrer'}
                            size="xl"
                            src={session.user.image}
                            showFallback
                          />
          <h2 className="text-2xl font-bold text-center text-gray-900">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{user.user_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.user_email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Has Paid?</label>
            <p className="mt-1 text-sm text-gray-900">{user.user_has_paid ? 'Yes' : 'No'}</p>
          </div>
        </CardBody>
        <CardFooter className="flex justify-center">
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;