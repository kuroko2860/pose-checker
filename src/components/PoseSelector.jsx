import { POSE_CATEGORIES, getPoseCategoryInfo } from "../utils/poseCategories";
import { t } from "../utils/translations";

const PoseSelector = ({
  selectedPoseCategory,
  detectedPoseCategory,
  onPoseCategoryChange,
}) => {
  const poseCategories = [
    {
      key: null,
      name: t("autoDetect"),
      description: t("autoDetectDesc"),
      icon: "🤖",
    },
    {
      key: POSE_CATEGORIES.TWO_HAND_STANDING,
      name: t("twoHandStanding"),
      description: t("twoHandStandingDesc"),
      icon: "🎯",
    },
    {
      key: POSE_CATEGORIES.ONE_HAND_STANDING,
      name: t("oneHandStanding"),
      description: t("oneHandStandingDesc"),
      icon: "👆",
    },
    {
      key: POSE_CATEGORIES.KNEELING,
      name: t("kneeling"),
      description: t("kneelingDesc"),
      icon: "🦵",
    },
    {
      key: POSE_CATEGORIES.CHECKING_GUN,
      name: t("checkingGun"),
      description: t("checkingGunDesc"),
      icon: "🔍",
    },
    {
      key: POSE_CATEGORIES.GUN_ASSEMBLING,
      name: t("gunAssembling"),
      description: t("gunAssemblingDesc"),
      icon: "🔍",
    },
  ];

  const getDetectedPoseInfo = () => {
    if (!detectedPoseCategory) return null;
    return getPoseCategoryInfo(detectedPoseCategory);
  };

  const detectedPoseInfo = getDetectedPoseInfo();

  return (
    <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-center mb-4 text-purple-400">
        {t("poseTypeSelection")}
      </h3>

      {/* Auto-detection status */}
      {detectedPoseCategory && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">🔍</span>
            <span className="text-blue-300 text-sm font-medium">
              {t("autoDetected")} {detectedPoseInfo?.name || t("unknown")}
            </span>
          </div>
          {detectedPoseInfo?.description && (
            <p className="text-blue-400/70 text-xs mt-1">
              {detectedPoseInfo.description}
            </p>
          )}
        </div>
      )}

      {/* Pose category buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {poseCategories.map((pose) => (
          <button
            key={pose.key}
            onClick={() => onPoseCategoryChange(pose.key)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left ${
              selectedPoseCategory === pose.key
                ? "bg-purple-600/20 border-purple-500 text-purple-300"
                : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{pose.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{pose.name}</div>
                <div className="text-xs opacity-70">{pose.description}</div>
              </div>
              {selectedPoseCategory === pose.key && (
                <span className="text-purple-400">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Help text */}
      <div className="mt-4 text-center text-gray-400 text-xs">
        <p>
          {selectedPoseCategory
            ? t("selectPoseToAnalyze")
            : t("selectPoseToAnalyze")}
        </p>
      </div>
    </div>
  );
};

export default PoseSelector;
