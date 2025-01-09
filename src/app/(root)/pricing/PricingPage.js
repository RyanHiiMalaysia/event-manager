"use client"
import React from "react";
import { Card, CardBody, Link, CardHeader, Image } from "@nextui-org/react";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <Card className="w-full max-w-md shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="flex justify-center bg-blue-500 text-white py-4">
          <h2 className="text-3xl font-bold">Pricing</h2>
        </CardHeader>
        <CardBody className="flex flex-col items-center p-6">
          <p className="text-lg text-center mb-4">Create unlimited events with Allocato's Pro plan, for a one-time purchase of RM5.</p>
          <Image alt="TNG eWallet QR" src="tng.jpg" />
          <ol className="list-decimal text-lg mx-4 mt-1 space-y-2">
            <li>If you haven't already, <Link href="/signup" className="text-lg">sign up</Link> with your email.</li>
            <li>Scan the QR code above.</li>
            <li>Make a payment of RM5.</li>
            <li>Message 016-3308777 on Whatsapp with proof of payment (screenshot of payment) along with your email address.</li>
            <li>Your account will be registered with the Pro plan within 12 hours.</li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}