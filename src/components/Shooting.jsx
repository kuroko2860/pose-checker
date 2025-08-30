import { useEffect, useState } from "react";
import PoseDetector from "./PoseDetector";
import CameraController from "./CameraController";
import StatusDisplay from "./StatusDisplay";
import ControlPanel from "./ControlPanel";
import PerformanceMonitor from "./PerformanceMonitor";
import usePoseDetection from "../hooks/usePoseDetection";

const ShootingStanceChecker = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  const {
    detector,
    status,
    rules,
    referenceStatus,
    mode,
    isRunning,
    videoRef,
    canvasRef,
    fileInputRef,
    setDetector,
    setStatus,
    setIsRunning,
    setReference,
    toggleMode,
    handleImageUpload,
  } = usePoseDetection();

  useEffect(() => {
    if (detector && mode === "webcam") {
      setIsRunning(true);
    }
  }, [detector, mode, setIsRunning]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-400">
        Shotgun Stance Checker
      </h2>

      <div className="flex flex-col items-center space-y-4">
        <video ref={videoRef} autoPlay playsInline className="hidden" />

        <canvas
          ref={canvasRef}
          className="border-2 border-green-400 rounded-lg max-w-full h-auto"
        />

        <ControlPanel
          mode={mode}
          onToggleMode={toggleMode}
          onSetReference={setReference}
          onImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
        />

        <StatusDisplay
          status={status}
          rules={rules}
          referenceStatus={referenceStatus}
        />

        {/* Debug controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            {showPerformanceMonitor ? "Hide" : "Show"} Performance Monitor
          </button>
        </div>
      </div>

      {/* Hidden components that handle background logic */}
      <PoseDetector onDetectorReady={setDetector} onStatusChange={setStatus} />

      <CameraController
        videoRef={videoRef}
        canvasRef={canvasRef}
        isActive={isRunning && mode === "webcam"}
        onCameraReady={() => setStatus("Camera ready")}
        onError={setStatus}
      />

      <PerformanceMonitor isVisible={showPerformanceMonitor} />
    </div>
  );
};

export default ShootingStanceChecker;
