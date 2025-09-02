import { angle3D, distance3D } from "./compute";
import { POSE_CONFIG } from "../utils/const";
import { t } from "./translations";

// Pose classification categories
export const POSE_CATEGORIES = {
  TWO_HAND_STANDING: "two_hand_standing",
  ONE_HAND_STANDING: "one_hand_standing",
  KNEELING: "kneeling",
  CHECKING_GUN: "checking_gun",
  UNKNOWN: "unknown",
};

// Helper function to get keypoint by name
const byName = (kps, name) =>
  kps.find((k) => k.name === name && k.score > POSE_CONFIG.CONFIDENT_SCORE) ||
  null;

// Pose classification logic
export const classifyPose = (keypoints) => {
  const LS = byName(keypoints, "left_shoulder");
  const RS = byName(keypoints, "right_shoulder");
  const LH = byName(keypoints, "left_hip");
  const RH = byName(keypoints, "right_hip");
  const LK = byName(keypoints, "left_knee");
  const RK = byName(keypoints, "right_knee");
  const LA = byName(keypoints, "left_ankle");
  const RA = byName(keypoints, "right_ankle");
  const LE = byName(keypoints, "left_elbow");
  const RE = byName(keypoints, "right_elbow");
  const LW = byName(keypoints, "left_wrist");
  const RW = byName(keypoints, "right_wrist");
  const LEar = byName(keypoints, "left_ear");
  const REar = byName(keypoints, "right_ear");

  // Check if we have enough keypoints
  const visibleKeypoints = keypoints.filter(
    (k) => k.score > POSE_CONFIG.CONFIDENT_SCORE
  ).length;
  if (visibleKeypoints < 15) return POSE_CATEGORIES.UNKNOWN;

  // Check for kneeling pose
  if (LK && RK && LA && RA) {
    const leftKneeAngle = angle3D(LH, LK, LA);
    const rightKneeAngle = angle3D(RH, RK, RA);

    if (
      leftKneeAngle &&
      rightKneeAngle &&
      leftKneeAngle < 120 &&
      rightKneeAngle < 120
    ) {
      return POSE_CATEGORIES.KNEELING;
    }
  }

  // Check for checking gun pose (arms close together, looking down)
  if (RH && RS && RE && RW) {
    const a1 = angle3D(RH, RS, RE);
    const a2 = angle3D(RS, RE, RW);

    if (0 < a1 && a1 < 20 && 30 < a2 && a2 < 50) {
      return POSE_CATEGORIES.CHECKING_GUN;
    }
  }

  // Check for one-handed stance (one arm extended, other close to body)
  if (LS && RS && LE && RE && LW && RW) {
    const leftArmAngle = angle3D(LS, LE, LW);
    const rightArmAngle = angle3D(RS, RE, RW);

    // One arm extended, other arm bent
    if (
      (leftArmAngle >= 150 && 60 <= rightArmAngle && rightArmAngle <= 135) ||
      (rightArmAngle >= 150 && 60 <= leftArmAngle && leftArmAngle <= 135)
    ) {
      return POSE_CATEGORIES.ONE_HAND_STANDING;
    }
  }

  // Check for two-handed stance (arms extended, body straight)
  if (LS && RS && LE && RE && LW && RW) {
    const leftArmAngle = angle3D(LS, LE, LW);
    const rightArmAngle = angle3D(RS, RE, RW);
    const handDistance = distance3D(LW, RW);

    // Both arms extended, body straight
    if ((leftArmAngle > 150 || rightArmAngle > 150) && handDistance < 1) {
      return POSE_CATEGORIES.TWO_HAND_STANDING;
    }
  }

  // Default to two-handed standing
  return POSE_CATEGORIES.UNKNOWN;
};

// Rule sets for each pose category
export const POSE_RULES = {
  [POSE_CATEGORIES.TWO_HAND_STANDING]: {
    name: t("twoHandStanding"),
    description: t("twoHandStandingDesc"),
    rules: (keypoints) => {
      const issues = [];
      let score = 0;
      let total = 0;

      const LS = byName(keypoints, "left_shoulder");
      const RS = byName(keypoints, "right_shoulder");
      const LH = byName(keypoints, "left_hip");
      const RH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");
      const LE = byName(keypoints, "left_elbow");
      const RE = byName(keypoints, "right_elbow");
      const LW = byName(keypoints, "left_wrist");
      const RW = byName(keypoints, "right_wrist");
      const LEar = byName(keypoints, "left_ear");
      const REar = byName(keypoints, "right_ear");

      // Feet spacing ≈ shoulder width (±20%)
      total++;
      if (LA && RA && LS && RS) {
        const ankleW = distance3D(LA, RA);
        const shoulderW = distance3D(LS, RS);
        if (
          ankleW > 0 &&
          shoulderW > 0 &&
          ankleW >= shoulderW * 0.8 &&
          ankleW <= shoulderW * 1.2
        ) {
          score++;
        } else {
          issues.push(t("feetSpacingIncorrect"));
        }
      } else {
        // issues.push(t("cannotSeeFeetShoulders"));
      }

      // Knee bend (each leg 160–175°)
      total++;
      if (LH && LK && LA) {
        const ang = angle3D(LH, LK, LA);
        if (ang !== null && ang >= 160 && ang <= 175) score++;
        else issues.push(t("leftKneeNotBent"));
      } //else issues.push(t("leftLegNotVisible"));

      total++;
      if (RH && RK && RA) {
        const ang = angle3D(RH, RK, RA);
        if (ang !== null && ang >= 160 && ang <= 175) score++;
        else issues.push(t("rightKneeNotBent"));
      } //else issues.push(t("rightLegNotVisible"));

      // Torso forward lean
      total++;
      if (LS && LH && LK) {
        const torso = angle3D(LS, LH, LK);
        if (torso !== null && torso < 175) score++;
        else issues.push(t("torsoTooUpright"));
      } //else issues.push(t("torsoLandmarksNotClear"));

      // Arms angles
      total++;
      if (LS && LE && LW) {
        const a = angle3D(LS, LE, LW);
        if (a !== null && a >= 150 && a <= 175) score++;
        else issues.push(t("frontArmAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        if (a !== null && a >= 150 && a <= 175) score++;
        else issues.push(t("rearArmAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("rearArmNotVisible"));

      // Arm angle with body
      total++;
      if (LH && LS && LE) {
        const a = angle3D(LH, LS, LE);
        if (a !== null && ((a >= 35 && a <= 45) || (a >= 85 && a <= 95)))
          score++;
        else issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      return { issues, score, total };
    },
  },

  [POSE_CATEGORIES.ONE_HAND_STANDING]: {
    name: t("oneHandStanding"),
    description: t("oneHandStandingDesc"),
    rules: (keypoints) => {
      const issues = [];
      let score = 0;
      let total = 0;

      const LS = byName(keypoints, "left_shoulder");
      const RS = byName(keypoints, "right_shoulder");
      const LH = byName(keypoints, "left_hip");
      const RH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");
      const LE = byName(keypoints, "left_elbow");
      const RE = byName(keypoints, "right_elbow");
      const LW = byName(keypoints, "left_wrist");
      const RW = byName(keypoints, "right_wrist");

      // Feet spacing (wider than two-hand stance)
      total++;
      if (LA && RA && LS && RS) {
        const ankleW = distance3D(LA, RA);
        const shoulderW = distance3D(LS, RS);
        if (
          ankleW > 0 &&
          shoulderW > 0 &&
          ankleW >= shoulderW * 1.0 &&
          ankleW <= shoulderW * 1.4
        ) {
          score++;
        } else {
          issues.push(t("feetSpacingWider"));
        }
      } else {
        issues.push(t("cannotSeeFeetShoulders"));
      }

      // Knee bend (more pronounced)
      total++;
      if (LH && LK && LA) {
        const ang = angle3D(LH, LK, LA);
        if (ang !== null && ang >= 150 && ang <= 180) score++;
        else issues.push(t("leftKneeBendIncorrect"));
      } else issues.push(t("leftLegNotVisible"));

      total++;
      if (RH && RK && RA) {
        const ang = angle3D(RH, RK, RA);
        if (ang !== null && ang >= 150 && ang <= 180) score++;
        else issues.push(t("rightKneeBendIncorrect"));
      } else issues.push(t("rightLegNotVisible"));

      // Extended arm (shooting arm)
      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        if (a !== null && a >= 150 && a <= 180) score++;
        else issues.push(t("extendedArmNotStraight", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      // Arm angle with body
      total++;
      if (RS && RE && RH) {
        const a = angle3D(RE, RS, RH);
        if (a !== null && ((a >= 30 && a <= 50) || (a >= 80 && a <= 100)))
          score++;
        else issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      // Support arm position
      total++;
      if (LS && LE && LW) {
        const a = angle3D(LS, LE, LW);
        if (a !== null && a >= 60 && a <= 135) score++;
        else
          issues.push(
            t("supportArmPositionIncorrect", { angle: a.toFixed(1) })
          );
      } else issues.push(t("supportArmNotVisible"));

      return { issues, score, total };
    },
  },

  [POSE_CATEGORIES.KNEELING]: {
    name: t("kneeling"),
    description: t("kneelingDesc"),
    rules: (keypoints) => {
      const issues = [];
      let score = 0;
      let total = 0;

      const LS = byName(keypoints, "left_shoulder");
      const RS = byName(keypoints, "right_shoulder");
      const LH = byName(keypoints, "left_hip");
      const RH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");
      const LE = byName(keypoints, "left_elbow");
      const RE = byName(keypoints, "right_elbow");
      const LW = byName(keypoints, "left_wrist");
      const RW = byName(keypoints, "right_wrist");

      // Knee angles (should be bent significantly)
      total++;
      if (LH && LK && LA) {
        const ang = angle3D(LH, LK, LA);
        if (ang !== null && ang >= 80 && ang <= 120) score++;
        else issues.push(t("leftKneeNotBentEnough"));
      } else issues.push(t("leftLegNotVisible"));

      total++;
      if (RH && RK && RA) {
        const ang = angle3D(RH, RK, RA);
        if (ang !== null && ang >= 80 && ang <= 120) score++;
        else issues.push(t("rightKneeNotBentEnough"));
      } else issues.push(t("rightLegNotVisible"));

      // Hip position (should be lower)
      total++;
      if (LS && LH && LK) {
        const hipKneeAngle = angle3D(LS, LH, LK);
        if (hipKneeAngle !== null && hipKneeAngle >= 60 && hipKneeAngle <= 100)
          score++;
        else issues.push(t("hipPositionTooHigh"));
      } else issues.push(t("hipLandmarksNotClear"));

      // Arm positions (similar to standing but adjusted for height)
      total++;
      if (LS && LE && LW) {
        const a = angle3D(LS, LE, LW);
        if (a !== null && a >= 140 && a <= 170) score++;
        else issues.push(t("frontArmAngleIncorrect"));
      } else issues.push(t("frontArmNotVisible"));

      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        if (a !== null && a >= 80 && a <= 130) score++;
        else issues.push(t("rearArmAngleIncorrect"));
      } else issues.push(t("rearArmNotVisible"));

      return { issues, score, total };
    },
  },

  [POSE_CATEGORIES.CHECKING_GUN]: {
    name: t("checkingGun"),
    description: t("checkingGunDesc"),
    rules: (keypoints) => {
      const issues = [];
      let score = 0;
      let total = 0;

      const LS = byName(keypoints, "left_shoulder");
      const RS = byName(keypoints, "right_shoulder");
      const LE = byName(keypoints, "left_elbow");
      const RE = byName(keypoints, "right_elbow");
      const LW = byName(keypoints, "left_wrist");
      const RW = byName(keypoints, "right_wrist");
      const RH = byName(keypoints, "left_heel");
      const LH = byName(keypoints, "right_heel");

      // Arms should be close together
      total++;
      if (LW && RW) {
        const wristDist = distance3D(LW, RW);
        const shoulderDist = distance3D(LS, RS);
        if (wristDist < shoulderDist * 0.4) score++;
        else issues.push(t("handsNotCloseEnough"));
      } else issues.push(t("handsNotVisible"));

      // Arm angle with body
      total++;
      if (RS && RE && RH) {
        const a = angle3D(RE, RS, RH);
        if (a !== null && a >= 30 && a <= 70) score++;
        else issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      // Elbows should be bent
      // total++;
      // if (LS && LE && LW) {
      //   const a = angle3D(LS, LE, LW);
      //   if (a !== null && a >= 60 && a <= 120) score++;
      //   else issues.push(t("leftElbowNotBentEnough"));
      // } else issues.push(t("frontArmNotVisible"));

      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        if (a !== null && a >= 40 && a <= 120) score++;
        else issues.push(t("rightElbowNotBentEnough"));
      } else issues.push(t("rearArmNotVisible"));

      // Head should be looking down
      // total++;
      // if (LEar && REar && LS && RS) {
      //   const earDiff = Math.abs(LEar.y - REar.y);
      //   const shoulderDiff = Math.abs(LS.y - RS.y);
      //   if (earDiff <= Math.max(5, shoulderDiff * 0.2)) score++;
      //   else issues.push(t("headNotLevel"));
      // } else issues.push(t("headLandmarksNotClear"));

      // Gun should be pointed down (wrist position)
      // total++;
      // if (LW && RW && LS && RS) {
      //   const wristY = (LW.y + RW.y) / 2;
      //   const shoulderY = (LS.y + RS.y) / 2;
      //   if (wristY > shoulderY) score++;
      //   else issues.push(t("gunNotPointedDown"));
      // } else issues.push(t("armPositionsNotClear"));

      return { issues, score, total };
    },
  },
};

// Get pose category display info
export const getPoseCategoryInfo = (category) => {
  return (
    POSE_RULES[category] || {
      name: t("unknown"),
      description: t("unableToClassify"),
      rules: () => ({ issues: [t("poseNotRecognized")], score: 0, total: 1 }),
    }
  );
};
