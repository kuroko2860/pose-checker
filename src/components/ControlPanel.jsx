const ControlPanel = ({
  mode,
  onToggleMode,
  onSetReference,
  onImageUpload,
  onReferenceImageUpload,
  onCaptureToggle,
  isCapturing,
  fileInputRef,
  referenceFileInputRef,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
      {/* Main Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onToggleMode}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg btn-hover-effect"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{mode === "webcam" ? "📷" : "🖼️"}</span>
            <span>
              {mode === "webcam"
                ? "Switch to Image Mode"
                : "Switch to Webcam Mode"}
            </span>
          </div>
        </button>

        {mode === "webcam" && (
          <button
            onClick={onCaptureToggle}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg btn-hover-effect ${
              isCapturing
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{isCapturing ? "⏹️" : "📸"}</span>
              <span>{isCapturing ? "Stop Capture" : "Capture Pose"}</span>
            </div>
          </button>
        )}
      </div>

      {/* Reference Pose Section */}
      <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-center mb-4 text-green-400">
          🎯 Reference Pose Setup
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Webcam Reference Button */}
          <button
            onClick={onSetReference}
            disabled={mode === "image"}
            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              mode === "image"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg btn-hover-effect"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>📹</span>
              <span>Set from Webcam</span>
            </div>
          </button>

          {/* Image Reference Upload */}
          <div className="relative">
            <input
              ref={referenceFileInputRef}
              type="file"
              accept="image/*"
              onChange={onReferenceImageUpload}
              className="hidden"
            />
            <button
              onClick={() => referenceFileInputRef.current?.click()}
              className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold shadow-lg btn-hover-effect"
            >
              <div className="flex items-center space-x-2">
                <span>🖼️</span>
                <span>Upload Reference</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      {mode === "image" && (
        <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-400">
            📸 Analyze Image
          </h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-blue-700 file:text-white hover:file:from-blue-700 hover:file:to-blue-800 file:transition-all file:duration-200 file:transform file:hover:scale-105"
          />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
