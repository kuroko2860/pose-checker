import { useEffect, useState } from "react";
import PoseDetector from "./PoseDetector";
import CameraController from "./CameraController";
import StatusDisplay from "./StatusDisplay";
import ControlPanel from "./ControlPanel";
import PerformanceMonitor from "./PerformanceMonitor";
import usePoseDetection from "../hooks/usePoseDetection";
import LanguageSwitcher from "./LanguageSwitcher";

const ShootingStanceChecker = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  const {
    detector,
    status,
    rules,
    referenceStatus,
    mode,
    isRunning,
    isCapturing,
    isInCapturedMode,
    selectedPoseCategory,
    detectedPoseCategory,
    autoCaptureEnabled,
    capturedImages,
    videoRef,
    canvasRef,
    fileInputRef,
    referenceFileInputRef,
    setDetector,
    setStatus,
    setIsRunning,
    setSelectedPoseCategory,
    setReference,
    handleReferenceImageUpload,
    toggleMode,
    handleImageUpload,
    toggleCapture,
    toggleAutoCapture,
    clearCapturedImages,
  } = usePoseDetection();

  useEffect(() => {
    if (detector && mode === "webcam") {
      setIsRunning(true);
    }
  }, [detector, mode, setIsRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Shotgun Stance Trainer
                </h1>
                <p className="text-gray-400 text-sm">
                  AI-Powered Shooting Form Analysis
                </p>
              </div>
            </div>

            {/* Performance Monitor Toggle */}
            <button
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
            >
              {showPerformanceMonitor ? "Hide" : "Show"} Debug
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Camera/Canvas */}
          <div className="space-y-6">
            {/* Camera/Canvas Section */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">
                  {mode === "webcam" ? "📹" : "🖼️"}
                </span>
                <h2 className="text-xl font-semibold text-white">
                  {mode === "webcam" ? "Live Camera Feed" : "Image Analysis"}
                </h2>
              </div>

              <div className="relative">
                <video ref={videoRef} autoPlay playsInline className="hidden" />

                <canvas
                  ref={canvasRef}
                  className="w-full h-auto rounded-xl border-2 border-gray-600 shadow-lg"
                />

                {/* Capture Overlay */}
                {isCapturing && (
                  <div className="capture-overlay">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold animate-capture-flash">
                      📸 Capturing Pose...
                    </div>
                  </div>
                )}

                {/* Captured Mode Overlay */}
                {isInCapturedMode && !isCapturing && (
                  <div className="absolute inset-0 bg-blue-500/20 border-4 border-blue-500 rounded-xl flex items-center justify-center">
                    {/* <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                      📸 Pose Captured - Analysis Complete
                    </div> */}
                  </div>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <ControlPanel
              mode={mode}
              onToggleMode={toggleMode}
              onSetReference={setReference}
              onImageUpload={handleImageUpload}
              onReferenceImageUpload={handleReferenceImageUpload}
              onCaptureToggle={toggleCapture}
              isCapturing={isCapturing}
              isInCapturedMode={isInCapturedMode}
              selectedPoseCategory={selectedPoseCategory}
              detectedPoseCategory={detectedPoseCategory}
              onPoseCategoryChange={setSelectedPoseCategory}
              autoCaptureEnabled={autoCaptureEnabled}
              onToggleAutoCapture={toggleAutoCapture}
              capturedImages={capturedImages}
              onClearCapturedImages={clearCapturedImages}
              fileInputRef={fileInputRef}
              referenceFileInputRef={referenceFileInputRef}
            />
          </div>

          {/* Right Column - Status and Analysis */}
          <div className="space-y-6">
            <StatusDisplay
              status={status}
              rules={rules}
              referenceStatus={referenceStatus}
              detectedPoseCategory={detectedPoseCategory}
            />
          </div>
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

      {/* Footer */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center text-gray-400 text-sm">
            <p>🎯 Perfect your shooting stance with AI-powered analysis</p>
            <p className="mt-1">Built with TensorFlow.js and React</p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default ShootingStanceChecker;
