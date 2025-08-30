import { useState, useRef, useCallback, useEffect } from "react";
import PoseAnalyzer from "../components/PoseAnalyzer";
import CanvasRenderer from "../components/CanvasRenderer";
import { memoryManager } from "../utils/memoryManager";

const usePoseDetection = () => {
  const [detector, setDetector] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [rules, setRules] = useState("");
  const [referenceStatus, setReferenceStatus] = useState("No reference pose set");
  const [mode, setMode] = useState("webcam");
  const [referencePose, setReferencePose] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const FRAME_RATE_LIMIT = 30; // Limit to 30 FPS to reduce memory usage

  const { analyzePose } = PoseAnalyzer();
  const { renderPose, renderImage } = CanvasRenderer();

  const runFrame = useCallback(async () => {
    if (mode === "image" || !detector || !videoRef.current || !isRunning) return;

    const currentTime = performance.now();
    const timeSinceLastFrame = currentTime - lastFrameTimeRef.current;
    
    // Limit frame rate to reduce memory usage
    if (timeSinceLastFrame < (1000 / FRAME_RATE_LIMIT)) {
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(runFrame);
      }
      return;
    }

    lastFrameTimeRef.current = currentTime;

    try {
      const video = videoRef.current;
      const poses = await detector.estimatePoses(video);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        renderPose(canvasRef, videoRef, keypoints);

        const { status: newStatus, rules: newRules, referenceStatus: newRefStatus } = 
          analyzePose(keypoints, referencePose);
        
        setStatus(newStatus);
        setRules(newRules);
        setReferenceStatus(newRefStatus);
      } else {
        setStatus("No person detected");
        setRules("");
      }

      // Clean up any tensors that might have been created
      if (poses && poses.length > 0 && poses[0].keypoints) {
        memoryManager.cleanup();
      }
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatus("Error in pose detection");
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(runFrame);
    }
  }, [detector, mode, referencePose, isRunning, analyzePose, renderPose]);

  const analyzeImage = async (imageElement) => {
    try {
      const poses = await detector.estimatePoses(imageElement);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        renderImage(canvasRef, imageElement, keypoints);

        const { status: newStatus, rules: newRules, referenceStatus: newRefStatus } = 
          analyzePose(keypoints, referencePose);
        
        setStatus(newStatus);
        setRules(newRules);
        setReferenceStatus(newRefStatus);
      } else {
        setStatus("No person detected in uploaded image");
        setRules("");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setStatus("Error analyzing image");
    }
  };

  const setReference = async () => {
    if (!detector || mode === "image") return;

    try {
      const poses = await detector.estimatePoses(videoRef.current);
      if (poses.length > 0) {
        setReferencePose(poses[0].keypoints.map((k) => ({ ...k })));
        setReferenceStatus("Reference pose set");
      }
    } catch (error) {
      console.error("Error setting reference:", error);
      setStatus("Error setting reference pose");
    }
  };

  const toggleMode = () => {
    if (mode === "webcam") {
      setIsRunning(false);
      setMode("image");
      setStatus("Upload an image to analyze");
    } else {
      setMode("webcam");
      setStatus("Loading webcam...");
      if (detector) {
        setIsRunning(true);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => analyzeImage(img);
    img.src = URL.createObjectURL(file);
  };

  // Cleanup function to stop animation frame
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && detector) {
      runFrame();
    } else {
      stopAnimation();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      stopAnimation();
    };
  }, [isRunning, detector, runFrame, stopAnimation]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopAnimation();
      // Clear any remaining references
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopAnimation]);

  return {
    // State
    detector,
    status,
    rules,
    referenceStatus,
    mode,
    referencePose,
    isRunning,
    
    // Refs
    videoRef,
    canvasRef,
    fileInputRef,
    
    // Setters
    setDetector,
    setStatus,
    setIsRunning,
    
    // Actions
    analyzeImage,
    setReference,
    toggleMode,
    handleImageUpload,
    runFrame,
    stopAnimation
  };
};

export default usePoseDetection;
