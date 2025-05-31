"use client";
import DragDrop from "@/small-components/DragDrop";
import { useEffect, useState } from "react";
import Recommendations from "./Try-comps/Recommendations";
import Routine from "./Try-comps/Routine";
import { useAnalyze } from "./hooks/useAnalyze";
import { useImageUploads } from "./hooks/useImageUploads";
import { usePollingResults } from "./hooks/usePollingResults";
import { Category } from "./types";
import Chatbot from "./Try-comps/Chatbot";
import { toast } from "sonner";
import ConfirmAnalyze from "./Try-comps/ConfirmAnalyze";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ImageSide = "Middle" | "Left" | "Right";

function Try() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Category[] | null>(
    null
  );
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [price, setPrice] = useState("all");
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const {
    imagePrevs,
    imageFiles,
    handleImagePrevs,
    clearImages,
    imageLoading,
  } = useImageUploads();

  const loadingMessages = ["Analyzing...", "Initializing...", "Generating..."];

  const analyzeMutation = useAnalyze((data) => {
    setRecommendations(data.recommendations || []);
    setAnalysisId(data.analysisId || null);
  });

  const pollingQuery = usePollingResults(analysisId);
  const routine = pollingQuery.data?.routine;
  const tips = pollingQuery.data?.tips;

  console.log(pollingQuery);

  useEffect(() => {
    if (!analyzeMutation.isPending) {
      setCurrentMsgIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [analyzeMutation.isPending, loadingMessages.length]);

  const handleAnalyze = () => {
    const formData = new FormData();
    if (imageFiles["Middle"])
      formData.append("image_front", imageFiles["Middle"]!);
    if (imageFiles["Left"]) formData.append("image_left", imageFiles["Left"]!);
    if (imageFiles["Right"])
      formData.append("image_right", imageFiles["Right"]!);
    formData.append("priceRange", price);

    analyzeMutation.mutate(formData);
  };

  const handleLogic = () => {
    const keys = Object.keys(imagePrevs);
    if (keys.length >= 1 && keys.length < 3) {
      setShowModal(true);
    } else if (keys.length <= 0) {
      toast.message(
        "Please upload the middle, left, and right images of the face before clicking Analyze."
      );
    } else {
      handleAnalyze();
    }
  };

  function handleRemove() {
    clearImages();
    setAnalysisId(null);
    setRecommendations(null);
  }

  const { user, authloading } = useAuth();

  useEffect(() => {
    if (!authloading && user) {
    }
  }, [user, authloading]);

  if (authloading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <section className="w-full p-5 py-10 md:p-10 text-[#1a1a1a]">
      {openAuthModal && <AuthModal onClose={() => setOpenAuthModal(false)} />}

      <h1 className="text-3xl md:text-5xl mb-5">Try</h1>
      <p className="text-md md:text-xl opacity-75 md:w-[45%]">
        Let our AI analyze your features and recommend the best products for
        you.
      </p>
      <div className="w-full flex flex-col justify-center items-center mt-10">
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-48 py-3 px-4 rounded-lg bg-[#1a1a1a] text-white"
        >
          <option value="all">Choose your option</option>
          <option value="low">Low ($0 - $5)</option>
          <option value="medium">Medium ($5 - $20)</option>
          <option value="high">High ($20+)</option>
        </select>
        {Object.keys(imagePrevs).length > 0 && (
          <button
            onClick={handleRemove}
            className="w-48 py-3 px-4 rounded-lg bg-red-500 text-white mt-8"
          >
            Clear All
          </button>
        )}
        <div className="hidden w-full md:grid grid-cols-3 lg:flex flex-col md:flex-row lg:w-auto gap-8 md:gap-4 lg:gap-8 mt-8">
          {(["Left", "Middle", "Right"] as ImageSide[]).map((side) => (
            <div
              className="md:w-full md:h-[30vh] lg:w-[18vw] lg:h-[48vh] flex flex-col gap-2"
              key={side}
            >
              <DragDrop
                key={side}
                onDropAccepted={(files: File[]) =>
                  handleImagePrevs(files, side)
                }
                imagePrev={imagePrevs[side] || ""}
                side={side}
                user={user}
                onOpenAuthModal={() => setOpenAuthModal(true)}
                isLoading={imageLoading[side] || false}
              />
            </div>
          ))}
        </div>
        <div className="w-full flex md:hidden flex-wrap gap-4 mt-8">
          {(["Middle", "Left", "Right"] as ImageSide[]).map((side) => (
            <div
              key={side}
              className={`
          ${
            side === "Middle"
              ? "w-full h-[50vh]"
              : "basis-[calc(50%-0.5rem)] h-[30vh]"
          }
          md:flex-1
          flex  gap-2
        `}
            >
              <DragDrop
                key={side}
                onDropAccepted={(files: File[]) =>
                  handleImagePrevs(files, side)
                }
                imagePrev={imagePrevs[side] || ""}
                side={side}
                user={user}
                onOpenAuthModal={() => setOpenAuthModal(true)}
                isLoading={imageLoading[side] || false}
              />
            </div>
          ))}
        </div>
        <button
          disabled={analyzeMutation.isPending}
          onClick={handleLogic}
          className="w-48 px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mt-8 disabled:cursor-wait disabled:animate-pulse cursor-pointer"
        >
          {analyzeMutation.isPending
            ? loadingMessages[currentMsgIndex]
            : "Analyze"}
        </button>
      </div>
      {!analyzeMutation.isPending && recommendations && (
        <Recommendations recommendations={recommendations} />
      )}
      {routine && <Routine routine={routine} />}
      {routine && tips && recommendations && analysisId && (
        <Chatbot
          routine={routine.routine}
          tips={tips}
          recommendations={recommendations}
          analysisId={analysisId}
        />
      )}
      {showModal && (
        <ConfirmAnalyze
          handleAnalyze={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setShowModal(false);
            handleAnalyze();
          }}
          uploadMoreImages={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setShowModal(false);
          }}
        />
      )}
      <Link href="https://forms.gle/t74AvFz7e8jAVUZE6" target="_blank">
        <button className="w-fit rounded-lg text-2xl border px-10 py-3 cursor-pointer flex justify-center mt-20 mx-auto hover:bg-gray-200 gap-8">
          Join our waiting list
          <ArrowRight className="flex justify-center items-center size-9" />
        </button>
      </Link>
    </section>
  );
}

export default Try;
