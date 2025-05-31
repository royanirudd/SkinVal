"use client";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import React, { useRef } from "react";

function Awareness() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const height = useTransform(scrollYProgress, [0, 1], ["60%", "100%"]);
  const width = useTransform(scrollYProgress, [0, 1], ["25%", "100%"]);
  const rotate = useTransform(scrollYProgress, [0, 0.8], [4, 0]);

  return (
    <section
      ref={container}
      className="w-full relative h-fit md:h-[200vh] flex flex-col md:block mt-5 md:mt-0"
    >
      <div className="w-full h-fit md:h-screen md:sticky top-0 flex justify-center items-center">
        <div className="w-full h-full md:absolute top-0 left-0  p-5 py-10 md:p-10 flex flex-col  gap-4 md:gap-0 md:justify-between">
          <h1 className="text-3xl md:text-4xl md:w-xl mb-4 md:mb-0">
            Skin care should feel easy, Not overwhelming
          </h1>

          <div className="w-full flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between">
            <p className="md:w-[24vw]">
              We guide you through your skin story step-by-step - just like a
              best friend would
            </p>
            <p className="md:w-[24vw]">
              No heavy apps. No confusing tech jargon. Just honest, simple
              guidance
            </p>
          </div>
          <p className="md:w-[24vw]">
            No need to guess - we match based on how your skin feels and
            behaves.
          </p>
        </div>
        <motion.div
          style={{ width: width, height: height, rotate: rotate }}
          className="hidden md:block md:w-[25%] md:h-[60%] relative -z-10"
        >
          <Image
            src="/Men-1.jpeg"
            alt="male-model"
            className="w-full h-full object-cover bg-center"
            fill
          />
        </motion.div>
      </div>
      <div className="w-full md:hidden h-[50svh] relative">
        <Image
          src="/Men-1.jpeg"
          alt="male-model"
          className="w-full h-full object-cover bg-center"
          fill
        />
      </div>
    </section>
  );
}

export default Awareness;
