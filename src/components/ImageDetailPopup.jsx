import { useEffect } from "react";
import { t } from "../utils/translations";

const ImageDetailPopup = ({ image, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  if (!isOpen || !image) return null;

  const getScoreColor = (score) => {
    if (score < 50) return "text-red-400";
    if (score < 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getScoreBackground = (score) => {
    if (score < 50) return "bg-red-900/20 border-red-600";
    if (score < 70) return "bg-yellow-900/20 border-yellow-600";
    return "bg-green-900/20 border-green-600";
  };

  const getPersonColor = (personIndex) => {
    const colors = [
      "border-lime-400 bg-lime-400/10",
      "border-red-400 bg-red-400/10",
      "border-teal-400 bg-teal-400/10",
      "border-blue-400 bg-blue-400/10",
      "border-yellow-400 bg-yellow-400/10",
      "border-orange-400 bg-orange-400/10",
      "border-pink-400 bg-pink-400/10",
      "border-purple-400 bg-purple-400/10",
    ];
    return colors[personIndex % colors.length];
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-200">
            {t("imageDetails")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={image.imageData}
              alt="Captured pose"
              className="max-w-full max-h-96 object-contain rounded-lg border border-gray-600"
            />
          </div>

          {/* Multi-person Results or Single Score */}
          {image.analysis && image.analysis.people ? (
            // Multi-person results
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t("individualResults")}
                </h3>
                <div className="text-gray-400">
                  {image.analysis.totalPeople} {t("peopleDetected")} -{" "}
                  {t("averageScore")}: {image.analysis.averageScore}%
                </div>
              </div>

              <div className="space-y-3">
                {image.analysis.people.map((person, index) => (
                  <div
                    key={person.trackId || index}
                    className={`p-4 rounded-lg border-l-4 ${getPersonColor(
                      index
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getPersonColor(
                            index
                          )
                            .split(" ")[0]
                            .replace("border-", "bg-")}`}
                        ></div>
                        <span className="font-semibold text-white">
                          {t("person")} {index + 1}
                        </span>
                        <span className="text-gray-400 text-sm">
                          (ID: {person.trackId})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {t("score")}:
                        </span>
                        <div
                          className={`text-xl font-bold px-3 py-1 rounded-full ${getScoreColor(
                            person.score
                          )} bg-gray-700/50`}
                        >
                          {person.score}%
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div
                        className={`${
                          person.score >= 70 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {person.status}
                      </div>
                      {person.rules && (
                        <div className="mt-1 text-gray-400">{person.rules}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single person results (legacy)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border ${getScoreBackground(
                  image.score || image.averageScore
                )}`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{t("score")}</div>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      image.score || image.averageScore
                    )}`}
                  >
                    {image.score || image.averageScore}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-blue-600 bg-blue-900/20">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 text-blue-400">
                    {t("pose")}
                  </div>
                  <div className="text-2xl font-bold text-blue-300">
                    {image.poseCategory || t("unknown")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-300 mb-1">
                {t("capturedAt")}
              </div>
              <div className="text-xl text-gray-200">
                {new Date(image.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Issues */}
          {image.issues && (
            <div className="p-4 rounded-lg border border-red-600 bg-red-900/20">
              <div className="text-lg font-semibold text-red-400 mb-3">
                {t("issuesFound")}
              </div>
              <div className="space-y-2">
                {image.issues
                  .replace("Issues: ", "")
                  .split(", ")
                  .map((issue, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-red-300">{issue}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {image.additionalDetails && (
            <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
              <div className="text-lg font-semibold text-gray-300 mb-3">
                {t("additionalDetails")}
              </div>
              <div className="text-gray-200 space-y-2">
                {Object.entries(image.additionalDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPopup;
