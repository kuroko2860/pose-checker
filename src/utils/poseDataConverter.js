import { names } from "./const";

/**
 * Converts server data format to application keypoint format
 * @param {Array} serverData - Array of person data from server
 * @returns {Array} Array of converted keypoint data for each person
 */
export const convertServerDataToKeypoints = (serverData) => {
  if (!Array.isArray(serverData)) {
    return [];
  }

  return serverData.map((person, personIndex) => {
    const keypoints2D = person.keypoints_2d || [];
    const keypoints3D = person.keypoints_3d || [];
    const bbox = person.bbox || [0, 0, 0, 0]; // [x1, y1, x2, y2] - top-left to bottom-right coordinates
    
    // Convert 2D keypoints to the expected format
    const convertedKeypoints = keypoints2D.map(([x, y], index) => {
      const name = names[index] || `keypoint_${index}`;
      const z = keypoints3D[index]?.[2] || 0;
      
      return {
        name,
        x,
        y,
        z,
        score: 1.0, // Default confidence score
        personIndex,
        trackId: person.track_id || personIndex.toString()
      };
    });

    return {
      keypoints: convertedKeypoints,
      keypoints3D: keypoints3D,
      bbox: bbox, // Keep original [x1, y1, x2, y2] format
      trackId: person.track_id || personIndex.toString(),
      analytics: person.analytics || {},
      personIndex
    };
  });
};

/**
 * Converts single person keypoints to the expected format
 * @param {Array} keypoints2D - 2D keypoints array
 * @param {Array} keypoints3D - 3D keypoints array (optional)
 * @param {string} trackId - Track ID for the person
 * @returns {Array} Converted keypoint data
 */
export const convertSinglePersonKeypoints = (keypoints2D, keypoints3D = [], trackId = "0") => {
  if (!Array.isArray(keypoints2D)) {
    return [];
  }

  return keypoints2D.map(([x, y], index) => {
    const name = names[index] || `keypoint_${index}`;
    const z = keypoints3D[index]?.[2] || 0;
    
    return {
      name,
      x,
      y,
      z,
      score: 1.0, // Default confidence score
      trackId
    };
  });
};

/**
 * Analyzes multiple people and returns combined results
 * @param {Array} peopleData - Array of person data with keypoints
 * @param {Function} analyzePose - Pose analysis function
 * @param {string} selectedPoseCategory - Selected pose category
 * @returns {Object} Combined analysis results
 */
export const analyzeMultiplePeople = (peopleData, analyzePose, selectedPoseCategory = null) => {
  if (!Array.isArray(peopleData) || peopleData.length === 0) {
    return {
      status: "No people detected",
      rules: "",
      people: [],
      totalPeople: 0
    };
  }

  const peopleAnalyses = peopleData.map((person, index) => {
    const analysis = analyzePose(person.keypoints, selectedPoseCategory);
    return {
      personIndex: index,
      trackId: person.trackId,
      ...analysis
    };
  });

  // Calculate overall status
  const totalPeople = peopleAnalyses.length;
  const peopleWithGoodPoses = peopleAnalyses.filter(p => p.score >= 70).length;
  const averageScore = peopleAnalyses.reduce((sum, p) => sum + p.score, 0) / totalPeople;

  let overallStatus;
  if (peopleWithGoodPoses === totalPeople) {
    overallStatus = `All ${totalPeople} people have good poses (avg: ${Math.round(averageScore)}%)`;
  } else if (peopleWithGoodPoses > 0) {
    overallStatus = `${peopleWithGoodPoses}/${totalPeople} people have good poses (avg: ${Math.round(averageScore)}%)`;
  } else {
    overallStatus = `All ${totalPeople} people need pose corrections (avg: ${Math.round(averageScore)}%)`;
  }

  return {
    status: overallStatus,
    rules: peopleAnalyses.map(p => `Person ${p.personIndex + 1}: ${p.rules || 'Good pose'}`).join('; '),
    people: peopleAnalyses,
    totalPeople,
    averageScore: Math.round(averageScore)
  };
};
