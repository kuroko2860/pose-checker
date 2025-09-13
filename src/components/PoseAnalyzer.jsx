import { distance3D } from "../utils/compute";
import { names, POSE_CONFIG } from "../utils/const";
import { t } from "../utils/translations";

import { classifyPose, getPoseCategoryInfo } from "../utils/poseCategories";

const PoseAnalyzer = () => {
  // const SIMILARITY_THRESHOLD = 85;

  // Helper functions
  const computeSimilarity = (current, reference) => {
    if (!current || !reference) return 0;

    const cur = Object.fromEntries(
      current
        .filter((k) => k.score > POSE_CONFIG.CONFIDENT_SCORE)
        .map((k) => [k.name, k])
    );
    const ref = Object.fromEntries(
      reference
        .filter((k) => k.score > POSE_CONFIG.CONFIDENT_SCORE)
        .map((k) => [k.name, k])
    );

    const ls = cur["left_shoulder"];
    const rs = cur["right_shoulder"];
    const lhs = cur["left_hip"];
    const rhs = cur["right_hip"];

    let scale = null;
    if (ls && rs) scale = distance3D(ls, rs);
    else if (lhs && rhs) scale = distance3D(lhs, rhs);
    if (!scale || scale === 0) scale = 100;

    let sum = 0;
    let cnt = 0;
    for (const n of names) {
      const a = cur[n];
      const b = ref[n];
      if (a && b) {
        sum += distance3D(a, b) / scale;
        cnt++;
      }
    }
    if (cnt === 0) return 0;
    const avg = sum / cnt;
    return Math.max(0, 100 - avg * 100);
  };

  const analyzePose = (keypoints, selectedPoseCategory = null) => {
    // Auto-classify pose if no specific category is selected
    const detectedCategory = selectedPoseCategory || classifyPose(keypoints);

    // Get the rule set for this pose category
    const poseInfo = getPoseCategoryInfo(detectedCategory);
    const { issues, score, total } = poseInfo.rules(keypoints);
    const percent = Math.round((score / total) * 100);

    let status, rules;
    if (issues.length === 0) {
      status = t("stanceAcceptable", { percent });
      rules = "";
    } else {
      status = t("stanceIncorrect", { percent });
      rules = t("issues", { issues: issues.join(", ") });
    }

    return {
      status,
      rules,
      detectedCategory,
      poseInfo,
      score: percent,
    };
  };

  return { analyzePose, computeSimilarity, classifyPose };
};

export default PoseAnalyzer;
