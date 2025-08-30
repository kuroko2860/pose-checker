const ControlPanel = ({
  mode,
  onToggleMode,
  onSetReference,
  onImageUpload,
  fileInputRef,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onSetReference}
          disabled={mode === "image"}
          className={`px-4 py-2 rounded-lg font-semibold ${
            mode === "image"
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Set Reference Pose
        </button>

        <button
          onClick={onToggleMode}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
        >
          {mode === "webcam"
            ? "Switch to Image Upload Mode"
            : "Switch to Webcam Mode"}
        </button>
      </div>

      {mode === "image" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
        />
      )}
    </div>
  );
};

export default ControlPanel;
