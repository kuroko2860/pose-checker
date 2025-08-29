let detector, video, canvas, ctx;
let referencePose = null;
const SIMILARITY_THRESHOLD = 85; // %
let mode = "webcam"; // "webcam" or "image"

async function init() {
  video = document.getElementById("video");
  canvas = document.getElementById("output");
  ctx = canvas.getContext("2d");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  video.srcObject = stream;
  await new Promise((r) => (video.onloadedmetadata = r));

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.THUNDER,
      enableSmoothing: true,
    }
  );

  requestAnimationFrame(runFrame);
}

function drawKeypoints(keypoints) {
  keypoints.forEach((kp) => {
    if (kp.score > 0.4) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "lime";
      ctx.fill();
    }
  });

  // basic skeleton lines
  const edges = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];
  const byName = (n) => keypoints.find((k) => k.name === n && k.score > 0.4);
  ctx.strokeStyle = "#00e676";
  ctx.lineWidth = 2;
  edges.forEach(([a, b]) => {
    const p = byName(a),
      q = byName(b);
    if (p && q) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
  });
}

// Helpers
const byName = (kps, name) =>
  kps.find((k) => k.name === name && k.score > 0.4) || null;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function angleAt(b, a, c) {
  // angle ABC in degrees
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const d = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y),
    m2 = Math.hypot(v2.x, v2.y);
  if (m1 === 0 || m2 === 0) return null;
  const cos = Math.max(-1, Math.min(1, d / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Rule-based checks with scoring and issue list
function checkRules(keypoints) {
  const issues = [];
  let score = 0,
    total = 0;

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

  // Torso forward lean: angle at hip (Shoulder–Hip–Knee) < 175° (not fully upright)
  total++;
  if (LS && LH && LK) {
    const torso = angleAt(LH, LS, LK);
    if (torso !== null && torso < 175) score++;
    else issues.push("Torso too upright (lean slightly forward)");
  } else issues.push("Torso landmarks not clear");

  // Arms: front arm ~150–170°, rear arm ~90–120° (assuming left = front, right = rear)
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

  // Head tilt < ~15° (compare ear height difference vs shoulder tilt)
  total++;
  if (LEar && REar && LS && RS) {
    const earDiff = Math.abs(LEar.y - REar.y);
    const shoulderDiff = Math.abs(LS.y - RS.y);
    if (earDiff <= Math.max(10, shoulderDiff * 0.3)) score++;
    else issues.push("Head tilted too much");
  } else issues.push("Head landmarks not clear");

  return { issues, score, total };
}

// Reference-pose similarity (normalized by shoulder width or hip width)
function computeSimilarity(current, reference) {
  if (!current || !reference) return 0;
  const names = [
    "left_shoulder",
    "right_shoulder",
    "left_elbow",
    "right_elbow",
    "left_wrist",
    "right_wrist",
    "left_hip",
    "right_hip",
    "left_knee",
    "right_knee",
    "left_ankle",
    "right_ankle",
    "left_ear",
    "right_ear",
    "nose",
  ];
  const cur = Object.fromEntries(
    current.filter((k) => k.score > 0.4).map((k) => [k.name, k])
  );
  const ref = Object.fromEntries(
    reference.filter((k) => k.score > 0.4).map((k) => [k.name, k])
  );
  const ls = cur["left_shoulder"],
    rs = cur["right_shoulder"];
  const lhs = cur["left_hip"],
    rhs = cur["right_hip"];
  let scale = null;
  if (ls && rs) scale = dist(ls, rs);
  else if (lhs && rhs) scale = dist(lhs, rhs);
  if (!scale || scale === 0) scale = 100; // fallback

  let sum = 0,
    cnt = 0;
  for (const n of names) {
    const a = cur[n],
      b = ref[n];
    if (a && b) {
      sum += dist(a, b) / scale;
      cnt++;
    }
  }
  if (cnt === 0) return 0;
  const avg = sum / cnt; // smaller is better
  const score = Math.max(0, 100 - avg * 100); // simple mapping
  return score;
}

async function runFrame() {
  if (mode === "image") return;
  const poses = await detector.estimatePoses(video);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const keypoints = poses[0].keypoints;
    drawKeypoints(keypoints);

    // Rule-based evaluation
    const { issues, score, total } = checkRules(keypoints);
    const percent = Math.round((score / total) * 100);
    const statusEl = document.getElementById("status");
    const rulesDiv = document.getElementById("rules");

    if (issues.length === 0) {
      statusEl.textContent = `✅ Stance Acceptable (Rules Score: ${percent}%)`;
      rulesDiv.textContent = "";
    } else {
      statusEl.textContent = `❌ Incorrect Stance (Rules Score: ${percent}%)`;
      rulesDiv.textContent = "Issues: " + issues.join(", ");
    }

    // Reference-based evaluation
    if (referencePose) {
      const sim = computeSimilarity(keypoints, referencePose);
      const refStatus =
        sim >= SIMILARITY_THRESHOLD ? "✅ Acceptable" : "❌ Too different";
      document.getElementById(
        "referenceStatus"
      ).textContent = `Reference similarity: ${sim.toFixed(1)}% ${refStatus}`;
    }
  } else {
    document.getElementById("status").textContent = "No person detected";
    document.getElementById("rules").textContent = "";
  }

  requestAnimationFrame(runFrame);
}

document.getElementById("toggleMode").addEventListener("click", () => {
  if (mode === "webcam") {
    isRunning = false;
    video.srcObject.getTracks().forEach((t) => t.stop());
    video.style.display = "none";
    mode = "image";
    document.getElementById("toggleMode").textContent = "Switch to Webcam Mode";
    document.getElementById("status").textContent =
      "Upload an image to analyze";
  } else {
    init();
    video.style.display = "none"; // keep hidden since we draw on canvas
    mode = "webcam";
    document.getElementById("toggleMode").textContent =
      "Switch to Image Upload Mode";
    document.getElementById("status").textContent = "Loading webcam...";
    isRunning = true;
    runFrame();
  }
});

document.getElementById("setReference").onclick = async () => {
  const poses = await detector.estimatePoses(video);
  if (poses.length > 0) {
    referencePose = poses[0].keypoints.map((k) => ({ ...k }));
    document.getElementById("referenceStatus").textContent =
      "Reference pose set";
  }
};

// Handle uploaded image
document.getElementById("uploadImage").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = async () => {
    // Resize canvas to image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Estimate pose on uploaded image
    const poses = await detector.estimatePoses(img);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      drawKeypoints(keypoints);

      // Rule-based evaluation
      const { issues, score, total } = checkRules(keypoints);
      const percent = Math.round((score / total) * 100);
      const statusEl = document.getElementById("status");
      const rulesDiv = document.getElementById("rules");

      if (issues.length === 0) {
        statusEl.textContent = `✅ Stance Acceptable (Rules Score: ${percent}%)`;
        rulesDiv.textContent = "";
      } else {
        statusEl.textContent = `❌ Incorrect Stance (Rules Score: ${percent}%)`;
        rulesDiv.textContent = "Issues: " + issues.join(", ");
      }

      // Reference-based evaluation
      if (referencePose) {
        const sim = computeSimilarity(keypoints, referencePose);
        const refStatus =
          sim >= SIMILARITY_THRESHOLD ? "✅ Acceptable" : "❌ Too different";
        document.getElementById(
          "referenceStatus"
        ).textContent = `Reference similarity: ${sim.toFixed(1)}% ${refStatus}`;
      }
    } else {
      document.getElementById("status").textContent =
        "No person detected in uploaded image";
      document.getElementById("rules").textContent = "";
    }
  };
  img.src = URL.createObjectURL(file);
});

init();
