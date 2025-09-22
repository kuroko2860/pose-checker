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
    shootingTips: "Shooting Tips",
    detected: "Detected:",
    capturedAt: "Captured At",
    issuesFound: "Issues Found",
    additionalDetails: "Additional Details",
    close: "Close",
    imageDetails: "Image Details",
    peopleDetected: "people detected",
    averageScore: "Average Score",
    individualResults: "Individual Results",
    person: "Person",
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
    gunAssembling: "Assembling Gun",
    gunAssemblingDesc: "Safety assembling gun",

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
    feetNotParallel: "Feet should be parallel (side-by-side), not front-back",
    frontBackStanceIncorrect:
      "Front-back stance: feet too close or too far apart",
    frontBackKneeBendIncorrect:
      "Front-back stance: front leg should be more bent, back leg straighter",
    legAngleIncorrect:
      "Leg angle incorrect for stance type (current: {angle}°)",
    leftLegNotStraight: "Left leg not straight enough (current: {angle}°)",
    rightLegNotStraight: "Right leg not straight enough (current: {angle}°)",
    leftArmNotStraight: "Left arm not straight enough (current: {angle}°)",
    rightArmNotStraight: "Right arm not straight enough (current: {angle}°)",
    gunArmNotStraight: "Gun arm not straight enough (current: {angle}°)",
    leftArmBodyAngleIncorrect:
      "Left arm-body angle incorrect (current: {angle}°)",
    rightArmBodyAngleIncorrect:
      "Right arm-body angle incorrect (current: {angle}°)",
    gunArmBodyAngleIncorrect:
      "Gun arm-body angle incorrect (current: {angle}°)",
    supportArmBodyAngleIncorrect:
      "Support arm-body angle incorrect (current: {angle}°)",
    supportArmWristAngleIncorrect:
      "Support arm wrist angle incorrect (current: {angle}°)",
    cannotDetermineSupportLeg: "Cannot determine support leg position",
    supportLegNotProperlyPositioned:
      "Support leg not properly positioned (knee and toe on ground, butt on heel)",
    otherLegKneeAngleIncorrect:
      "Other leg knee angle incorrect (current: {angle}°, should be 40-50°)",
    legsNotProperlySpread: "Legs not properly spread (should be 80-100° apart)",
    supportArmWristNotOnKnee:
      "Support arm wrist not positioned on other leg's knee",
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
    armAngleIncorrect: "Arm angle incorrect",

    // Martial Art Training Tips
    martialArtTip1: "Maintain stable stance with feet shoulder-width apart",
    martialArtTip2: "Always keep hands in guard position",
    martialArtTip3: "Move lightly and flexibly",
    martialArtTip4: "Focus on technique over power",
    martialArtTip5: "Practice regularly to improve reflexes",
  },
  vi: {
    // App
    shotgunStanceTrainer: "Phân tích động tác bắn súng ngắn bằng AI",
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
    shootingTips: "Mẹo Bắn súng",
    detected: "Đã phát hiện:",
    capturedAt: "Chụp lúc",
    issuesFound: "Vấn đề được tìm thấy",
    additionalDetails: "Chi tiết bổ sung",
    close: "Đóng",
    imageDetails: "Chi tiết Hình ảnh",
    peopleDetected: "người được phát hiện",
    averageScore: "Điểm Trung bình",
    individualResults: "Kết quả Từng người",
    person: "Người",
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
    twoHandStanding: "Động tác bắn hai tay",
    twoHandStandingDesc: "Tư thế bắn súng truyền thống",
    oneHandStanding: "Động tác bắn một tay",
    oneHandStandingDesc: "Tư thế một tay",
    kneeling: "Động tác quỳ",
    kneelingDesc: "Tư thế quỳ thấp",
    checkingGun: "Động tác tháo lắp súng 1",
    checkingGunDesc: "Kiểm tra an toàn súng",
    gunAssembling: "Động tác tháo lắp súng 2",
    gunAssemblingDesc: "Tháo lắp súng đảm bảo an toàn",

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
    feetNotParallel: "Chân nên song song (cạnh nhau), không phải trước-sau",
    frontBackStanceIncorrect: "Tư thế trước-sau: chân quá gần hoặc quá xa nhau",
    frontBackKneeBendIncorrect:
      "Tư thế trước-sau: chân trước nên cong hơn, chân sau thẳng hơn",
    legAngleIncorrect:
      "Góc chân không đúng cho loại tư thế (hiện tại: {angle}°)",
    leftLegNotStraight: "Chân trái không đủ thẳng (hiện tại: {angle}°)",
    rightLegNotStraight: "Chân phải không đủ thẳng (hiện tại: {angle}°)",
    leftArmNotStraight: "Tay trái không đủ thẳng (hiện tại: {angle}°)",
    rightArmNotStraight: "Tay phải không đủ thẳng (hiện tại: {angle}°)",
    gunArmNotStraight: "Tay cầm súng không đủ thẳng (hiện tại: {angle}°)",
    leftArmBodyAngleIncorrect:
      "Góc tay trái-thân người không đúng (hiện tại: {angle}°)",
    rightArmBodyAngleIncorrect:
      "Góc tay phải-thân người không đúng (hiện tại: {angle}°)",
    gunArmBodyAngleIncorrect:
      "Góc tay cầm súng-thân người không đúng (hiện tại: {angle}°)",
    supportArmBodyAngleIncorrect:
      "Góc tay hỗ trợ-thân người không đúng (hiện tại: {angle}°)",
    supportArmWristAngleIncorrect:
      "Góc cổ tay tay hỗ trợ không đúng (hiện tại: {angle}°)",
    cannotDetermineSupportLeg: "Không thể xác định vị trí chân hỗ trợ",
    supportLegNotProperlyPositioned:
      "Chân hỗ trợ không đúng vị trí (đầu gối và ngón chân trên mặt đất, mông trên gót chân)",
    otherLegKneeAngleIncorrect:
      "Góc đầu gối chân kia không đúng (hiện tại: {angle}°)",
    legsNotProperlySpread: "Chân không mở đúng cách (nên cách nhau 80-100°)",
    supportArmWristNotOnKnee:
      "Cổ tay tay hỗ trợ không đặt trên đầu gối chân kia",
    cannotSeeFeetShoulders: "Không thể nhìn rõ chân/vai",
    leftKneeNotBent: "Đầu gối trái không hơi cong",
    leftLegNotVisible: "Chân trái không nhìn thấy rõ",
    rightKneeNotBent: "Đầu gối phải không hơi cong",
    rightLegNotVisible: "Chân phải không nhìn thấy rõ",
    torsoTooUpright: "Thân người quá thẳng (nên hơi nghiêng về phía trước)",
    torsoLandmarksNotClear: "Các điểm mốc thân người không rõ",
    frontArmAngleIncorrect: "Góc tay trước không đúng (hiện tại: {angle}°)",
    frontArmNotVisible: "Tay trước không nhìn thấy rõ",
    rearArmAngleIncorrect: "Góc tay sau không đúng (hiện tại: {angle}°)",
    rearArmNotVisible: "Tay sau không nhìn thấy rõ",
    headTiltedTooMuch: "Đầu nghiêng quá nhiều",
    headLandmarksNotClear: "Các điểm mốc đầu không rõ",
    feetSpacingWider: "Khoảng cách chân không đúng (cần tư thế rộng hơn)",
    leftKneeBendIncorrect: "Độ cong đầu gối trái không đúng",
    rightKneeBendIncorrect: "Độ cong đầu gối phải không đúng",
    extendedArmNotStraight: "Tay duỗi không đủ thẳng (hiện tại: {angle}°)",
    supportArmPositionIncorrect:
      "Vị trí tay hỗ trợ không đúng (hiện tại: {angle}°)",
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
    armAngleIncorrect: "Góc tay không đúng (hiện tại: {angle}°)",

    // Martial Art
    martialArtsDojo: "Võ Đường Võ Thuật",
    poseAnalysisTraining: "Phân Tích Tư Thế & Luyện Tập",
    trainingTechniques: "Kỹ Thuật Luyện Tập",
    combatSetup: "Thiết Lập Chiến Đấu",
    trainingControls: "Điều Khiển Luyện Tập",
    trainingArena: "Sàn Luyện Tập",
    combatAnalysis: "Phân Tích Chiến Đấu",
    trainingGallery: "Thư Viện Luyện Tập",
    fightingStance: "Tư Thế Chiến Đấu",
    fightingStanceDesc: "Tư thế cơ bản cho chiến đấu",
    punchTechnique: "Kỹ Thuật Đấm",
    punchTechniqueDesc: "Kỹ thuật đấm chính xác",
    defensiveBlock: "Kỹ Thuật Phòng Thủ",
    defensiveBlockDesc: "Kỹ thuật chặn đỡ tấn công",
    selectDefender: "Chọn Người Phòng Thủ",
    selectAttacker: "Chọn Người Tấn Công",
    defender: "Người Phòng Thủ",
    attacker: "Người Tấn Công",
    fighter: "Võ Sĩ",
    startTraining: "Bắt Đầu Luyện Tập",
    stopTraining: "Dừng Luyện Tập",
    captureMove: "Chụp Động Tác",
    capturing: "Đang chụp...",
    autoCapture: "Tự Động Chụp",
    uploadImage: "Tải Lên Hình Ảnh",
    liveStatus: "Trạng Thái Trực Tiếp",
    currentlyTraining: "Đang luyện tập",
    readyToTrain: "Sẵn sàng luyện tập",
    poseIndicator: "Chỉ Báo Tư Thế",
    currentTechnique: "Kỹ thuật hiện tại",
    combatSummary: "Tóm Tắt Chiến Đấu",
    winner: "Người Thắng",
    vs: "VS",
    scoreComparison: "So Sánh Điểm Số",
    capturedMoves: "Động tác đã chụp",
    fighters: "võ sĩ",
    noMovesCaptured: "Chưa có động tác nào được chụp",
    switchToShooting: "Chuyển sang Bắn Súng",
    selectPoseType: "Chọn Loại Tư Thế",
    selectDefenderForAnalysis: "Chọn người phòng thủ để phân tích",
    bothFightersTracked: "Cả hai võ sĩ đều được theo dõi",
    trainingSession: "Buổi Luyện Tập",
    combatReady: "Sẵn Sàng Chiến Đấu",
    techniqueMastery: "Thành Thạo Kỹ Thuật",
    defenseScore: "Điểm Phòng Thủ",
    attackScore: "Điểm Tấn Công",
    overallPerformance: "Hiệu Suất Tổng Thể",
    trainingProgress: "Tiến Độ Luyện Tập",
    combatStatistics: "Thống Kê Chiến Đấu",
    moveAnalysis: "Phân Tích Động Tác",
    techniqueFeedback: "Phản Hồi Kỹ Thuật",
    trainingTips: "Mẹo Luyện Tập",
    perfectForm: "Tư thế hoàn hảo",
    needsWork: "Cần cải thiện",
    excellentTechnique: "Kỹ thuật xuất sắc",
    goodTechnique: "Kỹ thuật tốt",
    poorTechnique: "Kỹ thuật kém",
    trainingComplete: "Hoàn thành luyện tập",
    nextTechnique: "Kỹ thuật tiếp theo",
    repeatTechnique: "Lặp lại kỹ thuật",
    combatMode: "Chế Độ Chiến Đấu",
    trainingMode: "Chế Độ Luyện Tập",
    sparringMode: "Chế Độ Đấu Tập",

    // Martial Art Training Tips
    martialArtTip1: "Giữ tư thế ổn định với chân rộng bằng vai",
    martialArtTip2: "Luôn giữ tay ở vị trí phòng thủ",
    martialArtTip3: "Di chuyển nhẹ nhàng và linh hoạt",
    martialArtTip4: "Tập trung vào kỹ thuật hơn là sức mạnh",
    martialArtTip5: "Luyện tập thường xuyên để cải thiện phản xạ",
  },
};

export const t = (key, params = {}) => {
  let str = i18n[currentLang][key] || key;
  for (const p in params) {
    str = str.replace(`{${p}}`, params[p]);
  }
  return str;
};
