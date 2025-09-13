import { useState, useEffect } from "react";
import PoseApiService from "../services/poseApi";

const PoseDetector = ({ onDetectorReady, onStatusChange }) => {
  const [apiService] = useState(() => new PoseApiService());

  const initPoseDetector = async () => {
    try {
      onStatusChange("Connecting to pose API...");

      onStatusChange("Connected to pose API");
      onDetectorReady(apiService);
    } catch (error) {
      onStatusChange("Error connecting to pose API: " + error.message);
    }
  };

  useEffect(() => {
    initPoseDetector();

    // Cleanup on unmount
    return () => {
      apiService.disconnectWebSocket();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PoseDetector;
