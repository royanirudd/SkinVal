"use client";

import { CircleSmall, SendHorizonal, X } from "lucide-react";
import { easeInOut, motion, stagger, useAnimate } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Product {
  product_url: string;
  price?: number;
  rating?: number;
  reviews_count?: number;
  image_url?: string;
  title?: string;
}

interface Category {
  category: string;
  products: Product[];
}

interface ChatbotPropType {
  recommendations: Category[];
  analysisId: string;
  routine: string;
  tips: string;
}

function Chatbot({
  recommendations,
  analysisId,
  routine,
  tips,
}: ChatbotPropType) {
  const [chatMessages, setChatMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [userMessage, setUserMessage] = useState("");
  const [scope, animate] = useAnimate();
  const [aiJustResponded, setAiJustResponded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  async function messageToAI(Message: string, sessionId: string) {
    if (!Message.trim()) {
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", message: Message },
      { sender: "AI", message: "typing..." }, // Temporary placeholder
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: Message,
            sessionId: sessionId,
            context: {
              routine: routine,
              products: recommendations.map((cat) => ({
                category: cat.category,
                products: cat.products.map((product) => ({
                  title: product.title,
                  price: product.price,
                  rating: product.rating,
                  reviews_count: product.reviews_count,
                })),
              })),
              tips: tips,
            },
            llm: "gemini",
          }),
        }
      );

      const data = await response.json();

      const aiResponse = data.response;

      if (data.success) {
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            sender: "AI",
            message: aiResponse.text,
          }; // Replace "typing..."
          return updated;
        });
        setAiJustResponded(true);
      } else {
        // in else or catch
        setChatMessages((prev) => {
          const updated = [...prev];
          // Replace the last message (AI's "typing...") with error message
          updated[updated.length - 1] = {
            sender: "AI",
            message: "",
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // in else or catch
      setChatMessages((prev) => {
        const updated = [...prev];
        // Replace the last message (AI's "typing...") with error message
        updated[updated.length - 1] = {
          sender: "AI",
          message: "",
        };
        return updated;
      });
    }
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (userMessage.trim()) {
      messageToAI(userMessage, analysisId);
      setUserMessage("");
    } else {
      console.log("User message is empty, not sending.");
    }
  }

  useEffect(() => {
    if (!scope.current) {
      return;
    }
    startStagger();
    setAiJustResponded(false);
    // if (!aiJustResponded) return;

    // // Small delay to let DOM render
    // const timeout = setTimeout(() => {
    //   startStagger();
    //   setAiJustResponded(false); // reset the flag
    // }, 50);
  }, [aiJustResponded, scope]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  function startStagger() {
    animate(
      ".ai-msg",
      {
        opacity: 1,
      },
      {
        duration: 0.3,
        ease: easeInOut,
        delay: stagger(0.05),
      }
    );
  }

  const [isActive, setIsActive] = useState(false);

  const variants = {
    open: {
      height: "70vh",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <main
      className="w-fit h-fit fixed z-20 bottom-5 right-5 flex flex-col gap-1 justify-end items-end transition-transform duration-300 ease-in"
      data-lenis-prevent
    >
      <motion.div
        variants={variants}
        initial="closed"
        animate={isActive ? "open" : "closed"}
        className="w-[85vw] lg:w-[40vw]  bg-slate-100 rounded-3xl border border-black flex flex-col"
      >
        <div className="w-full text-black/75 border-b p-4 bg-[#1a1a1a] border-zinc-700 rounded-t-3xl flex justify-between ">
          <div>
            <p className="text-xs text-start text-white">chat with</p>
            <p className="text-start flex gap-2 text-sm items-center text-white">
              <span>
                <CircleSmall className="size-3 text-green-500 fill-current" />
              </span>
              AI Assistant
            </p>
          </div>

          <h3 className="text-cyan-500 h-full flex items-center font-semibold text-2xl tracking-wide relative">
            sk
            <span className="relative inline-block">
              ı
              <span className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
            </span>
            nval
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto overflow-hidden p-2 text-sm scrollable-area overscroll-none">
          {chatMessages.map((msg, i) => (
            <div
              ref={
                msg.sender === "AI" && i === chatMessages.length - 1
                  ? scope
                  : null
              }
              key={i}
              className={`h-fit m-1 p-1 text-black/75 ${
                msg.sender === "AI"
                  ? "float-left text-left w-full rounded-md"
                  : "float-right text-left bg-gray-200 max-w-[75%] p-2 px-4 rounded-2xl"
              }`}
            >
              {msg.sender === "user" ? (
                <span className="bg-gray-200 w-full h-full rounded-2xl">
                  {msg.message}
                </span>
              ) : msg.message === "typing..." ? (
                <p className="animate-pulse text-gray-500"> Thinking...</p>
              ) : msg.message === "" ? (
                <p className="text-black/75">
                  AI unavailable. Please try another model.
                </p>
              ) : (
                <>
                  {msg.message.split(" ").map((words, i) => (
                    <motion.span
                      key={i}
                      className="ai-msg relative inline-block text-black/75"
                      style={{
                        opacity: 0,
                      }}
                    >
                      {words}&nbsp;
                    </motion.span>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="w-full h-14 flex justify-between p-2 text-lg border-t mt-3 border-zinc-700"
        >
          <input
            type="text"
            placeholder="Type here..."
            className="w-full bg-gray-200 rounded-l-md outline-none focus:outline-none p-1 text-sm text-black/75 placeholder:text-black/60"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-[#1a1a1a] text-white rounded-r-md"
          >
            <SendHorizonal />
          </button>
        </form>
      </motion.div>
      <div>
        {!isActive ? (
          <div className="size-14 rounded-full flex justify-end fixed bottom-5 right-5 z-40 border bg-white">
            <Image
              onClick={() => setIsActive(!isActive)}
              className="w-full h-full rounded-full object-contain p-2"
              src="/roobo-3.jpg"
              alt="chatbot"
              width={500}
              height={500}
            />
          </div>
        ) : (
          <div
            onClick={() => setIsActive(!isActive)}
            className="size-14 rounded-full  bottom-5 right-5 flex items-center bg-[#1a1a1a] justify-center cursor-pointer"
          >
            <X className="size-10 text-white rounded-full bg-[#1a1a1a] p-2" />
          </div>
        )}
      </div>
    </main>
  );
}

export default Chatbot;
