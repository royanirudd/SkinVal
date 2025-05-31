import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function Contact() {
  return (
    <section className="w-full p-10 text-[#1a1a1a] relative">
      <Link
        href="/"
        className="absolute top-5 right-5 md:top-10 md:right-10 underline underline-offset-4"
      >
        back to page
      </Link>
      <h1 className="text-4xl w-fit mx-auto mb-8 md:mb-16 mt-[10vh]">
        Contact
      </h1>
      <div className="w-full md:w-[50%] mx-auto flex flex-col gap-4 md:gap-8">
        <p>We would love to hear from you.</p>
        <p>
          For any questions, feedback, or business inquiries, reach us through:
        </p>
      </div>
      <ul className="w-fit mx-auto flex flex-col mt-8 md:mt-16 list-disc gap-4">
        <li className="flex gap-4">
          Instagram : _skinval
          <Link href="https://www.instagram.com/_skinval/" target="_blank">
            <span className="ml-4 flex opacity-60 hover:opacity-100">
              view
              <span>
                <ArrowUpRight className="size-3" />
              </span>
            </span>
          </Link>
        </li>
        <li className="flex gap-4">
          X : skinval001
          <Link href="https://x.com/skinval001" target="_blank">
            <span className="ml-4 flex opacity-60 hover:opacity-100">
              view
              <span>
                <ArrowUpRight className="size-3" />
              </span>
            </span>
          </Link>
        </li>
        <li className="flex gap-4">
          Linkedin : Skinval
          <Link
            href="https://www.linkedin.com/company/skinval/"
            target="_blank"
          >
            <span className="ml-4 flex opacity-60 hover:opacity-100">
              view
              <span>
                <ArrowUpRight className="size-3" />
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

export default Contact;
