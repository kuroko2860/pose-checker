// Martial Art Pose Categories
export const MARTIAL_ART_POSES = {
  STANCE: {
    id: "stance",
    name: "fightingStance",
    description: "fightingStanceDesc",
    rules: [
      "Feet shoulder-width apart",
      "Front foot pointing forward, back foot at 45 degrees",
      "Knees slightly bent",
      "Hands up in guard position",
      "Weight evenly distributed"
    ]
  },
  PUNCH: {
    id: "punch",
    name: "punchTechnique",
    description: "punchTechniqueDesc",
    rules: [
      "Fist clenched tightly",
      "Elbow slightly bent at impact",
      "Hip rotation for power",
      "Opposite hand in guard position",
      "Follow through with the punch"
    ]
  },
  BLOCK: {
    id: "block",
    name: "defensiveBlock",
    description: "defensiveBlockDesc",
    rules: [
      "Arm positioned to intercept attack",
      "Elbow bent at appropriate angle",
      "Body slightly turned for protection",
      "Other hand ready for counter",
      "Maintain balance and stability"
    ]
  }
};

// Mock pose analysis for martial art poses
export const analyzeMartialArtPose = (keypoints, poseType, isDefender = false) => {
  if (!keypoints || keypoints.length === 0) {
    return {
      score: 0,
      status: "No pose detected",
      rules: "Please ensure you are visible in the camera",
      detectedCategory: null
    };
  }

  // Mock analysis based on pose type
  let score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  let status = "Good form";
  let rules = "";

  switch (poseType) {
    case MARTIAL_ART_POSES.STANCE.id:
      if (score >= 80) {
        status = "Excellent stance";
        rules = "Perfect fighting stance maintained";
      } else if (score >= 70) {
        status = "Good stance";
        rules = "Minor adjustments needed for foot positioning";
      } else {
        status = "Needs improvement";
        rules = "Focus on foot positioning and guard placement";
      }
      break;

    case MARTIAL_ART_POSES.PUNCH.id:
      if (score >= 85) {
        status = "Powerful punch";
        rules = "Excellent form with good hip rotation";
      } else if (score >= 75) {
        status = "Good punch";
        rules = "Work on follow-through and hip engagement";
      } else {
        status = "Needs work";
        rules = "Focus on proper fist formation and hip rotation";
      }
      break;

    case MARTIAL_ART_POSES.BLOCK.id:
      if (score >= 80) {
        status = "Solid block";
        rules = "Well-positioned defensive technique";
      } else if (score >= 70) {
        status = "Decent block";
        rules = "Improve arm positioning and body alignment";
      } else {
        status = "Weak block";
        rules = "Focus on proper arm angle and body protection";
      }
      break;

    default:
      status = "Unknown pose";
      rules = "Please select a martial art pose type";
  }

  // Add defender-specific feedback
  if (isDefender) {
    status = `Defender: ${status}`;
    rules = `Defensive focus: ${rules}`;
  }

  return {
    score,
    status,
    rules,
    detectedCategory: poseType
  };
};

// Get all martial art pose types
export const getMartialArtPoseTypes = () => {
  return Object.values(MARTIAL_ART_POSES);
};

// Get pose type by ID
export const getMartialArtPoseById = (id) => {
  return Object.values(MARTIAL_ART_POSES).find(pose => pose.id === id);
};
