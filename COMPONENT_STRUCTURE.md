# Component Structure Documentation

The Shooting Stance Checker has been refactored into smaller, more manageable components for better maintainability and reusability.

## Component Overview

### Main Components

1. **ShootingStanceChecker** (`Shooting.jsx`)

   - Main component that orchestrates all other components
   - Uses the `usePoseDetection` custom hook for state management
   - Renders the UI layout and coordinates between components

2. **PoseDetector** (`PoseDetector.jsx`)

   - Handles TensorFlow.js and pose detection model initialization
   - Manages model loading and error handling
   - Invisible component that provides detector functionality

3. **CameraController** (`CameraController.jsx`)

   - Manages webcam access and video stream
   - Handles camera initialization, cleanup, and error handling
   - Invisible component that provides camera functionality

4. **CanvasRenderer** (`CanvasRenderer.jsx`)

   - Handles drawing keypoints and skeleton on canvas
   - Provides functions for rendering poses from video and images
   - Utility component with rendering functions

5. **PoseAnalyzer** (`PoseAnalyzer.jsx`)

   - Contains all pose analysis logic and rule checking
   - Handles similarity computation between poses
   - Provides functions for analyzing stance correctness

6. **StatusDisplay** (`StatusDisplay.jsx`)

   - Displays status messages, rules feedback
   - Handles color coding for different status types
   - Pure presentation component

7. **ControlPanel** (`ControlPanel.jsx`)
   - Contains all control buttons and mode switching
   - Handles file upload for image mode
   - Pure presentation component

### Custom Hooks

1. **usePoseDetection** (`hooks/usePoseDetection.js`)
   - Custom hook that manages all pose detection state and logic
   - Coordinates between different components
   - Handles frame processing and pose analysis

## File Structure

```
src/
├── components/
│   ├── index.js                 # Component exports
│   ├── Shooting.jsx             # Main component
│   ├── PoseDetector.jsx         # Model initialization
│   ├── CameraController.jsx     # Camera management
│   ├── CanvasRenderer.jsx       # Drawing utilities
│   ├── PoseAnalyzer.jsx         # Analysis logic
│   ├── StatusDisplay.jsx        # Status display
│   └── ControlPanel.jsx         # Controls
├── hooks/
│   └── usePoseDetection.js      # Custom hook
└── utils/
    ├── compute.js               # Mathematical utilities
    └── const.js                 # Constants
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other parts of the application
3. **Testability**: Smaller components are easier to test individually
4. **Maintainability**: Changes to specific functionality are isolated
5. **Readability**: Code is more organized and easier to understand

## Component Communication

- Components communicate through props and callbacks
- The `usePoseDetection` hook centralizes state management
- Invisible components (PoseDetector, CameraController) handle background logic
- Visible components focus on presentation and user interaction

## Usage

The main component can be imported and used as before:

```jsx
import ShootingStanceChecker from "./components/Shooting";

function App() {
  return <ShootingStanceChecker />;
}
```

All other components are internal and used by the main component.
