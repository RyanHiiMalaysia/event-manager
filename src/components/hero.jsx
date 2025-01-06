"use client";

import { Button } from "@nextui-org/button";
import { motion } from "framer-motion";
import { useDisclosure } from "@nextui-org/use-disclosure";
import { Link } from "@nextui-org/link";
import { useSession } from "next-auth/react";

export default function Hero() {
    const { data: session, status } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <div className="relative justify-center items-center">
            <section className="max-w-screen-xl mx-auto px-4 py-28 gap-12 md:px-8 flex flex-col justify-center items-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0 }}
                    className="flex flex-col justify-center items-center space-y-5 max-w-4xl mx-auto text-center"
                >
                    <span className="w-fit h-full text-sm bg-card px-2 py-1 border border-border rounded-full">
                        Welcome to Allocato!
                    </span>
                    <h1 className="text-4xl font-medium tracking-tighter mx-auto md:text-6xl text-pretty ">
                        Manage your events seamlessly
                    </h1>
                    <p className="max-w-2xl text-lg mx-auto text-muted-foreground text-balance">
                        Organise and manage all your events with ease using our event management platform.
                    </p>
                    {status !== "loading" && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0"
                        >
                            {session ? (
                                <p className="text-lg font-medium text-pretty">Hey there, {session.user.chosenName}!</p>
                            ) : (
                                <Button onPress={onOpen} color="primary" variant="shadow" as={Link} href="/signup">
                                    Sign up
                                </Button>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </section>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.5, type: "spring", bounce: 0 }}
                className="w-full h-full absolute -top-32 flex justify-end items-center pointer-events-none "
            >
                <div className="w-3/4 flex justify-center items-center">
                    <div className="w-12 h-[600px] bg-light blur-[70px] rounded-3xl max-sm:rotate-[15deg] sm:rotate-[35deg] [will-change:transform]"></div>
                </div>
            </motion.div>
        </div>
    );
}