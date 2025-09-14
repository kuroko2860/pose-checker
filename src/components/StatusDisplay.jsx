import { getPoseCategoryInfo } from "../utils/poseCategories";
import { getLanguage, t } from "../utils/translations";

const StatusDisplay = ({
  status,
  rules,
  detectedPoseCategory,
  multiPersonAnalysis,
  detectedPeople,
  mode = "shooting",
  defenderAnalysis = null,
}) => {
  const getStatusColor = (status) => {
    if (status.includes("✅")) return "text-green-400";
    if (status.includes("❌")) return "text-red-400";
    if (status.includes("Loading") || status.includes("Camera"))
      return "text-yellow-400";
    return "text-blue-400";
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

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const detectedPoseInfo = detectedPoseCategory
    ? getPoseCategoryInfo(detectedPoseCategory)
    : null;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-center text-white">
            {t("stanceAnalysis")}
          </h3>
        </div>

        {/* <div
          className={`text-center text-lg font-semibold ${getStatusColor(
            status
          )}`}
        >
          {status}
        </div> */}

        {/* Individual Scores Summary */}
        {multiPersonAnalysis &&
          multiPersonAnalysis.people &&
          multiPersonAnalysis.people.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-blue-400">📊</span>
                <span className="text-blue-300 font-medium">
                  {multiPersonAnalysis.totalPeople} {t("peopleDetected")}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {multiPersonAnalysis.people.map((person, index) => (
                  <div
                    key={person.trackId || index}
                    className="flex items-center justify-between border-b-2 border-gray-600 pb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPersonColor(index)
                          .split(" ")[0]
                          .replace("border-", "bg-")}`}
                      ></div>
                      <span className="text-blue-300 text-sm">
                        {t("person")} {index + 1}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-bold ${getScoreColor(
                        person.score
                      )}`}
                    >
                      {person.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Individual Person Results */}
      {multiPersonAnalysis &&
        multiPersonAnalysis.people &&
        multiPersonAnalysis.people.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">👥</span>
              <h4 className="text-lg font-semibold text-white">
                {t("individualResults")}
              </h4>
            </div>

            <div className="space-y-4">
              {multiPersonAnalysis.people.map((person, index) => {
                const personInfo = person.poseInfo
                  ? getPoseCategoryInfo(person.detectedCategory)
                  : null;
                return (
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

                    {personInfo && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-300">
                          {t("detected")}:{" "}
                          <span className="font-medium">{personInfo.name}</span>
                        </span>
                      </div>
                    )}

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
                );
              })}
            </div>
          </div>
        )}

      {/* Tips Section - Different for each mode */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">💡</span>
          <h4 className="text-lg font-semibold text-yellow-400">
            {mode === "martial_art" ? t("trainingTips") : t("shootingTips")}
          </h4>
        </div>
        <div className="text-gray-300 text-sm space-y-2">
          {mode === "martial_art" ? (
            // Martial Art Tips
            <>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("martialArtTip1")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("martialArtTip2")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("martialArtTip3")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("martialArtTip4")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("martialArtTip5")}</span>
              </div>
            </>
          ) : (
            // Shooting Tips
            <>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("feetShoulderWidth")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("bendKnees")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("leanForward")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("keepHeadLevel")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{t("practiceRegularly")}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
