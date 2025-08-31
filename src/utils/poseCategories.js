import { angleAt, dist } from "./compute";
import { POSE_CONFIG } from "../utils/const";

// Pose classification categories
export const POSE_CATEGORIES = {
  TWO_HAND_STANDING: "two_hand_standing",
  ONE_HAND_STANDING: "one_hand_standing",
  KNEELING: "kneeling",
  CHECKING_GUN: "checking_gun",
  UNKNOWN: "unknown"
};

// Helper function to get keypoint by name
const byName = (kps, name) =>
  kps.find((k) => k.name === name && k.score > POSE_CONFIG.CONFIDENT_SCORE) || null;

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
  const visibleKeypoints = keypoints.filter(k => k.score > POSE_CONFIG.CONFIDENT_SCORE).length;
  if (visibleKeypoints < 10) return POSE_CATEGORIES.UNKNOWN;

  // Check for kneeling pose
  if (LK && RK && LA && RA) {
    const leftKneeAngle = angleAt(LK, LH, LA);
    const rightKneeAngle = angleAt(RK, RH, RA);
    
    if (leftKneeAngle && rightKneeAngle && 
        leftKneeAngle < 120 && rightKneeAngle < 120) {
      return POSE_CATEGORIES.KNEELING;
    }
  }

  // Check for checking gun pose (arms close together, looking down)
  if (LS && RS && LE && RE && LW && RW) {
    const shoulderDist = dist(LS, RS);
    const wristDist = dist(LW, RW);
    const elbowDist = dist(LE, RE);
    
    if (wristDist < shoulderDist * 0.3 && elbowDist < shoulderDist * 0.5) {
      return POSE_CATEGORIES.CHECKING_GUN;
    }
  }

  // Check for one-handed stance (one arm extended, other close to body)
  if (LS && RS && LE && RE && LW && RW) {
    const leftArmAngle = angleAt(LE, LS, LW);
    const rightArmAngle = angleAt(RE, RS, RW);
    
    // One arm extended (>150°), other arm bent (<110°)
    if ((leftArmAngle > 150 && rightArmAngle < 110) || 
        (rightArmAngle > 150 && leftArmAngle < 110)) {
      return POSE_CATEGORIES.ONE_HAND_STANDING;
    }
  }

  // Default to two-handed standing
  return POSE_CATEGORIES.TWO_HAND_STANDING;
};

// Rule sets for each pose category
export const POSE_RULES = {
  [POSE_CATEGORIES.TWO_HAND_STANDING]: {
    name: "Two-Hand Standing Stance",
    description: "Traditional shotgun shooting stance with both hands on the gun",
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
        const ankleW = Math.abs(LA.x - RA.x);
        const shoulderW = Math.abs(LS.x - RS.x);
        if (ankleW > 0 && shoulderW > 0 && 
            ankleW >= shoulderW * 0.8 && ankleW <= shoulderW * 1.2) {
          score++;
        } else {
          issues.push("Feet spacing incorrect (aim ~ shoulder width)");
        }
      } else {
        issues.push("Cannot see feet/shoulders clearly");
      }

      // Knee bend (each leg 160–175°)
      total++;
      if (LH && LK && LA) {
        const ang = angleAt(LK, LH, LA);
        if (ang !== null && ang >= 160 && ang <= 175) score++;
        else issues.push("Left knee not slightly bent");
      } else issues.push("Left leg not fully visible");

      total++;
      if (RH && RK && RA) {
        const ang = angleAt(RK, RH, RA);
        if (ang !== null && ang >= 160 && ang <= 175) score++;
        else issues.push("Right knee not slightly bent");
      } else issues.push("Right leg not fully visible");

      // Torso forward lean
      total++;
      if (LS && LH && LK) {
        const torso = angleAt(LH, LS, LK);
        if (torso !== null && torso < 175) score++;
        else issues.push("Torso too upright (lean slightly forward)");
      } else issues.push("Torso landmarks not clear");

      // Arms: front arm ~150–170°, rear arm ~90–120°
      total++;
      if (LS && LE && LW) {
        const a = angleAt(LE, LS, LW);
        if (a !== null && a >= 150 && a <= 170) score++;
        else issues.push("Front arm angle incorrect (extend more/less)");
      } else issues.push("Front arm not fully visible");

      total++;
      if (RS && RE && RW) {
        const a = angleAt(RE, RS, RW);
        if (a !== null && a >= 90 && a <= 120) score++;
        else issues.push("Rear arm angle incorrect");
      } else issues.push("Rear arm not fully visible");

      // Head tilt
      total++;
      if (LEar && REar && LS && RS) {
        const earDiff = Math.abs(LEar.y - REar.y);
        const shoulderDiff = Math.abs(LS.y - RS.y);
        if (earDiff <= Math.max(10, shoulderDiff * 0.3)) score++;
        else issues.push("Head tilted too much");
      } else issues.push("Head landmarks not clear");

      return { issues, score, total };
    }
  },

  [POSE_CATEGORIES.ONE_HAND_STANDING]: {
    name: "One-Hand Standing Stance",
    description: "Single-handed shotgun stance for quick shots",
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
        const ankleW = Math.abs(LA.x - RA.x);
        const shoulderW = Math.abs(LS.x - RS.x);
        if (ankleW > 0 && shoulderW > 0 && 
            ankleW >= shoulderW * 1.0 && ankleW <= shoulderW * 1.4) {
          score++;
        } else {
          issues.push("Feet spacing incorrect (wider stance needed)");
        }
      } else {
        issues.push("Cannot see feet/shoulders clearly");
      }

      // Knee bend (more pronounced)
      total++;
      if (LH && LK && LA) {
        const ang = angleAt(LK, LH, LA);
        if (ang !== null && ang >= 150 && ang <= 170) score++;
        else issues.push("Left knee bend incorrect");
      } else issues.push("Left leg not fully visible");

      total++;
      if (RH && RK && RA) {
        const ang = angleAt(RK, RH, RA);
        if (ang !== null && ang >= 150 && ang <= 170) score++;
        else issues.push("Right knee bend incorrect");
      } else issues.push("Right leg not fully visible");

      // Extended arm (shooting arm)
      total++;
      if (LS && LE && LW) {
        const a = angleAt(LE, LS, LW);
        if (a !== null && a >= 160 && a <= 180) score++;
        else issues.push("Extended arm not straight enough");
      } else issues.push("Extended arm not fully visible");

      // Support arm position
      total++;
      if (RS && RE && RW) {
        const a = angleAt(RE, RS, RW);
        if (a !== null && a >= 60 && a <= 120) score++;
        else issues.push("Support arm position incorrect");
      } else issues.push("Support arm not fully visible");

      return { issues, score, total };
    }
  },

  [POSE_CATEGORIES.KNEELING]: {
    name: "Kneeling Stance",
    description: "Low-profile kneeling position for stability",
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
        const ang = angleAt(LK, LH, LA);
        if (ang !== null && ang >= 80 && ang <= 120) score++;
        else issues.push("Left knee not bent enough for kneeling");
      } else issues.push("Left leg not fully visible");

      total++;
      if (RH && RK && RA) {
        const ang = angleAt(RK, RH, RA);
        if (ang !== null && ang >= 80 && ang <= 120) score++;
        else issues.push("Right knee not bent enough for kneeling");
      } else issues.push("Right leg not fully visible");

      // Hip position (should be lower)
      total++;
      if (LS && LH && LK) {
        const hipKneeAngle = angleAt(LH, LS, LK);
        if (hipKneeAngle !== null && hipKneeAngle >= 60 && hipKneeAngle <= 100) score++;
        else issues.push("Hip position too high");
      } else issues.push("Hip landmarks not clear");

      // Arm positions (similar to standing but adjusted for height)
      total++;
      if (LS && LE && LW) {
        const a = angleAt(LE, LS, LW);
        if (a !== null && a >= 140 && a <= 170) score++;
        else issues.push("Front arm angle incorrect");
      } else issues.push("Front arm not fully visible");

      total++;
      if (RS && RE && RW) {
        const a = angleAt(RE, RS, RW);
        if (a !== null && a >= 80 && a <= 130) score++;
        else issues.push("Rear arm angle incorrect");
      } else issues.push("Rear arm not fully visible");

      return { issues, score, total };
    }
  },

  [POSE_CATEGORIES.CHECKING_GUN]: {
    name: "Checking Gun Stance",
    description: "Safety check position with gun pointed down",
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
      const LEar = byName(keypoints, "left_ear");
      const REar = byName(keypoints, "right_ear");

      // Arms should be close together
      total++;
      if (LW && RW) {
        const wristDist = dist(LW, RW);
        const shoulderDist = dist(LS, RS);
        if (wristDist < shoulderDist * 0.4) score++;
        else issues.push("Hands not close enough together");
      } else issues.push("Hands not visible");

      // Elbows should be bent
      total++;
      if (LS && LE && LW) {
        const a = angleAt(LE, LS, LW);
        if (a !== null && a >= 60 && a <= 120) score++;
        else issues.push("Left elbow not bent enough");
      } else issues.push("Left arm not fully visible");

      total++;
      if (RS && RE && RW) {
        const a = angleAt(RE, RS, RW);
        if (a !== null && a >= 60 && a <= 120) score++;
        else issues.push("Right elbow not bent enough");
      } else issues.push("Right arm not fully visible");

      // Head should be looking down
      total++;
      if (LEar && REar && LS && RS) {
        const earDiff = Math.abs(LEar.y - REar.y);
        const shoulderDiff = Math.abs(LS.y - RS.y);
        if (earDiff <= Math.max(5, shoulderDiff * 0.2)) score++;
        else issues.push("Head not level (should be looking down)");
      } else issues.push("Head landmarks not clear");

      // Gun should be pointed down (wrist position)
      total++;
      if (LW && RW && LS && RS) {
        const wristY = (LW.y + RW.y) / 2;
        const shoulderY = (LS.y + RS.y) / 2;
        if (wristY > shoulderY) score++;
        else issues.push("Gun not pointed down");
      } else issues.push("Arm positions not clear");

      return { issues, score, total };
    }
  }
};

// Get pose category display info
export const getPoseCategoryInfo = (category) => {
  return POSE_RULES[category] || {
    name: "Unknown Pose",
    description: "Unable to classify this pose",
    rules: () => ({ issues: ["Pose not recognized"], score: 0, total: 1 })
  };
};
