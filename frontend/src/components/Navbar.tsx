"use client";
import { useAuth } from "@/app/context/AuthContext";
import { Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Sidemenu from "./Sidemenu";

function Navbar() {
  const { user } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full flex justify-between items-center z-10 relative">
      <Sidemenu
        open={isMenuOpen}
        MenuClose={() => setIsMenuOpen(false)}
        user={user}
      />

      <h3 className="text-cyan-500 text-3xl tracking-wider relative w-fit rounded-full">
        sk
        <span className="relative inline-block">
          ı
          <span className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-red-600" />
        </span>
        nval
      </h3>
      <ul className="hidden text-lg md:flex gap-10 items-center  text-white">
        <Link href="/About-us">
          <li>About us</li>
        </Link>
        <Link href="/Contact">
          <li>Contact</li>
        </Link>
        {!user ? (
          <Link href="/login">
            <li className="bg-[#1a1a1a] rounded-full w-fit h-fit p-2">
              <UserRound className="text-white size-5" />
            </li>
          </Link>
        ) : (
          <Link href="/profile">
            <li className="bg-[#1a1a1a] rounded-full w-fit h-fit p-2">
              <UserRound className="text-white size-5" />
            </li>
          </Link>
        )}
      </ul>
      <p
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden bg-neutral-200 text-[#1a1a1a] p-2 rounded-full"
      >
        <Menu />
      </p>
    </nav>
  );
}

export default Navbar;
