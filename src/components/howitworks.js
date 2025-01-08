"use client";

import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";

const steps = [
    {
        title: "Sign Up",
        description: "Register your email to create an account and get started.",
    },
    {
        title: "Create Events",
        description: "Easily create and manage your events with our interface.",
    },
    {
        title: "Invite Participants",
        description: "Invite participants to join your events and set their availability.",
    },
    {
        title: "Find the Best Time",
        description: "Automatically find the best time for your event based on participants' availability.",
    },
];

export default function HowItWorks() {
    return (
        <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{
                y: 0,
                opacity: 1,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", bounce: 0 }}
            className="max-w-screen-xl w-full mx-auto px-4 py-28 gap-5 md:px-8 flex flex-col justify-center items-center"
        >
            <div className="flex flex-col gap-3 items-center">
                <h3 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                    How It Works
                </h3>
                <p className="max-w-xl text-muted-foreground text-center">
                    Follow these simple steps to get started with our platform.
                </p>
            </div>
            <div className="mt-4 flex flex-col items-center">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.3, type: "spring", bounce: 0 }}
                        className="relative flex flex-col items-center w-full"
                    >
                        <Card
                            shadow="none"
                            className="relative rounded-[20px] p-[2px] will-change-transform sm:scale-110 w-full"
                        >
                            <div className="z-[2] flex flex-col justify-between w-full h-full bg-card rounded-[18px] p-5 opacity-75">
                                <CardBody className="w-full flex items-start gap-3">
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#006FEE', color: 'white', borderRadius: '50%' }}>
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-xl font-light">{step.title}</h4>
                                        </div>
                                        <span className="text-muted-foreground text-sm font-light">
                                            {step.description}
                                        </span>
                                    </div>
                                </CardBody>
                                <Divider />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}