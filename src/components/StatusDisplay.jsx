const StatusDisplay = ({ status, rules, referenceStatus }) => {
  const getStatusIcon = (status) => {
    if (status.includes("✅")) return "🎯";
    if (status.includes("❌")) return "⚠️";
    if (status.includes("Loading")) return "⏳";
    if (status.includes("Camera")) return "📹";
    if (status.includes("Upload")) return "📤";
    return "ℹ️";
  };

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

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Main Status Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl">{getStatusIcon(status)}</span>
          <h3 className="text-xl font-bold text-center">Stance Analysis</h3>
        </div>

        <div
          className={`text-center text-lg font-semibold ${getStatusColor(
            status
          )}`}
        >
          {status}
        </div>
      </div>

      {/* Rules Feedback */}
      {rules && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
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

      {/* Reference Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
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

      {/* Tips Section */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">💡</span>
          <h4 className="text-lg font-semibold text-blue-400">Shooting Tips</h4>
        </div>
        <div className="text-blue-300 text-sm space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Keep your feet shoulder-width apart for stability</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Slightly bend your knees to absorb recoil</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Lean slightly forward from the waist</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Keep your head level and eyes on target</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
