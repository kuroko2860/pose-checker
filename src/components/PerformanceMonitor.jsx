import { useState, useEffect } from "react";
import { memoryManager } from "../utils/memoryManager";

const PerformanceMonitor = ({ isVisible = false }) => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [_, setLastTime] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        setFrameCount(frameCount);
        setLastTime(currentTime);
        frameCount = 0;
      }
    };

    const interval = setInterval(() => {
      const info = memoryManager.getMemoryInfo();
      setMemoryInfo(info);
    }, 1000);

    // Update FPS every frame
    const fpsInterval = setInterval(updateFPS, 16); // ~60fps

    return () => {
      clearInterval(interval);
      clearInterval(fpsInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>FPS: {fps}</div>
      <div>Frames: {frameCount}</div>
      {memoryInfo && (
        <>
          <div>Tensors: {memoryInfo.numTensors}</div>
          <div>Bytes: {(memoryInfo.numBytes / 1024 / 1024).toFixed(2)} MB</div>
        </>
      )}
    </div>
  );
};

export default PerformanceMonitor;
