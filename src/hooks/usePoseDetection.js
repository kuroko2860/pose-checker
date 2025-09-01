import { useState, useRef, useCallback, useEffect } from "react";
import PoseAnalyzer from "../components/PoseAnalyzer";
import CanvasRenderer from "../components/CanvasRenderer";
import { memoryManager } from "../utils/memoryManager";
import { createCaptureFilter } from "../utils/captureFilter";
import { t } from "../utils/translations";

const usePoseDetection = () => {
  const [detector, setDetector] = useState(null);
  const [status, setStatus] = useState(t("loading"));
  const [rules, setRules] = useState("");
  const [referenceStatus, setReferenceStatus] = useState(t("noReferenceSet"));
  const [mode, setMode] = useState("webcam");
  const [referencePose, setReferencePose] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPose, setCapturedPose] = useState(null);
  const [isInCapturedMode, setIsInCapturedMode] = useState(false);
  const [selectedPoseCategory, setSelectedPoseCategory] = useState(null);
  const [detectedPoseCategory, setDetectedPoseCategory] = useState(null);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const referenceFileInputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const captureFilterRef = useRef(createCaptureFilter());
  const FRAME_RATE_LIMIT = 30; // Limit to 30 FPS to reduce memory usage

  const { analyzePose } = PoseAnalyzer();
  const { renderPose, renderImage } = CanvasRenderer();

  const runFrame = useCallback(async () => {
    if (mode === "image" || !detector || !videoRef.current || !isRunning)
      return;

    const currentTime = performance.now();
    const timeSinceLastFrame = currentTime - lastFrameTimeRef.current;

    // Limit frame rate to reduce memory usage
    if (timeSinceLastFrame < 1000 / FRAME_RATE_LIMIT) {
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(runFrame);
      }
      return;
    }

    lastFrameTimeRef.current = currentTime;

    try {
      const video = videoRef.current;
      console.log(video.videoWidth, video.videoHeight);
      const poses = await detector.estimatePoses(video, {
        flipHorizontal: false,
      });

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        renderPose(canvasRef, videoRef, keypoints);

        // If capturing, store the pose and stop the animation loop
        if (isCapturing) {
          setCapturedPose(keypoints.map((k) => ({ ...k })));
          setIsCapturing(false);
          setIsInCapturedMode(true);
          setStatus(t("poseCapturingAnalyzing"));

          // Analyze the captured pose
          const analysis = analyzePose(
            keypoints,
            referencePose,
            selectedPoseCategory
          );

          setStatus(analysis.status);
          setRules(analysis.rules);
          setReferenceStatus(analysis.referenceStatus);
          setDetectedPoseCategory(analysis.detectedCategory);
          return;
        }

        // Normal real-time analysis (only if not capturing and not in captured mode)
        if (!isCapturing && !isInCapturedMode) {
          const analysis = analyzePose(
            keypoints,
            referencePose,
            selectedPoseCategory
          );

          setStatus(analysis.status);
          setRules(analysis.rules);
          setReferenceStatus(analysis.referenceStatus);
          setDetectedPoseCategory(analysis.detectedCategory);

          // Auto-capture logic
          if (autoCaptureEnabled && analysis.score < 70) {
            const shouldCapture = captureFilterRef.current.shouldCapture(
              keypoints,
              analysis.score
            );
            if (shouldCapture) {
              // Auto-capture the current frame
              const canvas = canvasRef.current;
              const imageData = canvas.toDataURL("image/jpeg", 0.8);
              const timestamp = new Date().toISOString();

              setCapturedImages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  imageData,
                  timestamp,
                  poseCategory: analysis.detectedCategory,
                  score: analysis.score,
                  issues: analysis.rules,
                },
              ]);

              setStatus(
                t("autoCaptured", {
                  name: analysis.poseInfo.name,
                  score: analysis.score,
                })
              );
            }
          }
        }
      } else {
        if (!isCapturing && !isInCapturedMode) {
          setStatus(t("noPoseDetected"));
          setRules("");
        }
      }

      // Clean up any tensors that might have been created
      if (poses && poses.length > 0 && poses[0].keypoints) {
        memoryManager.cleanup();
      }
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatus(t("poseDetectionError"));
    }

    // Continue animation loop only if not capturing and not in captured mode
    if (isRunning && !isCapturing && !isInCapturedMode) {
      animationFrameRef.current = requestAnimationFrame(runFrame);
    }
  }, [
    detector,
    mode,
    referencePose,
    isRunning,
    isCapturing,
    isInCapturedMode,
    selectedPoseCategory,
    autoCaptureEnabled,
    analyzePose,
    renderPose,
  ]);

  const analyzeImage = async (imageElement) => {
    try {
      const poses = await detector.estimatePoses(imageElement);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        renderImage(canvasRef, imageElement, keypoints);

        const analysis = analyzePose(
          keypoints,
          referencePose,
          selectedPoseCategory
        );

        setStatus(analysis.status);
        setRules(analysis.rules);
        setReferenceStatus(analysis.referenceStatus);
        setDetectedPoseCategory(analysis.detectedCategory);
      } else {
        setStatus(t("noPerson"));
        setRules("");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setStatus(t("analysisError"));
    }
  };

  const setReference = async () => {
    if (!detector || mode === "image") return;

    try {
      const poses = await detector.estimatePoses(videoRef.current);
      if (poses.length > 0) {
        setReferencePose(poses[0].keypoints.map((k) => ({ ...k })));
        setReferenceStatus(t("referenceSetFromWebcam"));
      }
    } catch (error) {
      console.error("Error setting reference:", error);
      setStatus(t("errorSettingReference"));
    }
  };

  const handleReferenceImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !detector) return;

    try {
      const img = new Image();
      img.onload = async () => {
        const poses = await detector.estimatePoses(img);
        if (poses.length > 0) {
          setReferencePose(poses[0].keypoints.map((k) => ({ ...k })));
          setReferenceStatus(t("referenceSetFromImage"));
        } else {
          setStatus(t("noPersonInReference"));
        }
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error setting reference from image:", error);
      setStatus(t("errorSettingReferenceFromImage"));
    }
  };

  const toggleMode = () => {
    if (mode === "webcam") {
      setIsRunning(false);
      setIsCapturing(false);
      setMode("image");
      setStatus(t("uploadImagePrompt"));
      captureFilterRef.current.reset();
    } else {
      setMode("webcam");
      setStatus(t("cameraInitializing"));
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

  const toggleCapture = () => {
    if (isCapturing) {
      // Stop capturing
      setIsCapturing(false);
      setStatus(t("captureStopped"));
    } else if (isInCapturedMode) {
      // Exit captured mode and return to real-time
      setIsInCapturedMode(false);
      setCapturedPose(null);
      setStatus(t("returningToRealTime"));
      // Restart the animation loop
      if (isRunning && detector) {
        runFrame();
      }
    } else {
      // Start capturing
      setIsCapturing(true);
      setStatus(t("capturingPose"));
    }
  };

  const toggleAutoCapture = () => {
    setAutoCaptureEnabled(!autoCaptureEnabled);
    if (!autoCaptureEnabled) {
      setStatus(t("autoCaptureEnabled"));
    } else {
      setStatus(t("autoCaptureDisabled"));
    }
  };

  const clearCapturedImages = () => {
    setCapturedImages([]);
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
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
    isCapturing,
    capturedPose,
    isInCapturedMode,
    selectedPoseCategory,
    detectedPoseCategory,
    autoCaptureEnabled,
    capturedImages,

    // Refs
    videoRef,
    canvasRef,
    fileInputRef,
    referenceFileInputRef,

    // Setters
    setDetector,
    setStatus,
    setIsRunning,
    setSelectedPoseCategory,

    // Actions
    analyzeImage,
    setReference,
    handleReferenceImageUpload,
    toggleMode,
    handleImageUpload,
    toggleCapture,
    toggleAutoCapture,
    clearCapturedImages,
    runFrame,
    stopAnimation,
  };
};

export default usePoseDetection;
