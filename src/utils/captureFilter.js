import { classifyPose } from "./poseCategories";
import { POSE_CONFIG } from "../utils/const";


// Capture filter configuration
export const CAPTURE_CONFIG = {
  CONFIDENCE_THRESHOLD: 10, // Minimum keypoints with score > POSE_CONFIG.CONFIDENT_SCORE
  STABILITY_FRAMES: 10, // Consecutive frames with same classification
  ERROR_THRESHOLD: 70, // Rule score threshold (below this = bad pose)
  CAPTURE_COOLDOWN: 30, // Frames to wait before capturing another bad pose
};

export class CaptureFilter {
  constructor() {
    this.classificationHistory = [];
    this.lastCaptureFrame = 0;
    this.currentFrame = 0;
    this.badPoseEventActive = false;
  }

  // Check if frame should be captured based on filters
  shouldCapture(keypoints, ruleScore) {
    this.currentFrame++;

    // 1. Confidence filter
    if (!this.passesConfidenceFilter(keypoints)) {
      return false;
    }

    // 2. Stability filter
    const currentClassification = classifyPose(keypoints);
    this.updateClassificationHistory(currentClassification);
    
    if (!this.passesStabilityFilter()) {
      return false;
    }

    // 3. Error trigger
    if (!this.passesErrorTrigger(ruleScore)) {
      return false;
    }

    // 4. Cooldown filter
    if (!this.passesCooldownFilter()) {
      return false;
    }

    // All filters passed - capture this frame
    this.lastCaptureFrame = this.currentFrame;
    this.badPoseEventActive = true;
    return true;
  }

  // Confidence filter: only accept frames with enough keypoints
  passesConfidenceFilter(keypoints) {
    const visibleKeypoints = keypoints.filter(k => k.score > POSE_CONFIG.CONFIDENT_SCORE).length;
    return visibleKeypoints >= CAPTURE_CONFIG.CONFIDENCE_THRESHOLD;
  }

  // Stability filter: require same classification for N consecutive frames
  passesStabilityFilter() {
    if (this.classificationHistory.length < CAPTURE_CONFIG.STABILITY_FRAMES) {
      return false;
    }

    const recentClassifications = this.classificationHistory.slice(-CAPTURE_CONFIG.STABILITY_FRAMES);
    const firstClassification = recentClassifications[0];
    
    return recentClassifications.every(classification => classification === firstClassification);
  }

  // Error trigger: only capture if rule score is below threshold
  passesErrorTrigger(ruleScore) {
    return ruleScore < CAPTURE_CONFIG.ERROR_THRESHOLD;
  }

  // Cooldown filter: avoid capturing too frequently
  passesCooldownFilter() {
    const framesSinceLastCapture = this.currentFrame - this.lastCaptureFrame;
    return framesSinceLastCapture >= CAPTURE_CONFIG.CAPTURE_COOLDOWN;
  }

  // Update classification history
  updateClassificationHistory(classification) {
    this.classificationHistory.push(classification);
    
    // Keep only recent history (2x stability frames for buffer)
    const maxHistory = CAPTURE_CONFIG.STABILITY_FRAMES * 2;
    if (this.classificationHistory.length > maxHistory) {
      this.classificationHistory = this.classificationHistory.slice(-maxHistory);
    }
  }

  // Reset the filter (useful when switching modes)
  reset() {
    this.classificationHistory = [];
    this.lastCaptureFrame = 0;
    this.currentFrame = 0;
    this.badPoseEventActive = false;
  }

  // Get current classification (most recent stable classification)
  getCurrentClassification() {
    if (this.classificationHistory.length === 0) return null;
    
    // Return the most common classification in recent history
    const recent = this.classificationHistory.slice(-CAPTURE_CONFIG.STABILITY_FRAMES);
    const counts = {};
    recent.forEach(classification => {
      counts[classification] = (counts[classification] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)[0];
  }

  // Get filter status for debugging
  getFilterStatus() {
    return {
      currentFrame: this.currentFrame,
      classificationHistory: this.classificationHistory.slice(-5), // Last 5
      lastCaptureFrame: this.lastCaptureFrame,
      framesSinceLastCapture: this.currentFrame - this.lastCaptureFrame,
      badPoseEventActive: this.badPoseEventActive,
      currentClassification: this.getCurrentClassification(),
      stabilityFrames: this.classificationHistory.length,
      isStable: this.passesStabilityFilter()
    };
  }
}

// Utility function to create a new capture filter
export const createCaptureFilter = () => {
  return new CaptureFilter();
};
