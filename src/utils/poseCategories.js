import { angle3D, angleAt, distance3D } from "./compute";
import { POSE_CONFIG } from "../utils/const";
import { t } from "./translations";

// Pose classification categories
export const POSE_CATEGORIES = {
  TWO_HAND_STANDING: "two_hand_standing",
  ONE_HAND_STANDING: "one_hand_standing",
  KNEELING: "kneeling",
  CHECKING_GUN: "checking_gun",
  GUN_ASSEMBLING: "gun_assembling",
  UNKNOWN: "unknown",
};

// Helper function to get keypoint by name
const byName = (kps, name) =>
  kps.find((k) => k.name === name && k.score > POSE_CONFIG.CONFIDENT_SCORE) ||
  null;

// Helper function for graduated scoring based on distance from target range
const calculateGraduatedScore = (
  value,
  minTarget,
  maxTarget,
  tolerance = 0
) => {
  if (value === null || value === undefined) return 0;

  // If within target range, return full score (1.0)
  if (value >= minTarget && value <= maxTarget) {
    return 1.0;
  }

  // Calculate distance from target range
  let distanceFromRange;
  if (value < minTarget) {
    distanceFromRange = minTarget - value;
  } else {
    distanceFromRange = value - maxTarget;
  }

  // Apply tolerance (if provided) to reduce penalty for small deviations
  const effectiveDistance = Math.max(0, distanceFromRange - tolerance);

  // Calculate score based on distance (exponential decay)
  // Score decreases more rapidly as distance increases
  const maxPenalty = 1.0; // Maximum penalty (full score loss)
  const decayFactor = 0.1; // How quickly score decreases with distance

  const penalty = Math.min(maxPenalty, effectiveDistance * decayFactor);
  const score = Math.max(0, 1.0 - penalty);

  return score;
};

// Helper function for angle scoring with graduated penalty
const scoreAngle = (angle, minTarget, maxTarget, tolerance = 5) => {
  return calculateGraduatedScore(angle, minTarget, maxTarget, tolerance);
};

// Helper function to calculate angle between two legs
const calculateLegAngle = (
  leftHip,
  leftKnee,
  leftAnkle,
  rightHip,
  rightKnee,
  rightAnkle
) => {
  if (
    !leftHip ||
    !leftKnee ||
    !leftAnkle ||
    !rightHip ||
    !rightKnee ||
    !rightAnkle
  ) {
    return null;
  }

  // Calculate vectors for both legs (from hip to ankle)
  const leftLegVector = {
    x: leftAnkle.x - leftHip.x,
    y: leftAnkle.y - leftHip.y,
    z: leftAnkle.z - leftHip.z,
  };

  const rightLegVector = {
    x: rightAnkle.x - rightHip.x,
    y: rightAnkle.y - rightHip.y,
    z: rightAnkle.z - rightHip.z,
  };

  // Calculate dot product
  const dotProduct =
    leftLegVector.x * rightLegVector.x +
    leftLegVector.y * rightLegVector.y +
    leftLegVector.z * rightLegVector.z;

  // Calculate magnitudes
  const leftMagnitude = Math.sqrt(
    leftLegVector.x * leftLegVector.x +
      leftLegVector.y * leftLegVector.y +
      leftLegVector.z * leftLegVector.z
  );

  const rightMagnitude = Math.sqrt(
    rightLegVector.x * rightLegVector.x +
      rightLegVector.y * rightLegVector.y +
      rightLegVector.z * rightLegVector.z
  );

  // Calculate angle using dot product formula: cos(θ) = (a·b) / (|a||b|)
  const cosAngle = dotProduct / (leftMagnitude * rightMagnitude);

  // Clamp to avoid numerical errors
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));

  // Convert to degrees
  const angleRadians = Math.acos(clampedCos);
  const angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
};

// Pose classification logic
export const classifyPose = (keypoints) => {
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

      const legAngle = calculateLegAngle(LH, LK, LA, RH, RK, RA);
      if (legAngle < 20) {
        // PARALLEL STANCE ANALYSIS
        // 1. Feet spacing: 0.8 -> 1.2 * shoulder spacing
        total++;
        if (LA && RA && LS && RS) {
          const ankleW = distance3D(LA, RA);
          const shoulderW = distance3D(LS, RS);
          if (ankleW > 0 && shoulderW > 0) {
            const minSpacing = shoulderW * 0.8;
            const maxSpacing = shoulderW * 1.2;
            const spacingScore = calculateGraduatedScore(
              ankleW,
              minSpacing,
              maxSpacing,
              shoulderW * 0.05
            );
            score += spacingScore;

            if (spacingScore < 1.0) {
              issues.push(t("feetSpacingIncorrect"));
            }
          } else {
            issues.push(t("feetSpacingIncorrect"));
          }
        }

        // 2. Each leg is straight (knee angle 160-180°)
        total++;
        if (LH && LK && LA) {
          const leftKneeAng = angle3D(LH, LK, LA);
          const legScore = scoreAngle(leftKneeAng, 160, 180, 5);
          score += legScore;

          if (legScore < 1.0) {
            issues.push(
              t("leftLegNotStraight", {
                angle: leftKneeAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        total++;
        if (RH && RK && RA) {
          const rightKneeAng = angle3D(RH, RK, RA);
          const legScore = scoreAngle(rightKneeAng, 160, 180, 5);
          score += legScore;

          if (legScore < 1.0) {
            issues.push(
              t("rightLegNotStraight", {
                angle: rightKneeAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        // 3. Body forward lean (torso angle < 170°)
        total++;
        if (LS && LH && LK) {
          const torso = angle3D(LS, LH, LK);
          const torsoScore = calculateGraduatedScore(torso, 0, 170, 5);
          score += torsoScore;

          if (torsoScore < 1.0) {
            issues.push(t("torsoTooUpright"));
          }
        }

        // 4. Both arms holding gun are straight (elbow angle 150-180°)
        total++;
        if (LS && LE && LW) {
          const leftArmAng = angle3D(LS, LE, LW);
          const armScore = scoreAngle(leftArmAng, 150, 180, 5);
          score += armScore;

          if (armScore < 1.0) {
            issues.push(
              t("leftArmNotStraight", {
                angle: leftArmAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        total++;
        if (RS && RE && RW) {
          const rightArmAng = angle3D(RS, RE, RW);
          const armScore = scoreAngle(rightArmAng, 150, 180, 5);
          score += armScore;

          if (armScore < 1.0) {
            issues.push(
              t("rightArmNotStraight", {
                angle: rightArmAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        // 5. Angle between arm and body: 80-100°
        total++;
        if (LH && LS && LE) {
          const leftArmBodyAng = angle3D(LH, LS, LE);
          const armBodyScore = scoreAngle(leftArmBodyAng, 80, 100, 5);
          score += armBodyScore;

          if (armBodyScore < 1.0) {
            issues.push(
              t("leftArmBodyAngleIncorrect", {
                angle: leftArmBodyAng?.toFixed(1),
              })
            );
          }
        }

        total++;
        if (RH && RS && RE) {
          const rightArmBodyAng = angle3D(RH, RS, RE);
          const armBodyScore = scoreAngle(rightArmBodyAng, 80, 100, 5);
          score += armBodyScore;

          if (armBodyScore < 1.0) {
            issues.push(
              t("rightArmBodyAngleIncorrect", {
                angle: rightArmBodyAng?.toFixed(1),
              })
            );
          }
        }
      } else {
        // FRONT-BACK STANCE ANALYSIS
        // 1. Each leg is straight (knee angle 160-180°)
        total++;
        if (LH && LK && LA) {
          const leftKneeAng = angle3D(LH, LK, LA);
          const legScore = scoreAngle(leftKneeAng, 160, 180, 5);
          score += legScore;

          if (legScore < 1.0) {
            issues.push(
              t("leftLegNotStraight", {
                angle: leftKneeAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        total++;
        if (RH && RK && RA) {
          const rightKneeAng = angle3D(RH, RK, RA);
          const legScore = scoreAngle(rightKneeAng, 160, 180, 5);
          score += legScore;

          if (legScore < 1.0) {
            issues.push(
              t("rightLegNotStraight", {
                angle: rightKneeAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        // 2. Angle between 2 legs: 30-50°
        total++;
        if (LH && LK && LA && RH && RK && RA) {
          const legAngle = calculateLegAngle(LH, LK, LA, RH, RK, RA);
          const legAngleScore = scoreAngle(legAngle, 30, 50, 3);
          score += legAngleScore;

          if (legAngleScore < 1.0) {
            issues.push(
              t("legAngleIncorrect", {
                angle: legAngle?.toFixed(1) || "N/A",
              })
            );
          }
        }

        // 4. Gun arm: straight (elbow angle 160-180°) with 80-100° with body
        total++;
        if (RS && RE && RW) {
          const gunArmAng = angle3D(RS, RE, RW);
          const gunArmScore = scoreAngle(gunArmAng, 160, 180, 5);
          score += gunArmScore;

          if (gunArmScore < 1.0) {
            issues.push(
              t("gunArmNotStraight", {
                angle: gunArmAng?.toFixed(1) || "N/A",
              })
            );
          }
        }

        total++;
        if (RH && RS && RE) {
          const gunArmBodyAng = angle3D(RH, RS, RE);
          const gunArmBodyScore = scoreAngle(gunArmBodyAng, 80, 100, 5);
          score += gunArmBodyScore;

          if (gunArmBodyScore < 1.0) {
            issues.push(
              t("gunArmBodyAngleIncorrect", {
                angle: gunArmBodyAng?.toFixed(1),
              })
            );
          }
        }

        // 5. Support arm: angle at shoulder with body 30-50°, angle at wrist 70-120°
        total++;
        if (LH && LS && LE) {
          const supportArmBodyAng = angle3D(LH, LS, LE);
          const supportArmBodyScore = scoreAngle(supportArmBodyAng, 30, 50, 3);
          score += supportArmBodyScore;

          if (supportArmBodyScore < 1.0) {
            issues.push(
              t("supportArmBodyAngleIncorrect", {
                angle: supportArmBodyAng?.toFixed(1),
              })
            );
          }
        }

        total++;
        if (LS && LE && LW) {
          const supportArmWristAng = angle3D(LS, LE, LW);
          const supportArmWristScore = scoreAngle(
            supportArmWristAng,
            70,
            120,
            5
          );
          score += supportArmWristScore;

          if (supportArmWristScore < 1.0) {
            issues.push(
              t("supportArmWristAngleIncorrect", {
                angle: supportArmWristAng?.toFixed(1),
              })
            );
          }
        }
      }
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
      const RE = byName(keypoints, "right_elbow");
      const RW = byName(keypoints, "right_wrist");
      const LH = byName(keypoints, "left_hip");
      const RH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");
      const LE = byName(keypoints, "left_elbow");
      const LW = byName(keypoints, "left_wrist");

      // Feet spacing (wider than two-hand stance)
      total++;
      if (LA && RA && LS && RS) {
        const ankleW = distance3D(LA, RA);
        const shoulderW = distance3D(LS, RS);
        if (ankleW > 0 && shoulderW > 0) {
          const minSpacing = shoulderW * 0.9;
          const maxSpacing = shoulderW * 1.3;
          const spacingScore = calculateGraduatedScore(
            ankleW,
            minSpacing,
            maxSpacing,
            shoulderW * 0.05
          );
          score += spacingScore;

          if (spacingScore < 1.0) {
            issues.push(t("feetSpacingWider"));
          }
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
        const kneeScore = scoreAngle(ang, 150, 180, 5);
        score += kneeScore;
        if (kneeScore < 1.0) issues.push(t("leftKneeBendIncorrect"));
      } else issues.push(t("leftLegNotVisible"));

      total++;
      if (RH && RK && RA) {
        const ang = angle3D(RH, RK, RA);
        const kneeScore = scoreAngle(ang, 150, 180, 5);
        score += kneeScore;
        if (kneeScore < 1.0) issues.push(t("rightKneeBendIncorrect"));
      } else issues.push(t("rightLegNotVisible"));

      // Extended arm (shooting arm)
      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        const armScore = scoreAngle(a, 160, 180, 5);
        score += armScore;
        if (armScore < 1.0)
          issues.push(t("extendedArmNotStraight", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      // Arm angle with body
      total++;
      if (RS && RE && RH) {
        const a = angle3D(RE, RS, RH);
        const armBodyScore = scoreAngle(a, 80, 110, 5);
        score += armBodyScore;
        if (armBodyScore < 1.0)
          issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      // Support arm position
      total++;
      if (LS && LE && LW) {
        const a = angle3D(LS, LE, LW);
        const supportArmScore = scoreAngle(a, 60, 120, 5);
        score += supportArmScore;
        if (supportArmScore < 1.0)
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

      // Helper function to determine support leg
      const determineSupportLeg = () => {
        if (!LH || !RH || !LK || !RK || !LA || !RA) return null;

        // Compare knee angles (support leg should be more bent)
        const leftKneeAng = angle3D(LH, LK, LA);
        const rightKneeAng = angle3D(RH, RK, RA);

        if (leftKneeAng !== null && rightKneeAng !== null) {
          if (leftKneeAng < rightKneeAng) return "left";
        }
        return "right";
      };

      const supportLeg = determineSupportLeg();

      if (supportLeg === null) {
        issues.push(t("cannotDetermineSupportLeg"));
        return { issues, score, total };
      }

      // 1. Support leg analysis (knee and toe on ground, butt on heel)
      // Indirect approach: Check if support leg is properly bent and positioned
      total++;
      if (supportLeg === "left" && LH && LK && LA) {
        const supportKneeAng = angle3D(LH, LK, LA);
        // Support leg should be very bent (knee on ground, butt on heel)
        const supportLegScore = calculateGraduatedScore(
          supportKneeAng,
          0,
          60,
          5
        );
        score += supportLegScore;
        if (supportLegScore < 1.0) {
          issues.push(t("supportLegNotProperlyPositioned"));
        }
      } else if (supportLeg === "right" && RH && RK && RA) {
        const supportKneeAng = angle3D(RH, RK, RA);
        const supportLegScore = calculateGraduatedScore(
          supportKneeAng,
          0,
          60,
          5
        );
        score += supportLegScore;
        if (supportLegScore < 1.0) {
          issues.push(t("supportLegNotProperlyPositioned"));
        }
      }

      // 2. Other leg analysis (knee angle 40-70°)
      total++;
      if (supportLeg === "left" && RH && RK && RA) {
        const otherKneeAng = angle3D(RH, RK, RA);
        const otherLegScore = scoreAngle(otherKneeAng, 40, 70, 3);
        score += otherLegScore;
        if (otherLegScore < 1.0) {
          issues.push(
            t("otherLegKneeAngleIncorrect", {
              angle: otherKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      } else if (supportLeg === "right" && LH && LK && LA) {
        const otherKneeAng = angle3D(LH, LK, LA);
        const otherLegScore = scoreAngle(otherKneeAng, 40, 70, 3);
        score += otherLegScore;
        if (otherLegScore < 1.0) {
          issues.push(
            t("otherLegKneeAngleIncorrect", {
              angle: otherKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

      // 4. Determine gun arm vs support arm
      // Gun arm is typically the arm on the same side as the other leg (non-support leg)
      const gunArm = supportLeg === "right" ? "right" : "left";
      const supportArm = supportLeg === "left" ? "right" : "left";

      // 5. Gun arm: straight (elbow angle 170-180°)
      total++;
      if (gunArm === "left" && LS && LE && LW) {
        const gunArmAng = angle3D(LS, LE, LW);
        const gunArmScore = scoreAngle(gunArmAng, 150, 180, 5);
        score += gunArmScore;
        if (gunArmScore < 1.0) {
          issues.push(
            t("gunArmNotStraight", {
              angle: gunArmAng?.toFixed(1) || "N/A",
            })
          );
        }
      } else if (gunArm === "right" && RS && RE && RW) {
        const gunArmAng = angle3D(RS, RE, RW);
        const gunArmScore = scoreAngle(gunArmAng, 150, 180, 5);
        score += gunArmScore;
        if (gunArmScore < 1.0) {
          issues.push(
            t("gunArmNotStraight", {
              angle: gunArmAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

      // 6. Support arm: angle at shoulder with body 40-70°
      total++;
      if (supportArm === "left" && LH && LS && LE) {
        const supportArmBodyAng = angle3D(LH, LS, LE);
        const supportArmBodyScore = scoreAngle(supportArmBodyAng, 40, 70, 3);
        score += supportArmBodyScore;
        if (supportArmBodyScore < 1.0) {
          issues.push(
            t("supportArmBodyAngleIncorrect", {
              angle: supportArmBodyAng?.toFixed(1),
            })
          );
        }
      } else if (supportArm === "right" && RH && RS && RE) {
        const supportArmBodyAng = angle3D(RH, RS, RE);
        const supportArmBodyScore = scoreAngle(supportArmBodyAng, 40, 70, 3);
        score += supportArmBodyScore;
        if (supportArmBodyScore < 1.0) {
          issues.push(
            t("supportArmBodyAngleIncorrect", {
              angle: supportArmBodyAng?.toFixed(1),
            })
          );
        }
      }

      // 8. Support arm wrist angle 60-100°
      total++;
      if (supportArm === "left" && LS && LE && LW) {
        const supportWristAng = angle3D(LS, LE, LW);
        const supportWristScore = scoreAngle(supportWristAng, 60, 100, 5);
        score += supportWristScore;
        if (supportWristScore < 1.0) {
          issues.push(
            t("supportArmWristAngleIncorrect", {
              angle: supportWristAng?.toFixed(1),
            })
          );
        }
      } else if (supportArm === "right" && RS && RE && RW) {
        const supportWristAng = angle3D(RS, RE, RW);
        const supportWristScore = scoreAngle(supportWristAng, 60, 100, 5);
        score += supportWristScore;
        if (supportWristScore < 1.0) {
          issues.push(
            t("supportArmWristAngleIncorrect", {
              angle: supportWristAng?.toFixed(1),
            })
          );
        }
      }

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

      const RS = byName(keypoints, "right_shoulder");
      const RE = byName(keypoints, "right_elbow");
      const RW = byName(keypoints, "right_wrist");
      const RH = byName(keypoints, "left_hip");
      const LH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");

      // Arm angle with body
      total++;
      if (RS && RE && RH) {
        const a = angle3D(RE, RS, RH);
        const armBodyScore = scoreAngle(a, 20, 50, 3);
        score += armBodyScore;
        if (armBodyScore < 1.0)
          issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        const elbowScore = scoreAngle(a, 80, 110, 5);
        score += elbowScore;
        if (elbowScore < 1.0) issues.push(t("rightElbowNotBentEnough"));
      } else issues.push(t("rearArmNotVisible"));

      total++;
      if (LH && LK && LA) {
        const leftKneeAng = angle3D(LH, LK, LA);
        const leftLegScore = scoreAngle(leftKneeAng, 150, 180, 5);
        score += leftLegScore;
        if (leftLegScore < 1.0) {
          issues.push(
            t("leftLegNotStraight", {
              angle: leftKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

      total++;
      if (RH && RK && RA) {
        const rightKneeAng = angle3D(RH, RK, RA);
        const rightLegScore = scoreAngle(rightKneeAng, 150, 180, 5);
        score += rightLegScore;
        if (rightLegScore < 1.0) {
          issues.push(
            t("rightLegNotStraight", {
              angle: rightKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

      return { issues, score, total };
    },
  },
  [POSE_CATEGORIES.GUN_ASSEMBLING]: {
    name: t("gunAssembling"),
    description: t("gunAssemblingDesc"),
    rules: (keypoints) => {
      const issues = [];
      let score = 0;
      let total = 0;

      const RS = byName(keypoints, "right_shoulder");
      const RE = byName(keypoints, "right_elbow");
      const RW = byName(keypoints, "right_wrist");
      const RH = byName(keypoints, "left_hip");
      const LH = byName(keypoints, "right_hip");
      const LK = byName(keypoints, "left_knee");
      const RK = byName(keypoints, "right_knee");
      const LA = byName(keypoints, "left_ankle");
      const RA = byName(keypoints, "right_ankle");

      // Arm angle with body
      total++;
      if (RS && RE && RH) {
        const a = angle3D(RE, RS, RH);
        const armBodyScore = scoreAngle(a, 20, 50, 3);
        score += armBodyScore;
        if (armBodyScore < 1.0)
          issues.push(t("armAngleIncorrect", { angle: a.toFixed(1) }));
      } else issues.push(t("frontArmNotVisible"));

      total++;
      if (RS && RE && RW) {
        const a = angle3D(RS, RE, RW);
        const elbowScore = scoreAngle(a, 80, 110, 5);
        score += elbowScore;
        if (elbowScore < 1.0) issues.push(t("rightElbowNotBentEnough"));
      } else issues.push(t("rearArmNotVisible"));

      total++;
      if (LH && LK && LA) {
        const leftKneeAng = angle3D(LH, LK, LA);
        const leftLegScore = scoreAngle(leftKneeAng, 150, 180, 5);
        score += leftLegScore;
        if (leftLegScore < 1.0) {
          issues.push(
            t("leftLegNotStraight", {
              angle: leftKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

      total++;
      if (RH && RK && RA) {
        const rightKneeAng = angle3D(RH, RK, RA);
        const rightLegScore = scoreAngle(rightKneeAng, 150, 180, 5);
        score += rightLegScore;
        if (rightLegScore < 1.0) {
          issues.push(
            t("rightLegNotStraight", {
              angle: rightKneeAng?.toFixed(1) || "N/A",
            })
          );
        }
      }

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
