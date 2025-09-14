import { useState, useRef, useCallback, useEffect } from "react";
import PoseAnalyzer from "../components/PoseAnalyzer";
import CanvasRenderer from "../components/CanvasRenderer";
import { createCaptureFilter } from "../utils/captureFilter";
import { t } from "../utils/translations";
import { convertServerDataToKeypoints, analyzeMultiplePeople } from "../utils/poseDataConverter";
import { createBlobUrl, revokeBlobUrl } from "../utils/imageUtils";

const usePoseDetection = () => {
  const [detector, setDetector] = useState(null);
  const [status, setStatus] = useState(t("loading"));
  const [rules, setRules] = useState("");
  const [mode, setMode] = useState("webcam");
  const [isRunning, setIsRunning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPose, setCapturedPose] = useState(null);
  const [isInCapturedMode, setIsInCapturedMode] = useState(false);
  const [selectedPoseCategory, setSelectedPoseCategory] = useState(null);
  const [detectedPoseCategory, setDetectedPoseCategory] = useState(null);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [detectedPeople, setDetectedPeople] = useState([]);
  const [multiPersonAnalysis, setMultiPersonAnalysis] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);


  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const captureFilterRef = useRef(createCaptureFilter());
  const frameCounterRef = useRef(0);
  const FRAME_RATE_LIMIT = 30; // Limit to 30 FPS to reduce memory usage
  const POSE_ESTIMATION_INTERVAL = 5; // Send every 5th frame to server

  const { analyzePose } = PoseAnalyzer();
  const { renderPose, renderImage } = CanvasRenderer();


  const runFrame = useCallback(async () => {
    if (!detector || !isRunning)
      return;

    // For image mode, we don't need continuous processing
    if (mode === "image") {
      // Render the uploaded image with pose detection results if available
      if (uploadedImage && detectedPeople.length > 0) {
        renderImage(canvasRef, uploadedImage, detectedPeople);
      }
      return;
    }

    // For webcam mode, we need video element
    if (!videoRef.current)
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

    // Increment frame counter
    frameCounterRef.current += 1;

    try {
      const video = videoRef.current;

      // Only send every 5th frame to server for pose estimation
      if (frameCounterRef.current % POSE_ESTIMATION_INTERVAL === 0) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to JPEG blob with quality settings
        canvas.toBlob(async (blob) => {
          // Send frame to API for pose estimation
          // Use WebSocket for real-time analysis
          await detector.sendFrameForAnalysis(blob);
        }, "image/jpeg", 0.85); // 85% quality for better compression
      }

      // Always render the current frame with detected poses (if any)
      renderPose(canvasRef, videoRef, detectedPeople);
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatus(t("poseDetectionError"));
    }

    // Continue animation loop only if not capturing and not in captured mode
    if (isRunning && !isCapturing && !isInCapturedMode) {
      animationFrameRef.current = requestAnimationFrame(runFrame);
    }
  }, [detector, mode, isRunning, detectedPeople, renderPose, uploadedImage, renderImage]);

  // Create stable message handler
  const handleWebSocketMessage = useCallback((result) => {
    if (result.success && result.poses) {
      // Convert server data to keypoints format
      const peopleData = convertServerDataToKeypoints(result.poses);
      setDetectedPeople(peopleData);

      // For webcam mode, always render current video frame with fresh pose data
      if (mode === "webcam") {
        renderPose(canvasRef, videoRef, peopleData);
      } else if (result.image) {
        // For image upload mode, render the server's processed image
        const img = new Image();
        img.onload = () => {
          renderImage(canvasRef, img, result.poses);
        };

        // Handle both binary and base64 image data
        if (result.image instanceof ArrayBuffer || result.image instanceof Uint8Array) {
          // Binary data - convert to blob URL
          img.src = createBlobUrl(result.image, 'image/jpeg');
        } else if (typeof result.image === 'string') {
          // Base64 data
          img.src = `data:image/jpeg;base64,${result.image}`;
        } else {
          console.error("Unsupported image format received from server");
        }
      }

      // If capturing, store the pose and stop the animation loop
      if (isCapturing) {
        setCapturedPose(peopleData);
        setIsCapturing(false);
        setIsInCapturedMode(true);
        setStatus(t("poseCapturingAnalyzing"));

        // Analyze multiple people
        const analysis = analyzeMultiplePeople(peopleData, analyzePose, selectedPoseCategory);
        setMultiPersonAnalysis(analysis);

        setStatus(analysis.status);
        setRules(analysis.rules);
        setDetectedPoseCategory(analysis.people[0]?.detectedCategory || null);
        return;
      }

      // Normal real-time analysis (only if not capturing and not in captured mode)
      if (!isCapturing && !isInCapturedMode) {
        // Analyze multiple people
        const analysis = analyzeMultiplePeople(peopleData, analyzePose, selectedPoseCategory);
        setMultiPersonAnalysis(analysis);

        setStatus(analysis.status);
        setRules(analysis.rules);
        setDetectedPoseCategory(analysis.people[0]?.detectedCategory || null);

        // Auto-capture logic
        if (autoCaptureEnabled && analysis.averageScore < 70) {
          // Check if any person should be captured
          const shouldCapture = peopleData.some((person, index) => {
            const personAnalysis = analysis.people[index];
            return captureFilterRef.current.shouldCapture(
              person.keypoints,
              personAnalysis.score
            );
          });

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
                peopleData: peopleData,
                analysis: analysis,
                totalPeople: analysis.totalPeople,
                averageScore: analysis.averageScore,
              },
            ]);

            setStatus(
              `Auto-captured ${analysis.totalPeople} people (avg score: ${analysis.averageScore}%)`
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
  }, [
    mode,
    isCapturing,
    isInCapturedMode,
    selectedPoseCategory,
    autoCaptureEnabled,
    analyzePose,
    renderPose,
  ]);

  // Handle WebSocket connection
  useEffect(() => {
    if (detector && detector.connectWebSocket) {
      detector.connectWebSocket(handleWebSocketMessage);
    }
  }, [detector, handleWebSocketMessage]);

  // Handle image mode rendering
  useEffect(() => {
    if (mode === "image" && uploadedImage && detectedPeople.length > 0) {
      renderImage(canvasRef, uploadedImage, detectedPeople);
    }
  }, [mode, uploadedImage, detectedPeople, renderImage]);

  // Initial render when video is ready (webcam mode)
  useEffect(() => {
    if (mode === "webcam" && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Initial render of video frame
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  }, [mode, videoRef.current?.videoWidth, videoRef.current?.videoHeight]);

  const analyzeImage = async (imageElement) => {
    try {
      const result = await detector.analyzeImage(imageElement);

      if (result && result.success && result.poses && result.poses.length > 0) {
        // Convert server data to keypoints format
        const peopleData = convertServerDataToKeypoints(result.poses);
        setDetectedPeople(peopleData);

        // REST API no longer returns image data, use original uploaded image
        renderImage(canvasRef, imageElement, result.poses);

        // Analyze multiple people
        const analysis = analyzeMultiplePeople(peopleData, analyzePose, selectedPoseCategory);
        setMultiPersonAnalysis(analysis);

        setStatus(analysis.status);
        setRules(analysis.rules);
        setDetectedPoseCategory(analysis.people[0]?.detectedCategory || null);
      } else if (result && result.length > 0) {
        // Fallback for testData format
        const peopleData = convertServerDataToKeypoints(result);
        setDetectedPeople(peopleData);

        renderImage(canvasRef, imageElement, result);

        const analysis = analyzeMultiplePeople(peopleData, analyzePose, selectedPoseCategory);
        setMultiPersonAnalysis(analysis);

        setStatus(analysis.status);
        setRules(analysis.rules);
        setDetectedPoseCategory(analysis.people[0]?.detectedCategory || null);
      } else {
        setStatus(t("noPerson"));
        setRules("");
        setDetectedPeople([]);
        setMultiPersonAnalysis(null);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setStatus(t("analysisError"));
    }
  };

  const toggleMode = () => {
    if (mode === "webcam") {
      setIsRunning(false);
      setIsCapturing(false);
      setMode("image");
      setStatus(t("uploadImagePrompt"));
      captureFilterRef.current.reset();
      // Clear any previous uploaded image and detection results
      setUploadedImage(null);
      setDetectedPeople([]);
      setMultiPersonAnalysis(null);
    } else {
      setMode("webcam");
      setStatus(t("cameraInitializing"));
      // Clear uploaded image when switching to webcam mode
      setUploadedImage(null);
      if (detector) {
        setIsRunning(true);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus("Please select a valid image file");
      return;
    }

    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
      setStatus("Analyzing image...");
      analyzeImage(img);
    };
    img.onerror = () => {
      setStatus("Error loading image");
    };
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
      // Clear any remaining
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      // Disconnect WebSocket
      if (detector && detector.disconnectWebSocket) {
        detector.disconnectWebSocket();
      }
    };
  }, [stopAnimation, detector]);

  return {
    // State
    detector,
    status,
    rules,
    mode,
    isRunning,
    isCapturing,
    capturedPose,
    isInCapturedMode,
    selectedPoseCategory,
    detectedPoseCategory,
    autoCaptureEnabled,
    capturedImages,
    detectedPeople,
    multiPersonAnalysis,
    uploadedImage,

    // Refs
    videoRef,
    canvasRef,
    fileInputRef,

    // Setters
    setDetector,
    setStatus,
    setIsRunning,
    setSelectedPoseCategory,

    // Actions
    analyzeImage,
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
