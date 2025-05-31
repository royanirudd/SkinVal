import React from "react";

interface confirmModalProps {
  handleAnalyze: (e: React.MouseEvent<HTMLButtonElement>) => void;
  uploadMoreImages: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ConfirmAnalyze({
  handleAnalyze,
  uploadMoreImages,
}: confirmModalProps) {
  return (
    <div className="w-full h-screen bg-[#1a1a1a]/40 text-[#1a1a1a] fixed z-50 top-0 left-0 p-5 lg:p-10">
      <div className="w-full h-full flex justify-center items-center">
        <div className="max-w-lg h-auto bg-white rounded-lg flex flex-col gap-3 p-5">
          <h1 className="w-full text-center text-xl">
            Missing Images For Optimal Analysis!
          </h1>
          <p>
            We recommend uploading three images (front, left, and right) for the
            best analysis.
            <span className="font-semibold">
              You can still proceed with fewer images
            </span>
            , but the results might be less optimal.
          </p>
          <div className="w-full flex justify-between gap-1">
            <button
              onClick={handleAnalyze}
              className="w-[50%] px-10 py-1 bg-[#1a1a1a] text-white rounded-lg cursor-pointer"
            >
              Proceed Anyway
            </button>
            <button
              onClick={uploadMoreImages}
              className="w-[50%] border border-black py-1 rounded-lg bg-white cursor-pointer"
            >
              Upload More Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmAnalyze;
