const AutoCapturePanel = ({
  autoCaptureEnabled,
  onToggleAutoCapture,
  capturedImages,
  onClearCapturedImages,
}) => {
  return (
    <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-center mb-4 text-orange-400">
        📸 Auto-Capture Settings
      </h3>

      {/* Auto-capture toggle */}
      <div className="mb-4">
        <button
          onClick={onToggleAutoCapture}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            autoCaptureEnabled
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-600 hover:bg-gray-500 text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">{autoCaptureEnabled ? "🟢" : "🔴"}</span>
            <span>
              {autoCaptureEnabled
                ? "Auto-Capture Enabled"
                : "Auto-Capture Disabled"}
            </span>
          </div>
        </button>
      </div>

      {/* Auto-capture info */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          How it works:
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Captures frames with pose score &lt; 70%</li>
          <li>• Requires stable pose for 10 consecutive frames</li>
          <li>• Minimum 10 keypoints with confidence &gt; 40%</li>
          <li>• 30-frame cooldown between captures</li>
        </ul>
      </div>

      {/* Captured images section */}
      {autoCaptureEnabled && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">
              Captured Images ({capturedImages.length})
            </h4>
            {capturedImages.length > 0 && (
              <button
                onClick={onClearCapturedImages}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {capturedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="text-2xl mb-2">📸</div>
              <p>No images captured yet</p>
              <p className="text-xs mt-1">
                Bad poses will be captured automatically
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {capturedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-gray-700/50 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={image.imageData}
                      alt="Captured pose"
                      className="w-16 h-12 object-cover rounded border border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-300">
                          {image.poseCategory || "Unknown"}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            image.score < 50
                              ? "text-red-400"
                              : image.score < 70
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {image.score}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(image.timestamp).toLocaleTimeString()}
                      </p>
                      {image.issues && (
                        <p className="text-xs text-red-400 truncate">
                          {image.issues.replace("Issues: ", "")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCapturePanel;
