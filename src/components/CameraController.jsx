import { useRef, useEffect } from "react";

const CameraController = ({
  videoRef,
  canvasRef,
  isActive,
  onCameraReady,
  onError,
}) => {
  const streamRef = useRef(null);

  const initCamera = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      });

      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      onCameraReady();
    } catch (error) {
      onError("Error accessing camera: " + error.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject = null;
    }
  };

  useEffect(() => {
    if (isActive) {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default CameraController;
