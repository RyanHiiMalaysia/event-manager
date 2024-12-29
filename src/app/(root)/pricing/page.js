"use client";

import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Image } from "@nextui-org/react";

const PricingPage = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex mt-4 mx-4">
          <h2 className="text-3xl bold">Pricing</h2>
        </CardHeader>
        <CardBody className="flex flex-col items-center">
          <p className="text-lg mx-4">Get lifetime access to our Event Manager for a one-time purchase of RM5.</p>
          <Image alt="TNG eWallet QR" src="tng.jpg" />
        </CardBody>
      </Card>
    </div>
  );
};

export default PricingPage;
