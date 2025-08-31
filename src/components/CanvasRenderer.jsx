import { edges } from "../utils/const";
import { POSE_CONFIG } from "../utils/const";

const CanvasRenderer = () => {
  const drawKeypoints = (ctx, keypoints) => {
    keypoints.forEach((kp) => {
      if (kp.score > POSE_CONFIG.CONFIDENT_SCORE) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "lime";
        ctx.fill();
      }
    });

    // Draw skeleton lines
    const getByName = (n) =>
      keypoints.find(
        (k) => k.name === n && k.score > POSE_CONFIG.CONFIDENT_SCORE
      );
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

  const renderPose = (canvasRef, videoRef, keypoints) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    // Clear the entire canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw the pose keypoints and skeleton
    drawKeypoints(ctx, keypoints);
  };

  const renderImage = (canvasRef, imageElement, keypoints) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match image
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

    // Draw the pose keypoints and skeleton
    drawKeypoints(ctx, keypoints);
  };

  return { renderPose, renderImage };
};

export default CanvasRenderer;
