// Language state management
let currentLang = localStorage.getItem('preferredLanguage') || 'vi'; // Default to Vietnamese

export const setLanguage = (lang) => {
  currentLang = lang;
};

export const getLanguage = () => currentLang;

const i18n = {
  en: {
    // AutoCapturePanel
    autoCaptureSettings: "📸 Auto-Capture Settings",
    autoCaptureEnabled: "Auto-Capture Enabled",
    autoCaptureDisabled: "Auto-Capture Disabled",
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
    uploadImageToAnalyze: "Upload Image to Analyze",
    dragAndDropOrClick: "Drag & drop an image here, or click to select",
    supportedFormats: "Supported formats: JPG, PNG, WebP",
    maxFileSize: "Max file size: 10MB",

    // Status Messages
    stanceAcceptable: "✅ Stance Acceptable (Rules Score: {percent}%)",
    stanceIncorrect: "❌ Incorrect Stance (Rules Score: {percent}%)",
    issues: "Issues: {issues}",
    noPerson: "No person detected in uploaded image",
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
  },
  vi: {
    // AutoCapturePanel
    autoCaptureSettings: "📸 Cài đặt Tự động Chụp",
    autoCaptureEnabled: "Tự động Chụp Đã Bật",
    autoCaptureDisabled: "Tự động Chụp Đã Tắt",
    howItWorks: "Cách hoạt động:",
    capturesFrames: "• Chụp khung hình có điểm số tư thế < 70%",
    requiresStablePose: "• Yêu cầu tư thế ổn định trong 10 khung hình liên tiếp",
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
    twoHandStandingDesc: "Tư thế súng trường truyền thống",
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
    uploadImageToAnalyze: "Tải lên Hình ảnh để Phân tích",
    dragAndDropOrClick: "Kéo & thả hình ảnh vào đây, hoặc nhấp để chọn",
    supportedFormats: "Định dạng hỗ trợ: JPG, PNG, WebP",
    maxFileSize: "Kích thước tối đa: 10MB",

    // Status Messages
    stanceAcceptable: "✅ Tư thế đúng (Điểm quy tắc: {percent}%)",
    stanceIncorrect: "❌ Tư thế sai (Điểm quy tắc: {percent}%)",
    issues: "Lỗi: {issues}",
    noPerson: "Không phát hiện người trong ảnh đã tải lên",
    referenceSimilarity: "Độ giống với tư thế chuẩn: {sim}% {status}",
    refAcceptable: "✅ Chấp nhận",
    refDifferent: "❌ Quá khác",
    loading: "Đang tải...",
    cameraInitializing: "Đang khởi tạo camera...",
    noPoseDetected: "Không phát hiện tư thế",
    poseDetected: "Đã phát hiện tư thế",
    excellent: "Xuất sắc",
    good: "Tốt",
    needsImprovement: "Cần cải thiện",
    poor: "Kém",

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
  },
};

export const t = (key, params = {}) => {
  let str = i18n[currentLang][key] || key;
  for (const p in params) {
    str = str.replace(`{${p}}`, params[p]);
  }
  return str;
};
