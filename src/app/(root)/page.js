"use client"

import { Button, Link } from "@nextui-org/react";

export default function Home() {
  return (
    <>
    <h1 className="heading">Home</h1>
    <Button className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
      radius="full" as={Link} href="/signUp">
                Sign Up
              </Button>
    </>
  );
}