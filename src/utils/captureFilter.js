import { POSE_CATEGORIES, classifyPose } from "./poseCategories";
import { POSE_CONFIG } from "../utils/const";

// Capture filter configuration
export const CAPTURE_CONFIG = {
  CONFIDENCE_THRESHOLD: 15, // Minimum keypoints with score > POSE_CONFIG.CONFIDENT_SCORE
  ERROR_THRESHOLD: 70, // Rule score threshold (below this = bad pose)
  CAPTURE_COOLDOWN_MS: 1000, // Milliseconds to wait before capturing another bad pose (1 second)
  MAX_BAD_POSES: 10, // Maximum number of bad poses to keep
  STABILITY_FRAMES: 5, // Frames to wait for pose stability
  PREPARATION_FRAMES: 30, // Frames to wait after pose selection before capturing
};

export class CaptureFilter {
  constructor() {
    this.classificationHistory = [];
    this.lastCaptureTime = 0;
    this.currentFrame = 0;
    this.badPoseEventActive = false;
    this.selectedPoseCategory = null;
    this.poseSelectionFrame = 0;
    this.capturedBadPoses = [];
    this.isPrepared = false;
  }

  // Check if frame should be captured based on filters
  shouldCapture(keypoints, ruleScore, currentClassification) {
    this.currentFrame++;

    // 2. Pose selection filter - only capture if a specific pose is selected
    if (!this.passesPoseSelectionFilter(currentClassification)) {
      return false;
    }

    // 5. Error trigger - only capture bad poses
    if (!this.passesErrorTrigger(ruleScore)) {
      return false;
    }

    // 6. Cooldown filter
    if (!this.passesCooldownFilter()) {
      return false;
    }

    // All filters passed - capture this frame
    this.lastCaptureTime = Date.now();
    this.badPoseEventActive = true;
    return true;
  }

  // Pose selection filter: only capture if a specific pose is selected
  passesPoseSelectionFilter(currentClassification) {
    return currentClassification !== null && currentClassification !== POSE_CATEGORIES.UNKNOWN;
  }

  // Preparation filter: wait for user to be ready after pose selection
  passesPreparationFilter() {
    if (!this.isPrepared) {
      const framesSinceSelection = this.currentFrame - this.poseSelectionFrame;
      this.isPrepared = framesSinceSelection >= CAPTURE_CONFIG.PREPARATION_FRAMES;
    }
    return this.isPrepared;
  }

  // Error trigger: only capture if rule score is below threshold
  passesErrorTrigger(ruleScore) {
    return ruleScore < CAPTURE_CONFIG.ERROR_THRESHOLD;
  }

  // Cooldown filter: avoid capturing too frequently (1 second)
  passesCooldownFilter() {
    const timeSinceLastCapture = Date.now() - this.lastCaptureTime;
    return timeSinceLastCapture >= CAPTURE_CONFIG.CAPTURE_COOLDOWN_MS;
  }

  // Update classification history
  updateClassificationHistory(classification) {
    this.classificationHistory.push(classification);

    // Keep only recent history (2x stability frames for buffer)
    const maxHistory = CAPTURE_CONFIG.STABILITY_FRAMES * 2;
    if (this.classificationHistory.length > maxHistory) {
      this.classificationHistory = this.classificationHistory.slice(
        -maxHistory
      );
    }
  }

  // Set the selected pose category
  setSelectedPoseCategory(poseCategory) {
    this.selectedPoseCategory = poseCategory;
    this.poseSelectionFrame = this.currentFrame;
    this.isPrepared = false; // Reset preparation status
    this.classificationHistory = []; // Reset classification history
  }

  // Add a captured bad pose to the collection
  addCapturedBadPose(poseData) {
    this.capturedBadPoses.push({
      ...poseData,
      timestamp: Date.now(),
      frame: this.currentFrame
    });

    // Keep only the last MAX_BAD_POSES
    if (this.capturedBadPoses.length > CAPTURE_CONFIG.MAX_BAD_POSES) {
      this.capturedBadPoses = this.capturedBadPoses.slice(-CAPTURE_CONFIG.MAX_BAD_POSES);
    }
  }

  // Get captured bad poses
  getCapturedBadPoses() {
    return this.capturedBadPoses;
  }

  // Clear captured bad poses
  clearCapturedBadPoses() {
    this.capturedBadPoses = [];
  }

  // Reset the filter (useful when switching modes)
  reset() {
    this.classificationHistory = [];
    this.lastCaptureTime = 0;
    this.currentFrame = 0;
    this.badPoseEventActive = false;
    this.selectedPoseCategory = null;
    this.poseSelectionFrame = 0;
    this.isPrepared = false;
    // Note: Don't reset capturedBadPoses here - keep them for user review
  }

  // Get current classification (most recent stable classification)
  getCurrentClassification() {
    if (this.classificationHistory.length === 0) return null;

    // Return the most common classification in recent history
    const recent = this.classificationHistory.slice(
      -CAPTURE_CONFIG.STABILITY_FRAMES
    );
    const counts = {};
    recent.forEach((classification) => {
      counts[classification] = (counts[classification] || 0) + 1;
    });

    return Object.entries(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    )[0];
  }

  // Get filter status for debugging
  getFilterStatus() {
    return {
      currentFrame: this.currentFrame,
      classificationHistory: this.classificationHistory.slice(-5), // Last 5
      lastCaptureTime: this.lastCaptureTime,
      timeSinceLastCapture: Date.now() - this.lastCaptureTime,
      badPoseEventActive: this.badPoseEventActive,
      currentClassification: this.getCurrentClassification(),
      stabilityFrames: this.classificationHistory.length,
      selectedPoseCategory: this.selectedPoseCategory,
      isPrepared: this.isPrepared,
      framesSinceSelection: this.currentFrame - this.poseSelectionFrame,
      capturedBadPosesCount: this.capturedBadPoses.length,
      maxBadPoses: CAPTURE_CONFIG.MAX_BAD_POSES,
    };
  }
}

// Utility function to create a new capture filter
export const createCaptureFilter = () => {
  return new CaptureFilter();
};
