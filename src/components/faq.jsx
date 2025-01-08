"use client";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { motion } from "framer-motion";

export default function Faq() {
  const accordionItems = [
    {
      title: "What do you mean by finding the \"best time\" for an event?",
      content: (
        <div className="text-muted-foreground">
          We help you find the best date and time for your event that suits the availability of the most participants possible within your specified range.
        </div>
      ),
    },
    {
      title: "Can other people see my events?",
      content: (
        <div className="text-muted-foreground">
          Only you and the people invited to the event can see it.
        </div>
      ),
    },
    {
      title: "Can I edit my availability?",
      content: (
        <div className="text-muted-foreground">
          Yes. You can edit/remove your availability for an event anytime before the event is allocated.
        </div>
      ),
    },
    {
      title: "Who can see my availability for an event?",
      content: (
        <div className="text-muted-foreground">
          Only you and the admins of the event can see your availability.
        </div>
      ),
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
      className="relative max-w-screen-xl mx-auto px-4 py-28 gap-5 md:px-8 flex flex-col justify-center items-center"
    >
      <div className="flex flex-col gap-3 justify-center items-center">
        <h4 className="text-2xl font-bold sm:text-3xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          FAQ
        </h4>
        <p className="max-w-xl text-muted-foreground text-center">
          Here are some of our frequently asked questions.
        </p>
      </div>
      <div className="max-w-lg w-full">
        <Accordion
          fullWidth
          selectionMode="multiple"
          variant="splitted"
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                height: "auto",
                transition: {
                  height: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 1,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 1,
                  },
                },
              },
              exit: {
                y: -10,
                opacity: 0,
                height: 0,
                transition: {
                  height: {
                    easings: "ease",
                    duration: 0.25,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 0.3,
                  },
                },
              },
            },
          }}
        >
          {accordionItems.map((item, index) => (
            <AccordionItem
              key={index}
              aria-label={item.title}
              title={item.title}
              className="text-muted-foreground"
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}
