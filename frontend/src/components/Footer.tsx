import { Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="w-full p-5 py-10 md:p-10 bg-[#1a1a1a] text-white mt-10">
      <div className="w-full flex flex-col md:flex-row md:flex-1/2 pb-10">
        <div className="w-full md:w-[50%] flex justify-center md:justify-start items-center">
          <h1 className="text-cyan-500 font-semibold text-7xl lg:text-9xl tracking-wide relative bg-[#1a1a1a] w-fit rounded-full">
            sk
            <span className="relative inline-block">
              ı
              <span className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 md:size-4 rounded-full bg-red-600" />
            </span>
            nval
          </h1>
        </div>
        <div className="w-[80%] mx-auto md:mx-0 md:w-[50%] flex gap-16 justify-between md:justify-end mt-[4vh] md:mt-0">
          <div className="flex flex-col gap-4">
            <h4 className="text-md font-bold">Quick Links</h4>
            <ul className="flex flex-col gap-2 opacity-75">
              <Link href="/">
                <li>Home</li>
              </Link>
              <li>Features</li>
              <Link href="/About-us">
                <li>About us</li>
              </Link>
              <Link href="/Contact">
                <li>Contact</li>
              </Link>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-md font-bold">Resources</h4>
            <ul className="flex flex-col gap-2 opacity-75">
              <li>Skin Guide</li>
              <li>Ingredient Box</li>
              <li>Blog</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="px-5 pt-5 border-t border-white text-white text-sm flex justify-between items-center opacity-60">
        <div className="flex gap-16">
          <p> &copy;skinval. All rights reserved</p>
          <ul className="md:flex gap-8 hidden">
            <li className="underline underline-offset-4">Privacy</li>
            <li className="underline underline-offset-4">Terms</li>
            <li className="underline underline-offset-4">Cookies</li>
          </ul>
        </div>
        <div className="flex gap-4 md:gap-8">
          <Link href="https://www.instagram.com/_skinval/" target="_blank">
            <Instagram />
          </Link>
          <Link
            href="https://www.linkedin.com/company/skinval/"
            target="_blank"
          >
            <Linkedin />
          </Link>
          <Link href="https://x.com/skinval001" target="_blank">
            <Twitter />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
