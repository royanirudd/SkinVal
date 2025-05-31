"use client";
import { motion, useScroll, useTransform } from "motion/react";
import React, { useRef } from "react";

function WorkGuide() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const parallax = useTransform(scrollYProgress, [0, 1], ["80%", "60%"]);

  return (
    <section ref={containerRef} className="w-full p-5 py-10  md:p-10 mt-10">
      <h1 className="text-3xl md:text-5xl mb-10">How it works?</h1>
      <div className="w-full flex flex-1/2 gap-4">
        <div className="w-full md:w-[50%] flex flex-col gap-4">
          <div className="w-full p-4 flex flex-col gap-4 bg-[#DEE0DF] rounded-3xl">
            <h1 className="text-xl size-10 flex justify-center items-center rounded-full p-2 text-white bg-[#1a1a1a]">
              1
            </h1>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-xl">Create your profile</h2>
              <p className="opacity-75">
                Tell us about your skin type, concerns and goals for personlized
                advice.
              </p>
            </div>
          </div>
          <div className="w-full p-4 flex flex-col gap-4 bg-[#DEE0DF] rounded-3xl">
            <h1 className="text-xl size-10 flex justify-center items-center rounded-full p-2 text-white bg-[#1a1a1a]">
              2
            </h1>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-xl">Track your journey</h2>
              <p className="opacity-75">
                Log daily check-ins and photos to monitor your skin&apos;s
                progress overtime.
              </p>
            </div>
          </div>
          <div className="w-full p-4 flex flex-col gap-4 bg-[#DEE0DF] rounded-3xl">
            <h1 className="text-xl size-10 flex justify-center items-center rounded-full p-2 text-white bg-[#1a1a1a]">
              3
            </h1>
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-xl">Get auctionable insights</h2>
              <p className="opacity-75">
                Recieve AI-powered recommendations for products and routines
                that work for you.
              </p>
            </div>
          </div>
        </div>
        <div className="w-[50%] hidden md:block">
          <motion.div
            style={{
              backgroundImage: "url('/apply-1.jpg')",
              backgroundPositionY: parallax,
            }}
            className="w-full h-full bg-no-repeat bg-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default WorkGuide;
