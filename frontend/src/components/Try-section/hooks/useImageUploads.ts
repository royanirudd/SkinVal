"use client";
import { useState } from "react";
import { ImageSide } from "../types";
import { isFaceDetected } from "@/utils/faceValidation";
import { toast } from "sonner";

export function useImageUploads() {
  const [imagePrevs, setImagePrevs] = useState<
    Partial<Record<ImageSide, string>>
  >({});
  const [imageFiles, setImageFiles] = useState<
    Partial<Record<ImageSide, File>>
  >({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  const handleImagePrevs = async (files: File[], side: ImageSide) => {
    const file = files[0];
    if (!file) return;
    const objectURL = URL.createObjectURL(file);

    setImageLoading((prev) => ({ ...prev, [side]: true }));

    try {
      const hasFace = await isFaceDetected(objectURL);

      if (!hasFace) {
        toast.error("No human face detected in this image. Please try another");
        setImageLoading((prev) => ({ ...prev, [side]: false }));
        return;
      }

      setImagePrevs((prev) => ({ ...prev, [side]: objectURL }));
      setImageFiles((prev) => ({ ...prev, [side]: file }));
    } catch (error) {
      toast.error("Error validating image, Please try again.");
    } finally {
      setImageLoading((prev) => ({ ...prev, [side]: false }));
    }
  };

  const clearImages = () => {
    setImagePrevs({});
    setImageFiles({});
  };

  return {
    imagePrevs,
    imageFiles,
    handleImagePrevs,
    clearImages,
    imageLoading,
  };
}
