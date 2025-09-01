import React, { useState } from "react";
import ImageDetailPopup from "./ImageDetailPopup";
import { t } from "../utils/translations";

const AutoCapturePanel = ({
  autoCaptureEnabled,
  onToggleAutoCapture,
  capturedImages,
  onClearCapturedImages,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedImage(null);
  };
  return (
    <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-center mb-4 text-orange-400">
        {t("autoCaptureSettings")}
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
                ? t("autoCaptureEnabled")
                : t("autoCaptureDisabled")}
            </span>
          </div>
        </button>
      </div>

      {/* Auto-capture info */}
      <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          {t("howItWorks")}
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• {t("capturesFrames")}</li>
          <li>• {t("requiresStablePose")}</li>
          <li>• {t("minimumKeypoints")}</li>
          <li>• {t("frameCooldown")}</li>
        </ul>
      </div>

      {/* Captured images section */}
      {autoCaptureEnabled && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">
              {t("capturedImages")} ({capturedImages.length})
            </h4>
            {capturedImages.length > 0 && (
              <button
                onClick={onClearCapturedImages}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                {t("clearAll")}
              </button>
            )}
          </div>

          {capturedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="text-2xl mb-2">📸</div>
              <p>{t("noImagesCaptured")}</p>
              <p className="text-xs mt-1">{t("badPosesWillBeCaptured")}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {capturedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors"
                  onClick={() => handleImageClick(image)}
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
                          {image.poseCategory || t("unknown")}
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
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {t("clickToViewDetails")}
                        </span>
                        <span className="text-xs text-gray-500">👁️</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Detail Popup */}
      <ImageDetailPopup
        image={selectedImage}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default AutoCapturePanel;
