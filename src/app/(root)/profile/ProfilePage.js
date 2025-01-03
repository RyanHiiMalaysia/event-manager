"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Spinner } from "@nextui-org/react";
import { Card, CardBody, CardHeader, CardFooter, Alert, Button, Link, Input, Form } from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";

export const EditIcon = ({ fill = "currentColor", filled, size, height, width, ...props }) => {
  return (
    <svg width="64px" height="64px" viewBox="-24 -24 72.00 72.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.00024000000000000003">
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.144" />
      <g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z" fill="#000000" /> </g>
    </svg>
  );
};

export const CancelIcon = ({ fill = "currentColor", filled, size, height, width, ...props }) => {
  return (
    <svg fill="#000000" width="64px" height="64px" viewBox="-32 -32 96.00 96.00" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.00032">
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
      <g id="SVGRepo_iconCarrier"> <title>cancel</title> <path d="M10.771 8.518c-1.144 0.215-2.83 2.171-2.086 2.915l4.573 4.571-4.573 4.571c-0.915 0.915 1.829 3.656 2.744 2.742l4.573-4.571 4.573 4.571c0.915 0.915 3.658-1.829 2.744-2.742l-4.573-4.571 4.573-4.571c0.915-0.915-1.829-3.656-2.744-2.742l-4.573 4.571-4.573-4.571c-0.173-0.171-0.394-0.223-0.657-0.173v0zM16 1c-8.285 0-15 6.716-15 15s6.715 15 15 15 15-6.716 15-15-6.715-15-15-15zM16 4.75c6.213 0 11.25 5.037 11.25 11.25s-5.037 11.25-11.25 11.25-11.25-5.037-11.25-11.25c0.001-6.213 5.037-11.25 11.25-11.25z" /> </g>

    </svg>
  );
};

const Profile = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false); // State for edit mode
  const [newName, setNewName] = useState(''); // State for new name input

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
          setNewName(userData.user_name); // Initialize newName with the current user name
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

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  const handleCancelClick = () => {
    setIsEditingName(false);
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('newName');

    try {
      const response = await fetch(`/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email, newName }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message);
        return;
      }

      setUser({ ...user, user_name: newName });
      setIsEditingName(false);
    } catch (error) {
      setError('An unexpected error occurred.');
    }
  };

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
            {isEditingName ? (
              <Form
                className="flex items-center space-x-2"
                validationBehavior="native"
                onSubmit={handleNameSubmit}
              >
                <Input
                  isRequired
                  errorMessage="Please enter a valid name"
                  labelPlacement="outside"
                  name="newName"
                  placeholder="Enter new name"
                  size="sm"
                />
                <div className="flex items-center space-x-2">
                  <Button auto size="sm" type="submit">
                    Save
                  </Button>
                  <Button isIconOnly color='FFFFFF' auto size="sm" onPress={handleCancelClick} className="p-0 ml-2 w-2 h-4">
                    <CancelIcon />
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="flex items-center">
                <p className="mt-1 text-sm text-gray-900">{user.user_name}</p>
                <Button isIconOnly color='FFFFFF' auto size="sm" onPress={handleEditClick} className="p-0 ml-2 w-4 h-4">
                  <EditIcon />
                </Button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.user_email}</p>
          </div>
        </CardBody>
        <CardFooter className="flex justify-center">
          {session.user.user_has_paid ? (
            <Alert color="success" title="Thank you for your purchase!" />
          ) : (
            <Alert
              color="danger"
              description="Pay to access our features"
              endContent={
                <Button color="danger" size="sm" variant="flat" as={Link}
                  href="/pricing">
                  Pricing
                </Button>
              }
              title="You do not have a paid account"
              variant="faded"
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;