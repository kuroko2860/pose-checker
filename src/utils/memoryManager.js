import * as tf from "@tensorflow/tfjs";

// Memory management utilities for TensorFlow.js
export const memoryManager = {
  // Force garbage collection of tensors
  cleanup: () => {
    try {
      // Dispose of any tensors that might be lingering
      tf.tidy(() => {
        // This will automatically dispose of any tensors created within this scope
      });
      
      // Force garbage collection if available (Chrome DevTools)
      if (window.gc) {
        window.gc();
      }
    } catch (error) {
      console.warn("Memory cleanup error:", error);
    }
  },

  // Get current memory usage (for debugging)
  getMemoryInfo: () => {
    try {
      return tf.memory();
    } catch (error) {
      console.warn("Could not get memory info:", error);
      return null;
    }
  },

  // Monitor memory usage
  startMemoryMonitoring: (intervalMs = 5000) => {
    const interval = setInterval(() => {
      const memoryInfo = memoryManager.getMemoryInfo();
      if (memoryInfo) {
        console.log("TensorFlow.js Memory:", memoryInfo);
        
        // Warn if memory usage is high
        if (memoryInfo.numTensors > 1000) {
          console.warn("High tensor count detected:", memoryInfo.numTensors);
          memoryManager.cleanup();
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
};

// Hook to manage TensorFlow.js memory
export const useTensorFlowMemory = () => {
  const cleanup = () => {
    memoryManager.cleanup();
  };

  const getMemoryInfo = () => {
    return memoryManager.getMemoryInfo();
  };

  return { cleanup, getMemoryInfo };
};
