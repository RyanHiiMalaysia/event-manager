"use client";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { motion } from "framer-motion";
import { Link } from "@nextui-org/link";
import { useSession } from "next-auth/react";

export default function Pricing() {
    const { data: session, status } = useSession();
    const plans = [
        {
            name: "Free Plan",
            desc: "Get started with the basics",
            price: 0,
            isMostPop: false,
            features: [
                "Create up to 5 events",
                "Join as many events as you want",
                "Find the best time",
            ],
        },
        {
            name: "Pro Plan",
            desc: "Make the best schedule for your events",
            price: 5,
            isMostPop: true,
            features: [
                "Create unlimited events",
                "Invite your friends",
                "Find the best time",
            ],
        },
    ];

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
                    Pricing
                </h3>
                <p className="max-w-xl text-muted-foreground text-center">
                    No subscriptions. A one-time payment is all you need.
                </p>
            </div>
            <div className="mt-16 gap-10 grid lg:grid-cols-2 place-content-center">
                {plans.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                        <Card
                            shadow="none"
                            className="relative rounded-[20px] p-[2px] will-change-transform"
                        >
                            {item.isMostPop ? (
                                <span className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#016FEE_70%,#C7DBFB_100%)]" />
                            ) : (
                                <span className="absolute inset-[-1000%] bg-border" />
                            )}
                            <div className="z-[2] flex flex-col justify-between w-full h-full bg-card rounded-[18px] p-5 opacity-75">
                                <CardBody className="w-full flex items-start gap-3">
                                    <div className="flex flex-col">
                                        <h4 className="text-xl font-light">{item.name}</h4>
                                        <span className="text-muted-foreground text-sm font-light">
                                            {item.desc}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-light">RM{item.price}</span>

                                    <Divider />

                                    <div className="flex flex-col gap-5 pb-5">
                                        <span className="text-muted-foreground text-sm font-light">
                                            Includes
                                        </span>
                                        <ul className="flex flex-col gap-2">
                                            {item.features.map((feature, index) => (
                                                <li key={index} className="text-sm font-light">
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardBody>
                                <CardFooter className="p-0 flex items-center justify-center">
                                    {session?.user?.user_has_paid && (
                                        <img src="dancingBear.gif" alt="Dancing Bear" className="h-16 mr-4" draggable="false"/>
                                    )}
                                    <Button
                                        className="w-full"
                                        variant="solid"
                                        color={item.isMostPop ? "primary" : "default"}
                                        as={Link}
                                        href="/pricing"
                                        isDisabled={session?.user?.user_has_paid}
                                    >
                                        {session?.user?.user_has_paid ? "Thank you!" : "Get Started"}
                                    </Button>
                                    {session?.user?.user_has_paid && (
                                        <img src="dancingBear.gif" alt="Dancing Bear" className="h-16 ml-4" draggable="false"/>
                                    )}
                                </CardFooter>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}