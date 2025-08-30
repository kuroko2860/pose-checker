import { angleAt, dist } from "../utils/compute";
import { names } from "../utils/const";

const PoseAnalyzer = () => {
  const SIMILARITY_THRESHOLD = 85;

  // Helper functions
  const byName = (kps, name) =>
    kps.find((k) => k.name === name && k.score > 0.4) || null;

  const checkRules = (keypoints) => {
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
      if (
        ankleW > 0 &&
        shoulderW > 0 &&
        ankleW >= shoulderW * 0.8 &&
        ankleW <= shoulderW * 1.2
      ) {
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
  };

  const computeSimilarity = (current, reference) => {
    if (!current || !reference) return 0;

    const cur = Object.fromEntries(
      current.filter((k) => k.score > 0.4).map((k) => [k.name, k])
    );
    const ref = Object.fromEntries(
      reference.filter((k) => k.score > 0.4).map((k) => [k.name, k])
    );

    const ls = cur["left_shoulder"];
    const rs = cur["right_shoulder"];
    const lhs = cur["left_hip"];
    const rhs = cur["right_hip"];

    let scale = null;
    if (ls && rs) scale = dist(ls, rs);
    else if (lhs && rhs) scale = dist(lhs, rhs);
    if (!scale || scale === 0) scale = 100;

    let sum = 0;
    let cnt = 0;
    for (const n of names) {
      const a = cur[n];
      const b = ref[n];
      if (a && b) {
        sum += dist(a, b) / scale;
        cnt++;
      }
    }
    if (cnt === 0) return 0;
    const avg = sum / cnt;
    return Math.max(0, 100 - avg * 100);
  };

  const analyzePose = (keypoints, referencePose) => {
    const { issues, score, total } = checkRules(keypoints);
    const percent = Math.round((score / total) * 100);

    let status, rules;
    if (issues.length === 0) {
      status = `✅ Stance Acceptable (Rules Score: ${percent}%)`;
      rules = "";
    } else {
      status = `❌ Incorrect Stance (Rules Score: ${percent}%)`;
      rules = "Issues: " + issues.join(", ");
    }

    let referenceStatus = "No reference pose set";
    if (referencePose) {
      const sim = computeSimilarity(keypoints, referencePose);
      const refStatus =
        sim >= SIMILARITY_THRESHOLD ? "✅ Acceptable" : "❌ Too different";
      referenceStatus = `Reference similarity: ${sim.toFixed(1)}% ${refStatus}`;
    }

    return { status, rules, referenceStatus };
  };

  return { analyzePose, computeSimilarity };
};

export default PoseAnalyzer;
