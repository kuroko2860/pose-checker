import { edges, names } from "../utils/const";

const CanvasRenderer = () => {
  // Color palette for different people
  const personColors = [
    "#00e676", // lime green
    "#ff6b6b", // red
    "#4ecdc4", // teal
    "#45b7d1", // blue
    "#f9ca24", // yellow
    "#f0932b", // orange
    "#eb4d4b", // dark red
    "#6c5ce7", // purple
  ];

  const drawKeypoints = (ctx, keypoints, personIndex = 0) => {
    if (!keypoints || keypoints.length === 0) return;

    const color = personColors[personIndex % personColors.length];

    // Batch drawing operations for better performance
    ctx.fillStyle = color;
    ctx.beginPath();

    // Handle both new format [x, y] arrays and old format {x, y, name} objects
    keypoints.forEach((kp, index) => {
      let x, y;
      if (Array.isArray(kp)) {
        // New format: [x, y]
        [x, y] = kp;
      } else {
        // Old format: {x, y, name}
        x = kp.x;
        y = kp.y;
      }

      // Skip invalid keypoints
      if (isNaN(x) || isNaN(y) || x < 0 || y < 0) return;

      ctx.moveTo(x + 4, y);
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
    });

    ctx.fill();

    // Draw skeleton lines
    const getByIndex = (index) => {
      const kp = keypoints[index];
      if (Array.isArray(kp)) {
        return { x: kp[0], y: kp[1] };
      } else {
        return kp;
      }
    };

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Batch skeleton line drawing for better performance
    ctx.beginPath();
    let hasValidLines = false;

    edges.forEach(([a, b]) => {
      // Get keypoint indices from names
      const aIndex = names.indexOf(a);
      const bIndex = names.indexOf(b);

      if (
        aIndex !== -1 &&
        bIndex !== -1 &&
        keypoints[aIndex] &&
        keypoints[bIndex]
      ) {
        const p = getByIndex(aIndex);
        const q = getByIndex(bIndex);

        // Skip invalid points
        if (
          p &&
          q &&
          !isNaN(p.x) &&
          !isNaN(p.y) &&
          !isNaN(q.x) &&
          !isNaN(q.y)
        ) {
          if (!hasValidLines) {
            ctx.moveTo(p.x, p.y);
            hasValidLines = true;
          } else {
            ctx.moveTo(p.x, p.y);
          }
          ctx.lineTo(q.x, q.y);
        }
      }
    });

    if (hasValidLines) {
      ctx.stroke();
    }
  };

  const drawBoundingBox = (ctx, bbox, personIndex = 0, trackId = "0") => {
    const color = personColors[personIndex % personColors.length];

    // Handle [x1, y1, x2, y2] format (top-left to bottom-right coordinates)
    let x, y, width, height;
    if (Array.isArray(bbox)) {
      // [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = bbox;
      x = x1;
      y = y1;
      width = x2 - x1;
      height = y2 - y1;
    } else {
      // Legacy object format {x, y, width, height}
      ({ x, y, width, height } = bbox);
    }

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    const labelText = `Person ${personIndex + 1} (ID: ${trackId})`;
    ctx.font = "14px Arial";
    ctx.fillStyle = color;
    const textMetrics = ctx.measureText(labelText);
    const labelWidth = textMetrics.width + 10;
    const labelHeight = 20;

    // Draw label background rectangle
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);

    // Draw label text
    ctx.fillStyle = color;
    ctx.fillText(labelText, x + 5, y - 5);
  };

  const renderPose = (canvasRef, videoRef, keypoints) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    // Clear the entire canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Handle different keypoint formats
    if (Array.isArray(keypoints) && keypoints.length > 0) {
      // Check if it's multi-person format
      if (keypoints[0].keypoints_2d) {
        // Server data format (keypoints_2d) - convert [x,y] arrays to {x,y} objects
        keypoints.forEach((person, index) => {
          if (person.keypoints_2d && person.keypoints_2d.length > 0) {
            // Convert [x,y] arrays to {x,y} objects for drawKeypoints
            const convertedKeypoints = person.keypoints_2d.map(
              ([x, y], kpIndex) => ({
                x,
                y,
                name: `keypoint_${kpIndex}`,
                score: 1.0,
              })
            );
            drawKeypoints(ctx, convertedKeypoints, index);
            // Draw bounding box if available
            if (person.bbox) {
              drawBoundingBox(ctx, person.bbox, index, person.track_id);
            }
          }
        });
      } else if (keypoints[0].keypoints) {
        // Interpolated/converted data format (keypoints)
        keypoints.forEach((person, index) => {
          if (person.keypoints && person.keypoints.length > 0) {
            drawKeypoints(ctx, person.keypoints, index);
            // Draw bounding box if available
            if (person.bbox) {
              drawBoundingBox(ctx, person.bbox, index, person.trackId);
            }
          }
        });
      } else {
        // Single person format (direct array of keypoint objects)
        drawKeypoints(ctx, keypoints, 0);
      }
    }
  };

  const renderImage = (canvasRef, imageElement, result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match image natural size
    const imageWidth = imageElement.naturalWidth || imageElement.width;
    const imageHeight = imageElement.naturalHeight || imageElement.height;
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(imageElement, 0, 0, imageWidth, imageHeight);

    // Draw the pose keypoints and skeleton for each person
    if (Array.isArray(result)) {
      result.forEach((person, index) => {
        // Handle both raw server data format and converted data format
        let keypoints, bbox, trackId;

        if (person.keypoints_2d) {
          // Raw server data format - convert [x,y] arrays to {x,y} objects
          keypoints = person.keypoints_2d.map(([x, y], kpIndex) => ({
            x,
            y,
            name: `keypoint_${kpIndex}`,
            score: 1.0,
          }));
          bbox = person.bbox;
          trackId = person.track_id;
        } else if (person.keypoints) {
          // Converted data format
          keypoints = person.keypoints;
          bbox = person.bbox;
          trackId = person.trackId;
        }

        if (keypoints && keypoints.length > 0) {
          drawKeypoints(ctx, keypoints, index);
          // Draw bounding box if available
          if (bbox) {
            drawBoundingBox(ctx, bbox, index, trackId);
          }
        }
      });
    }
  };

  return { renderPose, renderImage };
};

export default CanvasRenderer;
