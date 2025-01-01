"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Form, Input, Button, Link } from "@nextui-org/react";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function handleSignUp(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { name, email } = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message);
        return;
      }

      // Automatically sign in the user with Google after successful sign-up
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("An unexpected error occurred.");
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-black" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <Form
        onSubmit={handleSignUp}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md items-center dark:bg-transparent dark:border-default-100 dark:border"
        validationBehavior="native"
      >
        <div className="space-y-10">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Sign Up
          </h2>
          <Input
            type="text"
            name="name"
            label="Name"
            labelPlacement="outside"
            placeholder="Enter your name"
            variant="bordered"
            className="mt-16"
          />
          <Input
            type="email"
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="user@gmail.com"
            isRequired
            variant="bordered"
            description="Sign up with Google. We'll never share your email with anyone else."
          />
          <Button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </Button>
        </div>
        <div className="self-start px-2">
          {error && <p className="text-sm text-red-600 self-start">{error}</p>}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already registered your email?{" "}
            <Link size = "sm" href="#" onPress={() => signIn("google", { callbackUrl: "/" })}>Sign in</Link>
          </p>
        </div>
      </Form>
    </div>
  );
}