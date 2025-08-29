import React, { useState, useRef, useEffect, useCallback } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

const ShootingStanceChecker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [detector, setDetector] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [rules, setRules] = useState("");
  const [referenceStatus, setReferenceStatus] = useState(
    "No reference pose set"
  );
  const [mode, setMode] = useState("webcam");
  const [referencePose, setReferencePose] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const SIMILARITY_THRESHOLD = 85;

  // Helper functions
  const byName = (kps, name) =>
    kps.find((k) => k.name === name && k.score > 0.4) || null;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const angleAt = (b, a, c) => {
    if (!a || !b || !c) return null;
    const v1 = { x: a.x - b.x, y: a.y - b.y };
    const v2 = { x: c.x - b.x, y: c.y - b.y };
    const d = v1.x * v2.x + v1.y * v2.y;
    const m1 = Math.hypot(v1.x, v1.y);
    const m2 = Math.hypot(v2.x, v2.y);
    if (m1 === 0 || m2 === 0) return null;
    const cos = Math.max(-1, Math.min(1, d / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  };

  const drawKeypoints = (ctx, keypoints) => {
    keypoints.forEach((kp) => {
      if (kp.score > 0.4) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      }
    });

    // Draw skeleton lines
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

    const getByName = (n) =>
      keypoints.find((k) => k.name === n && k.score > 0.4);
    ctx.strokeStyle = "#00e676";
    ctx.lineWidth = 2;

    edges.forEach(([a, b]) => {
      const p = getByName(a);
      const q = getByName(b);
      if (p && q) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    });
  };

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

  const analyzeImage = async (imageElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

    const poses = await detector.estimatePoses(imageElement);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      drawKeypoints(ctx, keypoints);

      const { issues, score, total } = checkRules(keypoints);
      const percent = Math.round((score / total) * 100);

      if (issues.length === 0) {
        setStatus(`✅ Stance Acceptable (Rules Score: ${percent}%)`);
        setRules("");
      } else {
        setStatus(`❌ Incorrect Stance (Rules Score: ${percent}%)`);
        setRules("Issues: " + issues.join(", "));
      }

      if (referencePose) {
        const sim = computeSimilarity(keypoints, referencePose);
        const refStatus =
          sim >= SIMILARITY_THRESHOLD ? "✅ Acceptable" : "❌ Too different";
        setReferenceStatus(
          `Reference similarity: ${sim.toFixed(1)}% ${refStatus}`
        );
      }
    } else {
      setStatus("No person detected in uploaded image");
      setRules("");
    }
  };

  const runFrame = useCallback(async () => {
    if (mode === "image" || !detector || !videoRef.current || !isRunning)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const poses = await detector.estimatePoses(video);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      drawKeypoints(ctx, keypoints);

      const { issues, score, total } = checkRules(keypoints);
      const percent = Math.round((score / total) * 100);

      if (issues.length === 0) {
        setStatus(`✅ Stance Acceptable (Rules Score: ${percent}%)`);
        setRules("");
      } else {
        setStatus(`❌ Incorrect Stance (Rules Score: ${percent}%)`);
        setRules("Issues: " + issues.join(", "));
      }

      if (referencePose) {
        const sim = computeSimilarity(keypoints, referencePose);
        const refStatus =
          sim >= SIMILARITY_THRESHOLD ? "✅ Acceptable" : "❌ Too different";
        setReferenceStatus(
          `Reference similarity: ${sim.toFixed(1)}% ${refStatus}`
        );
      }
    } else {
      setStatus("No person detected");
      setRules("");
    }

    if (isRunning) {
      requestAnimationFrame(runFrame);
    }
  }, [detector, mode, referencePose, isRunning]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setIsRunning(true);
    } catch (error) {
      setStatus("Error accessing camera: " + error.message);
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsRunning(false);
  };

  const initPoseDetector = async () => {
    try {
      await tf.ready();
      const det = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.THUNDER,
          enableSmoothing: true,
        }
      );
      setDetector(det);
      setStatus("Model loaded");
    } catch (error) {
      setStatus("Error loading pose detection model: " + error.message);
    }
  };

  useEffect(() => {
    initPoseDetector();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (detector && mode === "webcam") {
      initCamera();
    }
  }, [detector, mode]);

  useEffect(() => {
    if (isRunning && detector) {
      runFrame();
    }
  }, [isRunning, detector, runFrame]);

  const toggleMode = () => {
    if (mode === "webcam") {
      stopCamera();
      setMode("image");
      setStatus("Upload an image to analyze");
    } else {
      setMode("webcam");
      setStatus("Loading webcam...");
      if (detector) {
        initCamera();
      }
    }
  };

  const setReference = async () => {
    if (!detector || mode === "image") return;

    const poses = await detector.estimatePoses(videoRef.current);
    if (poses.length > 0) {
      setReferencePose(poses[0].keypoints.map((k) => ({ ...k })));
      setReferenceStatus("Reference pose set");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => analyzeImage(img);
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-400">
        Shotgun Stance Checker
      </h2>

      <div className="flex flex-col items-center space-y-4">
        <video ref={videoRef} autoPlay playsInline className="hidden" />

        <canvas
          ref={canvasRef}
          className="border-2 border-green-400 rounded-lg max-w-full h-auto"
        />

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={setReference}
            disabled={mode === "image"}
            className={`px-4 py-2 rounded-lg font-semibold ${
              mode === "image"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Set Reference Pose
          </button>

          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            {mode === "webcam"
              ? "Switch to Image Upload Mode"
              : "Switch to Webcam Mode"}
          </button>
        </div>

        {mode === "image" && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        )}

        <div className="text-center space-y-2">
          <div
            className={`text-lg font-semibold ${
              status.includes("✅")
                ? "text-green-400"
                : status.includes("❌")
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {status}
          </div>

          {rules && (
            <div className="text-red-400 text-sm max-w-2xl">{rules}</div>
          )}

          <div
            className={`text-sm ${
              referenceStatus.includes("✅")
                ? "text-green-400"
                : referenceStatus.includes("❌")
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {referenceStatus}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShootingStanceChecker;
