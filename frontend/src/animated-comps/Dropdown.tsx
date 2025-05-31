"use client";
import { Plus } from "lucide-react";
import { easeInOut, motion } from "motion/react";
import React, { useState } from "react";

interface DropdownProps {
  question: string;
  answer: string;
}

function Dropdown({ question, answer }: DropdownProps) {
  const [open, setOpen] = useState(false);

  const MotionPlus = motion.create(Plus);

  const variants = {
    open: {
      height: "auto",
      marginTop: "8px",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    closed: {
      height: 0,
      marginTop: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
  };

  const rotate = {
    open: {
      rotate: 45,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    closed: {
      rotate: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
  };

  return (
    <div
      onClick={() => setOpen(!open)}
      className="w-full p-5 border-b border-zinc-400"
    >
      <div className="w-full flex justify-between items-center">
        <h1 className="text-lg lg:text-2xl">{question}</h1>
        <MotionPlus
          variants={rotate}
          animate={open ? "open" : "closed"}
          initial="closed"
          className="transform origin-center"
        />
      </div>
      <motion.p
        variants={variants}
        initial="closed"
        animate={open ? "open" : "closed"}
        className="w-full lg:w-[70%]"
      >
        {answer}
      </motion.p>
    </div>
  );
}

export default Dropdown;
