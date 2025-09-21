export const names = [
  "nose",           // 0
  "left_eye",       // 1
  "right_eye",      // 2
  "left_ear",       // 3
  "right_ear",      // 4
  "left_shoulder",  // 5
  "right_shoulder", // 6
  "left_elbow",     // 7
  "right_elbow",    // 8
  "left_wrist",     // 9
  "right_wrist",    // 10
  "left_hip",       // 11
  "right_hip",      // 12
  "left_knee",      // 13
  "right_knee",     // 14
  "left_ankle",     // 15
  "right_ankle",    // 16
];

export const edges = [
  // Face connections
  ["left_eye", "right_eye"],
  ["left_eye", "nose"],
  ["right_eye", "nose"],
  ["left_ear", "left_eye"],
  ["right_ear", "right_eye"],
  
  // Torso connections
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  
  // Left arm
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  
  // Right arm
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  
  // Left leg
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  
  // Right leg
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

export const POSE_CONFIG = {
  CONFIDENT_SCORE: 0.5,
  CONFIDENT_TRACKING_SCORE: 0.4
}