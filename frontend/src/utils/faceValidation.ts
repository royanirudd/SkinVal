import * as faceapi from "face-api.js";

let Modelsloaded = false;

export const loadmodels = async () => {
  if (Modelsloaded) return;

  await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");

  Modelsloaded = true;
};

export const isFaceDetected = async (imageUrl: string) => {
  await loadmodels();

  const img = await faceapi.fetchImage(imageUrl);

  const detections = await faceapi.detectAllFaces(
    img,
    new faceapi.TinyFaceDetectorOptions()
  );

  return detections.length > 0;
};
