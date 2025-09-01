// Language state management
let currentLang = localStorage.getItem("preferredLanguage") || "vi"; // Default to Vietnamese

export const setLanguage = (lang) => {
  currentLang = lang;
};

export const getLanguage = () => currentLang;

const i18n = {
  en: {
    // App
    shotgunStanceTrainer: "Shotgun Stance Trainer",
    aiPoweredAnalysis: "AI-Powered Shooting Form Analysis",
    liveCameraFeed: "Live Camera Feed",
    imageAnalysis: "Image Analysis",
    capturingPose: "Capturing Pose...",
    perfectYourStance: "Perfect your shooting stance with AI-powered analysis",
    builtWith: "Copyright © 2025 ITrainer. All Rights Reserved",
    show: "Show",
    hide: "Hide",
    debug: "Debug",

    // AutoCapturePanel
    autoCaptureSettings: "📸 Auto-Capture Settings",
    autoCaptureEnabled: "Auto-Capture Enabled",
    autoCaptureDisabled: "Auto-Capture Disabled",
    autoCaptured: "📸 Auto-captured: {name} (Score: {score}%)",
    howItWorks: "How it works:",
    capturesFrames: "• Captures frames with pose score < 70%",
    requiresStablePose: "• Requires stable pose for 10 consecutive frames",
    minimumKeypoints: "• Minimum 10 keypoints with confidence > 40%",
    frameCooldown: "• 30-frame cooldown between captures",
    capturedImages: "Captured Images",
    clearAll: "Clear All",
    noImagesCaptured: "No images captured yet",
    badPosesWillBeCaptured: "Bad poses will be captured automatically",
    clickToViewDetails: "Click to view details",
    unknown: "Unknown",

    // StatusDisplay
    stanceAnalysis: "Stance Analysis",
    improvementAreas: "Improvement Areas",
    referenceComparison: "Reference Comparison",
    shootingTips: "Shooting Tips",
    detected: "Detected:",
    capturedAt: "Captured At",
    issuesFound: "Issues Found",
    additionalDetails: "Additional Details",
    close: "Close",
    imageDetails: "Image Details",
    score: "Score",
    pose: "Pose",

    // Shooting Tips
    feetShoulderWidth: "Keep your feet shoulder-width apart for stability",
    bendKnees: "Bend your knees slightly to absorb recoil",
    leanForward: "Lean forward slightly from the waist",
    keepHeadLevel: "Keep your head level and eyes on target",
    practiceRegularly: "Practice regularly to build muscle memory",

    // Pose Categories
    autoDetect: "Auto-Detect",
    autoDetectDesc: "Automatically detect pose type",
    twoHandStanding: "Two-Hand Standing",
    twoHandStandingDesc: "Traditional shotgun stance",
    oneHandStanding: "One-Hand Standing",
    oneHandStandingDesc: "Single-handed stance",
    kneeling: "Kneeling",
    kneelingDesc: "Low-profile kneeling position",
    checkingGun: "Checking Gun",
    checkingGunDesc: "Safety check position",

    // Pose Selector
    poseTypeSelection: "🎯 Pose Type Selection",
    autoDetected: "Auto-detected:",
    selectPoseToAnalyze: "Select a pose type to analyze your stance against",

    // Control Panel
    switchToImageMode: "Switch to Image Mode",
    switchToWebcamMode: "Switch to Webcam Mode",
    stopCapture: "Stop Capture",
    returnToLive: "Return to Live",
    capturePose: "Capture Pose",
    referencePoseSetup: "🎯 Reference Pose Setup",
    setReferenceFromWebcam: "Set Reference from Webcam",
    uploadReferenceImage: "Upload Reference Image",
    referenceSetFromWebcam: "Reference pose set from webcam",
    referenceSetFromImage: "Reference pose set from uploaded image",
    errorSettingReference: "Error setting reference pose",
    errorSettingReferenceFromImage: "Error setting reference from image",
    noPersonInReference: "No person detected in reference image",
    uploadImageToAnalyze: "Upload Image to Analyze",
    uploadImagePrompt: "Upload an image to analyze",
    dragAndDropOrClick: "Drag & drop an image here, or click to select",
    supportedFormats: "Supported formats: JPG, PNG, WebP",
    maxFileSize: "Max file size: 10MB",

    // Status Messages
    stanceAcceptable: "✅ Stance Acceptable (Rules Score: {percent}%)",
    stanceIncorrect: "❌ Incorrect Stance (Rules Score: {percent}%)",
    issues: "Issues: {issues}",
    noPerson: "No person detected in uploaded image",
    noReferenceSet: "No reference pose set",
    referenceSimilarity: "Reference similarity: {sim}% {status}",
    refAcceptable: "✅ Acceptable",
    refDifferent: "❌ Too different",
    loading: "Loading...",
    cameraInitializing: "Camera initializing...",
    noPoseDetected: "No pose detected",
    poseDetected: "Pose detected",
    excellent: "Excellent",
    good: "Good",
    needsImprovement: "Needs Improvement",
    poor: "Poor",
    captureStopped: "Capture stopped",
    returningToRealTime: "Returning to real-time mode...",

    // Performance Monitor
    performanceMonitor: "Performance Monitor",
    fps: "FPS",
    memoryUsage: "Memory Usage",
    poseConfidence: "Pose Confidence",
    keypointsDetected: "Keypoints Detected",

    // Camera Controller
    cameraNotAvailable: "Camera not available",
    cameraAccessDenied: "Camera access denied",
    cameraError: "Camera error",
    cameraStarting: "Starting camera...",
    cameraStopping: "Stopping camera...",

    // Pose Detector
    initializingPoseDetection: "Initializing pose detection...",
    poseDetectionReady: "Pose detection ready",
    poseDetectionError: "Pose detection error",

    // Canvas Renderer
    noImageToDisplay: "No image to display",
    renderingPose: "Rendering pose...",

    // Pose Analyzer
    analyzingPose: "Analyzing pose...",
    analysisComplete: "Analysis complete",
    analysisError: "Analysis error",
    poseCapturingAnalyzing: "Pose captured! Analyzing...",

    // Pose Categories Error Messages
    unableToClassify: "Unable to classify this pose",
    poseNotRecognized: "Pose not recognized",
    feetSpacingIncorrect: "Feet spacing incorrect (aim ~ shoulder width)",
    cannotSeeFeetShoulders: "Cannot see feet/shoulders clearly",
    leftKneeNotBent: "Left knee not slightly bent",
    leftLegNotVisible: "Left leg not fully visible",
    rightKneeNotBent: "Right knee not slightly bent",
    rightLegNotVisible: "Right leg not fully visible",
    torsoTooUpright: "Torso too upright (lean slightly forward)",
    torsoLandmarksNotClear: "Torso landmarks not clear",
    frontArmAngleIncorrect: "Front arm angle incorrect (extend more/less)",
    frontArmNotVisible: "Front arm not fully visible",
    rearArmAngleIncorrect: "Rear arm angle incorrect",
    rearArmNotVisible: "Rear arm not fully visible",
    headTiltedTooMuch: "Head tilted too much",
    headLandmarksNotClear: "Head landmarks not clear",
    feetSpacingWider: "Feet spacing incorrect (wider stance needed)",
    leftKneeBendIncorrect: "Left knee bend incorrect",
    rightKneeBendIncorrect: "Right knee bend incorrect",
    extendedArmNotStraight: "Extended arm not straight enough",
    supportArmPositionIncorrect: "Support arm position incorrect",
    supportArmNotVisible: "Support arm not fully visible",
    leftKneeNotBentEnough: "Left knee not bent enough for kneeling",
    rightKneeNotBentEnough: "Right knee not bent enough for kneeling",
    hipPositionTooHigh: "Hip position too high",
    hipLandmarksNotClear: "Hip landmarks not clear",
    handsNotCloseEnough: "Hands not close enough together",
    handsNotVisible: "Hands not visible",
    leftElbowNotBentEnough: "Left elbow not bent enough",
    rightElbowNotBentEnough: "Right elbow not bent enough",
    headNotLevel: "Head not level (should be looking down)",
    gunNotPointedDown: "Gun not pointed down",
    armPositionsNotClear: "Arm positions not clear",
  },
  vi: {
    // App
    shotgunStanceTrainer: "Huấn Luyện Tư Thế Bắn Súng",
    aiPoweredAnalysis: "Phân Tích Tư Thế Bắn Bằng AI",
    liveCameraFeed: "Nguồn Camera Trực Tiếp",
    imageAnalysis: "Phân Tích Hình Ảnh",
    capturingPose: "Đang Chụp Tư Thế...",
    perfectYourStance: "Hoàn thiện tư thế bắn của bạn với phân tích bằng AI",
    builtWith: "Copyright © 2025 ITrainer. All Rights Reserved",
    show: "Hiện",
    hide: "Ẩn",
    debug: "Gỡ lỗi",

    // AutoCapturePanel
    autoCaptureSettings: "📸 Cài đặt Tự động Chụp",
    autoCaptureEnabled: "Tự động Chụp Đã Bật",
    autoCaptureDisabled: "Tự động Chụp Đã Tắt",
    autoCaptured: "📸 Đã tự động chụp: {name} (Điểm: {score}%)",
    howItWorks: "Cách hoạt động:",
    capturesFrames: "• Chụp khung hình có điểm số tư thế < 70%",
    requiresStablePose:
      "• Yêu cầu tư thế ổn định trong 10 khung hình liên tiếp",
    minimumKeypoints: "• Tối thiểu 10 điểm chính với độ tin cậy > 40%",
    frameCooldown: "• Thời gian chờ 30 khung hình giữa các lần chụp",
    capturedImages: "Hình ảnh đã chụp",
    clearAll: "Xóa tất cả",
    noImagesCaptured: "Chưa có hình ảnh nào được chụp",
    badPosesWillBeCaptured: "Tư thế xấu sẽ được chụp tự động",
    clickToViewDetails: "Nhấp để xem chi tiết",
    unknown: "Không xác định",

    // StatusDisplay
    stanceAnalysis: "Phân tích Tư thế",
    improvementAreas: "Khu vực Cần Cải thiện",
    referenceComparison: "So sánh Tham chiếu",
    shootingTips: "Mẹo Bắn súng",
    detected: "Đã phát hiện:",
    capturedAt: "Chụp lúc",
    issuesFound: "Vấn đề được tìm thấy",
    additionalDetails: "Chi tiết bổ sung",
    close: "Đóng",
    imageDetails: "Chi tiết Hình ảnh",
    score: "Điểm số",
    pose: "Tư thế",

    // Shooting Tips
    feetShoulderWidth: "Đặt chân rộng bằng vai để ổn định",
    bendKnees: "Hơi gập đầu gối để hấp thụ độ giật",
    leanForward: "Hơi nghiêng về phía trước từ eo",
    keepHeadLevel: "Giữ đầu ngang và mắt nhìn vào mục tiêu",
    practiceRegularly: "Luyện tập thường xuyên để xây dựng trí nhớ cơ bắp",

    // Pose Categories
    autoDetect: "Tự động Phát hiện",
    autoDetectDesc: "Tự động phát hiện loại tư thế",
    twoHandStanding: "Đứng Hai tay",
    twoHandStandingDesc: "Tư thế bắn súng truyền thống",
    oneHandStanding: "Đứng Một tay",
    oneHandStandingDesc: "Tư thế một tay",
    kneeling: "Quỳ",
    kneelingDesc: "Tư thế quỳ thấp",
    checkingGun: "Kiểm tra Súng",
    checkingGunDesc: "Tư thế kiểm tra an toàn",

    // Pose Selector
    poseTypeSelection: "🎯 Chọn Loại Tư thế",
    autoDetected: "Tự động phát hiện:",
    selectPoseToAnalyze: "Chọn loại tư thế để phân tích tư thế của bạn",

    // Control Panel
    switchToImageMode: "Chuyển sang Chế độ Hình ảnh",
    switchToWebcamMode: "Chuyển sang Chế độ Webcam",
    stopCapture: "Dừng Chụp",
    returnToLive: "Quay lại Trực tiếp",
    capturePose: "Chụp Tư thế",
    referencePoseSetup: "🎯 Thiết lập Tư thế Tham chiếu",
    setReferenceFromWebcam: "Đặt Tham chiếu từ Webcam",
    uploadReferenceImage: "Tải lên Hình ảnh Tham chiếu",
    referenceSetFromWebcam: "Đã đặt tư thế tham chiếu từ webcam",
    referenceSetFromImage: "Đã đặt tư thế tham chiếu từ hình ảnh đã tải lên",
    errorSettingReference: "Lỗi khi đặt tư thế tham chiếu",
    errorSettingReferenceFromImage: "Lỗi khi đặt tham chiếu từ hình ảnh",
    noPersonInReference: "Không phát hiện người trong hình ảnh tham chiếu",
    uploadImageToAnalyze: "Tải lên Hình ảnh để Phân tích",
    uploadImagePrompt: "Tải lên hình ảnh để phân tích",
    dragAndDropOrClick: "Kéo & thả hình ảnh vào đây, hoặc nhấp để chọn",
    supportedFormats: "Định dạng hỗ trợ: JPG, PNG, WebP",
    maxFileSize: "Kích thước tối đa: 10MB",

    // Status Messages
    stanceAcceptable: "✅ Tư thế đúng (Điểm quy tắc: {percent}%)",
    stanceIncorrect: "❌ Tư thế sai (Điểm quy tắc: {percent}%)",
    issues: "Lỗi: {issues}",
    noPerson: "Không phát hiện người trong ảnh đã tải lên",
    noReferenceSet: "Chưa đặt tư thế tham chiếu",
    referenceSimilarity: "Độ giống với tư thế chuẩn: {sim}% {status}",
    refAcceptable: "✅ Chấp nhận",
    refDifferent: "❌ Quá khác",
    loading: "Đang tải...",
    cameraInitializing: "Đang khởi tạo camera...",
    noPoseDetected: "Không phát hiện tư thế",
    poseDetected: "Đã phát hiện tư thế",
    excellent: "Xuất sắc",
    good: "Tốt",
    needsImprovement: "Cần Cải Thiện",
    poor: "Kém",
    captureStopped: "Đã dừng chụp",
    returningToRealTime: "Đang trở lại chế độ thời gian thực...",

    // Performance Monitor
    performanceMonitor: "Màn hình Hiệu suất",
    fps: "FPS",
    memoryUsage: "Sử dụng Bộ nhớ",
    poseConfidence: "Độ tin cậy Tư thế",
    keypointsDetected: "Điểm chính được phát hiện",

    // Camera Controller
    cameraNotAvailable: "Camera không khả dụng",
    cameraAccessDenied: "Truy cập camera bị từ chối",
    cameraError: "Lỗi camera",
    cameraStarting: "Đang khởi động camera...",
    cameraStopping: "Đang dừng camera...",

    // Pose Detector
    initializingPoseDetection: "Đang khởi tạo phát hiện tư thế...",
    poseDetectionReady: "Phát hiện tư thế đã sẵn sàng",
    poseDetectionError: "Lỗi phát hiện tư thế",

    // Canvas Renderer
    noImageToDisplay: "Không có hình ảnh để hiển thị",
    renderingPose: "Đang hiển thị tư thế...",

    // Pose Analyzer
    analyzingPose: "Đang phân tích tư thế...",
    analysisComplete: "Phân tích hoàn tất",
    analysisError: "Lỗi phân tích",
    poseCapturingAnalyzing: "Đã chụp tư thế! Đang phân tích...",

    // Pose Categories Error Messages
    unableToClassify: "Không thể phân loại tư thế này",
    poseNotRecognized: "Không nhận diện được tư thế",
    feetSpacingIncorrect: "Khoảng cách chân không đúng (nên rộng bằng vai)",
    cannotSeeFeetShoulders: "Không thể nhìn rõ chân/vai",
    leftKneeNotBent: "Đầu gối trái không hơi cong",
    leftLegNotVisible: "Chân trái không nhìn thấy rõ",
    rightKneeNotBent: "Đầu gối phải không hơi cong",
    rightLegNotVisible: "Chân phải không nhìn thấy rõ",
    torsoTooUpright: "Thân người quá thẳng (nên hơi nghiêng về phía trước)",
    torsoLandmarksNotClear: "Các điểm mốc thân người không rõ",
    frontArmAngleIncorrect: "Góc tay trước không đúng (cần duỗi nhiều/ít hơn)",
    frontArmNotVisible: "Tay trước không nhìn thấy rõ",
    rearArmAngleIncorrect: "Góc tay sau không đúng",
    rearArmNotVisible: "Tay sau không nhìn thấy rõ",
    headTiltedTooMuch: "Đầu nghiêng quá nhiều",
    headLandmarksNotClear: "Các điểm mốc đầu không rõ",
    feetSpacingWider: "Khoảng cách chân không đúng (cần tư thế rộng hơn)",
    leftKneeBendIncorrect: "Độ cong đầu gối trái không đúng",
    rightKneeBendIncorrect: "Độ cong đầu gối phải không đúng",
    extendedArmNotStraight: "Tay duỗi không đủ thẳng",
    supportArmPositionIncorrect: "Vị trí tay hỗ trợ không đúng",
    supportArmNotVisible: "Tay hỗ trợ không nhìn thấy rõ",
    leftKneeNotBentEnough: "Đầu gối trái không cong đủ cho tư thế quỳ",
    rightKneeNotBentEnough: "Đầu gối phải không cong đủ cho tư thế quỳ",
    hipPositionTooHigh: "Vị trí hông quá cao",
    hipLandmarksNotClear: "Các điểm mốc hông không rõ",
    handsNotCloseEnough: "Hai tay không đủ gần nhau",
    handsNotVisible: "Không nhìn thấy tay",
    leftElbowNotBentEnough: "Khuỷu tay trái không cong đủ",
    rightElbowNotBentEnough: "Khuỷu tay phải không cong đủ",
    headNotLevel: "Đầu không ngang bằng (nên nhìn xuống)",
    gunNotPointedDown: "Súng không chĩa xuống",
    armPositionsNotClear: "Vị trí tay không rõ",
  },
};

export const t = (key, params = {}) => {
  let str = i18n[currentLang][key] || key;
  for (const p in params) {
    str = str.replace(`{${p}}`, params[p]);
  }
  return str;
};
