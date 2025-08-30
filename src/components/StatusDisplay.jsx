import { getPoseCategoryInfo } from "../utils/poseCategories";

const StatusDisplay = ({
  status,
  rules,
  referenceStatus,
  detectedPoseCategory,
}) => {
  const getStatusColor = (status) => {
    if (status.includes("✅")) return "text-green-400";
    if (status.includes("❌")) return "text-red-400";
    if (status.includes("Loading") || status.includes("Camera"))
      return "text-yellow-400";
    return "text-blue-400";
  };

  const getReferenceColor = (referenceStatus) => {
    if (referenceStatus.includes("✅")) return "text-green-400";
    if (referenceStatus.includes("❌")) return "text-red-400";
    return "text-gray-400";
  };

  const detectedPoseInfo = detectedPoseCategory
    ? getPoseCategoryInfo(detectedPoseCategory)
    : null;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-center">Stance Analysis</h3>
        </div>

        <div
          className={`text-center text-lg font-semibold ${getStatusColor(
            status
          )}`}
        >
          {status}
        </div>

        {/* Detected Pose Category */}
        {detectedPoseInfo && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-blue-400">🎯</span>
              <span className="text-blue-300 font-medium">
                Detected: {detectedPoseInfo.name}
              </span>
            </div>
            {detectedPoseInfo.description && (
              <p className="text-blue-400/70 text-sm text-center">
                {detectedPoseInfo.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Improvement Areas */}
      {rules && rules.includes("Issues:") && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">🎯</span>
            <h4 className="text-lg font-semibold text-red-400">
              Improvement Areas
            </h4>
          </div>
          <div className="text-red-300 text-sm leading-relaxed">
            {rules
              .replace("Issues: ", "")
              .split(", ")
              .map((issue, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{issue}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Reference Comparison */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">📊</span>
          <h4 className="text-lg font-semibold text-gray-300">
            Reference Comparison
          </h4>
        </div>
        <div
          className={`text-center text-sm ${getReferenceColor(
            referenceStatus
          )}`}
        >
          {referenceStatus}
        </div>
      </div>

      {/* Shooting Tips */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">💡</span>
          <h4 className="text-lg font-semibold text-yellow-400">
            Shooting Tips
          </h4>
        </div>
        <div className="text-gray-300 text-sm space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Keep your feet shoulder-width apart for stability</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Bend your knees slightly to absorb recoil</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Lean forward slightly from the waist</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Keep your head level and eyes on target</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-1">•</span>
            <span>Practice regularly to build muscle memory</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
