"use client";

import { AnimatePresence, motion, easeOut } from "motion/react";
import { X, MoveLeft, MoveRight } from "lucide-react";

interface SkinquizPropTypes {
  open: boolean;
  onClose: () => void;
  questions: { question: string; options: string[] }[];
  answers: { [key: number]: string };
  currentQuestionIndex: number;
  isMsgVisible: boolean;
  onNext: () => void;
  onPrev: () => void;
  onAnswer: (index: number, value: string) => void;
}

const slidingModal = {
  initial: { x: "100%" },
  enter: { x: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
  exit: { x: "100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
};

const opacity = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.3, ease: easeOut, delay: 0.3 },
  },
};

export default function Skinquiz({
  open,
  onClose,
  questions,
  answers,
  currentQuestionIndex,
  isMsgVisible,
  onNext,
  onPrev,
  onAnswer,
}: SkinquizPropTypes) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          variants={slidingModal}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-[100svh] bg-[#1a1a1a] fixed z-30 [scroll-behaviour: 'none'] inset-0 flex justify-center items-center "
        >
          <X
            onClick={onClose}
            className="text-white size-10 absolute top-7 right-7 cursor-pointer"
          />
          <AnimatePresence mode="wait">
            {isMsgVisible ? (
              <motion.div
                variants={opacity}
                initial="initial"
                animate="enter"
                className="w-[70%] lg:max-w-lg flex flex-col items-center justify-center p-5"
              >
                <h1 className="text-3xl font-semibold text-center text-white">
                  Thank you for your response!
                </h1>
                <p className="text-lg text-center mt-4 text-white/80">
                  We appreciate your participation. Your input helps us deliver
                  a better experience.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestionIndex}
                variants={opacity}
                initial="initial"
                animate="enter"
                className="w-full lg:w-[50%] text-white flex flex-col p-10 lg:p-1"
              >
                <div className="w-full flex justify-between items-center">
                  <h1>{questions[currentQuestionIndex].question}</h1>
                  <p className="text-white/60">
                    {currentQuestionIndex + 1} / {questions.length}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-3">
                  {questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <label
                        className="w-full flex gap-3 border border-gray-600 p-2 rounded-lg hover:border-zinc-300"
                        key={index}
                      >
                        <input
                          value={option}
                          type="radio"
                          checked={answers[currentQuestionIndex] === option}
                          onChange={() =>
                            onAnswer(currentQuestionIndex, option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
                <div className="w-full flex justify-between">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={onPrev}
                      className="w-fit px-5 flex justify-center items-center gap-3 py-1 text-sm border border-white bg-[#1a1a1a] rounded-xl mt-10 hover:bg-white hover:text-black"
                    >
                      Prev
                      <MoveLeft className="size-3" />
                    </button>
                  )}
                  <button
                    disabled={!answers[currentQuestionIndex]}
                    onClick={onNext}
                    className={`w-fit px-5 flex justify-center items-center gap-3 py-1 text-sm border border-white bg-[#1a1a1a] rounded-xl mt-10 hover:bg-white hover:text-black ${
                      currentQuestionIndex === 0 && "ml-auto"
                    } disabled:text-white/50 disabled:border-white/50 disabled:cursor-not-allowed disabled:bg-[#1a1a1a] `}
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Finish"
                      : "Next"}
                    <MoveRight className="size-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
