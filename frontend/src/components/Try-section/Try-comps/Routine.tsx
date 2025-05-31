import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import React, { useRef } from "react";

interface RoutinePropTypes {
  routine: {
    routine: string;
  };
}

function Routine({ routine }: RoutinePropTypes) {
  const morning = routine.routine.match(/AM([\s\S]*?)(PM|$)/);
  const night = routine.routine.match(/PM([\s\S]*)/);

  const formatSteps = (text: string) => {
    return text
      .split("•")
      .map((steps) => steps.trim())
      .filter((step) => step.length > 0);
  };

  const morningSteps = morning ? formatSteps(morning[1]) : [];
  const nightSteps = night ? formatSteps(night[1]) : [];

  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const parallax = useTransform(scrollYProgress, [0, 1], ["10%", "100%"]);

  return (
    <div ref={containerRef} className="w-full  text-[#1a1a1a]">
      <h1 className="text-4xl text-[#1a1a1a] mt-10">Skincare routine</h1>
      <div className="w-full  flex flex-col-reverse lg:flex-row gap-4 mt-8">
        <div className="w-full lg:w-[70%] bg-white border-2 border-[#1a1a1a]/10 pb-4">
          {morningSteps.length > 0 && (
            <>
              <div className="w-full flex justify-between items-center text-white bg-[#1a1a1a] border-b border-[#1a1a1a]/60 p-4">
                <div>
                  <h1 className="text-lg md:text-xl">Morning</h1>
                  <p className="text-sm opacity-75">
                    Start your day with these steps
                  </p>
                </div>
                <p className="opacity-75 hidden md:block">
                  Optimal time: 7.00 - 8.00 AM
                </p>
              </div>
              <ul className="w-full flex flex-col gap-2 p-5">
                {morningSteps.map((text, i) => (
                  <li
                    className="w-full lg:p-2 border-b border-[#1a1a1a]/20"
                    key={i}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <motion.div
          className="w-full md:w-[90%] lg:w-[30%] min-h-[600px] bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('/morning-1.jpg')",
            backgroundPositionY: parallax,
            backgroundSize: "auto 140%",
          }}
        ></motion.div>
      </div>
      <div className="w-full flex flex-col md:items-end lg:items-start lg:flex-row gap-4 mt-8">
        <motion.div
          className="w-full md:w-[90%] lg:w-[30%] min-h-[600px] bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('/Nighcare-2.jpg')",
            backgroundPositionY: parallax,
            backgroundSize: "auto 140%",
          }}
        ></motion.div>
        <div className="w-full  lg:w-[70%] bg-white  border-2 border-[#1a1a1a]/10 pb-4">
          {nightSteps.length > 0 && (
            <>
              <div className="w-full flex justify-between items-center text-white bg-[#1a1a1a] border-b border-[#1a1a1a]/60 p-4">
                <div>
                  <h1 className="text-lg md:text-xl">Night</h1>
                  <p className="text-sm opacity-75">
                    End your day with these steps
                  </p>
                </div>
                <p className="opacity-75 hidden md:block">
                  Optimal time: 8.00 - 10.00 PM
                </p>
              </div>
              <ul className="w-full  flex flex-col gap-2 md:p-5">
                {nightSteps.map((text, i) => (
                  <li
                    className="w-full p-2 border-b border-[#1a1a1a]/20"
                    key={i}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Routine;
