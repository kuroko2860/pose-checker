import { useState, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

const PoseDetector = ({ onDetectorReady, onStatusChange }) => {
  const [detector, setDetector] = useState(null);

  const initPoseDetector = async () => {
    try {
      await tf.ready();
      const det = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.THUNDER,
          enableSmoothing: true,
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
