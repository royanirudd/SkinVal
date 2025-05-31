"use client";
import React, { useRef, useState } from "react";
import Navbar from "./Navbar";
import Skinquiz from "../small-components/Skinquiz";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "motion/react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "./AuthModal";
import { ArrowRight } from "lucide-react";

function Hero() {
  const [slideOpen, setSlideOpen] = useState(false);
  const [isMsgVisible, setIsMsgVisible] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responseOver, setResponseOver] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const { user } = useAuth();

  const containerRef = useRef(null);

  const questions = [
    {
      question: "How would you describe your skincare experience?",
      options: [
        "I'm just starting",
        "Figuring it out",
        "Improving",
        "Lost & need help",
      ],
    },
    {
      question: "How old are you?",
      options: ["<18", "18-24", "25-34", "35-44", "45+"],
    },
    {
      question: "What's your gender?",
      options: ["Female", "Male", "Prefer not to say"],
    },
    {
      question:
        "How does your skin usually feel by midday (without any product on)?(This reveals skin type and hydration needs.)",
      options: [
        "Shiny or greasy — especially on the forehead and nose",
        "Tight, flaky, or rough",
        "Oily in some areas (like nose), dry in others",
        "Comfortable and balanced",
        "Easily irritated or itchy",
      ],
    },
    {
      question:
        "What are the top 2 skin concerns you'd like to improve?(This helps target treatments and serums.)",
      options: [
        "Acne or breakouts",
        "Dark spots or uneven skin tone",
        "Fine lines and wrinkles",
        "Redness or sensitivity",
        "Dryness or dehydration",
      ],
    },
    {
      question: "How does your skin usually feel?",
      options: ["Tight and dry", "Balanced", "Oily", "Combination"],
    },
    {
      question: "How easily does your skin react?",
      options: ["Very easily", "Sometimes", "Rarely"],
    },
    {
      question: "Do you notice dark spots or uneven patches?",
      options: ["Yes", "A little", "Not really"],
    },
    {
      question: "Concerned about fine lines or wrinkles?",
      options: ["Yes", "Want to prevent", "Not a concern"],
    },
  ];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      console.log("answers:", answers);
      setIsMsgVisible(true);
      setTimeout(() => {
        setIsMsgVisible(false);
        setSlideOpen(false);
        setResponseOver(true);
      }, 1500);
    }
  };

  const handlePrev = () => setCurrentQuestionIndex((prev) => prev - 1);

  const handleSlideOpen = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else if (responseOver) {
      toast.message("Your response was already recorded!");
    } else {
      setSlideOpen(true);
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const parallax = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <motion.main
      ref={containerRef}
      className="w-full min-h-[100svh] relative overflow-hidden p-5 flex flex-col"
    >
      <motion.video
        className="absolute top-0 left-0  w-full h-full object-center object-fill -z-10"
        style={{ objectPosition: parallax }}
        autoPlay
        loop
        muted
      >
        <source src="/herovideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 -z-5"></div>
      {openAuthModal && <AuthModal onClose={() => setOpenAuthModal(false)} />}
      <Skinquiz
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        questions={questions}
        answers={answers}
        currentQuestionIndex={currentQuestionIndex}
        isMsgVisible={isMsgVisible}
        onNext={handleNext}
        onPrev={handlePrev}
        onAnswer={(index, value) =>
          setAnswers((prev) => ({ ...prev, [index]: value }))
        }
      />
      <Navbar />
      <div className="flex-grow flex flex-col justify-between my-[10vh] mt-[15vh] text-white">
        <div className="w-full">
          <div className="w-full flex justify-center mb-[1vh]">
            <span className="text-3xl md:text-4xl w-full flex justify-center text-white font-semibold tracking-wide">
              REVOLUTIONIZE YOUR
            </span>
          </div>
          <div className="w-full flex justify-center ">
            <span className="text-2xl md:text-4xl w-full flex justify-center text-white font-semibold tracking-wide">
              SHOPPING EXPERIENCE
            </span>
          </div>
          <p className="w-[80%] md:w-[20vw] text-center text-white/75 mx-auto mt-[3vh] text-sm flex justify-center">
            AI powered product recommendations tailored to your unique needs.
          </p>
        </div>
        <div
          onClick={handleSlideOpen}
          className="w-[300px] mx-auto flex justify-center items-center  bg-neutral-300  py-3  rounded-full relative"
        >
          <button onClick={handleSlideOpen} className="w-fit text-[#1a1a1a]">
            Get started
          </button>
          <span className="absolute h-[80%] right-1 flex items-center justify-center p-2 rounded-full bg-[#1a1a1a]">
            <ArrowRight className="size-6" />
          </span>
        </div>
      </div>
    </motion.main>
  );
}

export default Hero;
