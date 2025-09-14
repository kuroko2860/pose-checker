import { POSE_CATEGORIES, classifyPose } from "./poseCategories";
import { POSE_CONFIG } from "../utils/const";

// Capture filter configuration
export const CAPTURE_CONFIG = {
  CONFIDENCE_THRESHOLD: 15, // Minimum keypoints with score > POSE_CONFIG.CONFIDENT_SCORE
  ERROR_THRESHOLD: 70, // Rule score threshold (below this = bad pose)
  CAPTURE_COOLDOWN: 60, // Frames to wait before capturing another bad pose
  MAX_BAD_POSES: 10, // Maximum number of bad poses to keep
  STABILITY_FRAMES: 5, // Frames to wait for pose stability
  PREPARATION_FRAMES: 30, // Frames to wait after pose selection before capturing
};

export class CaptureFilter {
  constructor() {
    this.classificationHistory = [];
    this.lastCaptureFrame = 0;
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

    // 1. Confidence filter
    if (!this.passesConfidenceFilter(keypoints)) {
      return false;
    }

    // 2. Pose selection filter - only capture if a specific pose is selected
    if (!this.passesPoseSelectionFilter()) {
      return false;
    }

    // 3. Preparation filter - wait for user to be ready
    if (!this.passesPreparationFilter()) {
      return false;
    }

    // 4. Stability filter - only capture if pose is stable and not unknown
    if (!this.passesStabilityFilter(currentClassification)) {
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
    this.lastCaptureFrame = this.currentFrame;
    this.badPoseEventActive = true;
    return true;
  }

  // Confidence filter: only accept frames with enough keypoints
  passesConfidenceFilter(keypoints) {
    const visibleKeypoints = keypoints.filter(
      (k) => k.score > POSE_CONFIG.CONFIDENT_SCORE
    ).length;
    return visibleKeypoints >= CAPTURE_CONFIG.CONFIDENCE_THRESHOLD;
  }

  // Pose selection filter: only capture if a specific pose is selected
  passesPoseSelectionFilter() {
    return this.selectedPoseCategory !== null && this.selectedPoseCategory !== POSE_CATEGORIES.UNKNOWN;
  }

  // Preparation filter: wait for user to be ready after pose selection
  passesPreparationFilter() {
    if (!this.isPrepared) {
      const framesSinceSelection = this.currentFrame - this.poseSelectionFrame;
      this.isPrepared = framesSinceSelection >= CAPTURE_CONFIG.PREPARATION_FRAMES;
    }
    return this.isPrepared;
  }

  // Stability filter: only capture if pose is stable and not unknown
  passesStabilityFilter(currentClassification) {
    if (currentClassification === POSE_CATEGORIES.UNKNOWN) {
      return false;
    }

    // Update classification history
    this.updateClassificationHistory(currentClassification);

    // Check if pose is stable
    if (this.classificationHistory.length < CAPTURE_CONFIG.STABILITY_FRAMES) {
      return false;
    }

    // Check if the last few classifications are consistent
    const recent = this.classificationHistory.slice(-CAPTURE_CONFIG.STABILITY_FRAMES);
    const isStable = recent.every(classification => classification === currentClassification);
    
    return isStable;
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
    this.lastCaptureFrame = 0;
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
      lastCaptureFrame: this.lastCaptureFrame,
      framesSinceLastCapture: this.currentFrame - this.lastCaptureFrame,
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
