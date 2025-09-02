import { useState, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

const PoseDetector = ({ onDetectorReady, onStatusChange }) => {
  const [_, setDetector] = useState(null);

  const initPoseDetector = async () => {
    try {
      await tf.setBackend("webgl");
      await tf.ready();
      const det = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: "tfjs",
          modelType: "full", // options: "lite" | "full" | "heavy"
          enableSmoothing: true,
          // enableTracking: true,
          // modelType: poseDetection.movenet.modelType.THUNDER,
        }
      );
      setDetector(det);
      onDetectorReady(det);
      onStatusChange("Model loaded");
    } catch (error) {
      onStatusChange("Error loading pose detection model: " + error.message);
    }
  };

  useEffect(() => {
    initPoseDetector();
  }, []);

  return null; // This component doesn't render anything
};

export default PoseDetector;
