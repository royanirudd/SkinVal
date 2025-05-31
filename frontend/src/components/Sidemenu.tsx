import { User } from "firebase/auth";
import { Instagram, Linkedin, Twitter, X } from "lucide-react";
import { AnimatePresence, easeOut, motion } from "motion/react";
import Link from "next/link";
import React from "react";

interface SidemenuProps {
  MenuClose: () => void;
  open: boolean;
  user: User | null;
}

function Sidemenu({ MenuClose, open, user }: SidemenuProps) {
  const slidingModal = {
    initial: { x: "100%" },
    enter: { x: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
    exit: {
      x: "100%",
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          variants={slidingModal}
          initial="initial"
          animate="enter"
          exit="exit"
          className="lg:hidden w-full min-h-[100svh] bg-white text-[#1a1a1a] fixed top-0 left-0 z-50 p-5"
        >
          <div className="w-full flex justify-end p-5">
            <X onClick={MenuClose} className="text-black size-12 " />
          </div>
          <ul className="flex flex-col gap-4 text-4xl mt-[5vh]">
            <Link href="/Contact">
              <li className="border-b p-4">Contact</li>
            </Link>
            <Link href="/About-us">
              <li className="border-b p-4">About us</li>
            </Link>

            {user ? (
              <Link href="/profile">
                <li className="border-b p-4">Profile</li>
              </Link>
            ) : (
              <Link href="/login">
                <li className="border-b p-4">Login/Sign up</li>
              </Link>
            )}
          </ul>
          <div className="flex gap-16 mt-[10vh]">
            <Link href="https://www.instagram.com/_skinval/" target="_blank">
              <Instagram className="size-10" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/skinval/"
              target="_blank"
            >
              <Linkedin className="size-10" />
            </Link>
            <Link href="https://x.com/skinval001" target="_blank">
              <Twitter className="size-10" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Sidemenu;
