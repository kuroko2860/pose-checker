import React, { useState } from "react";
import usePoseDetection from "../hooks/usePoseDetection";
import CanvasRenderer from "./CanvasRenderer";
import StatusDisplay from "./StatusDisplay";
import { getMartialArtPoseTypes } from "../utils/martialArtPoses";
import { t } from "../utils/translations";

const MartialArt = () => {
  const [selectedPoseType, setSelectedPoseType] = useState(null);
  const [defenderIndex, setDefenderIndex] = useState(0); // 0 = first person, 1 = second person
  const [showDefenderSelector, setShowDefenderSelector] = useState(false);

  const {
    // Pose detection state
    status,
    rules,
    detectedPeople,
    multiPersonAnalysis,
    uploadedImage,

    // Refs
    videoRef,
    canvasRef,
    fileInputRef,

    // Functions
    toggleMode,
    handleImageUpload,
    toggleCapture,
    toggleAutoCapture,
    setSelectedPoseCategory,
    setDetectedPoseCategory,
    setIsRunning,
    runFrame,
    stopAnimation,

    // State
    isRunning,
    isCapturing,
    isInCapturedMode,
    capturedPose,
    capturedImages,
    autoCaptureEnabled,
    mode,
  } = usePoseDetection();

  const martialArtPoses = getMartialArtPoseTypes();

  const handlePoseTypeSelect = (poseType) => {
    setSelectedPoseType(poseType);
    setSelectedPoseCategory(poseType.id);
  };

  const handleDefenderSelect = (index) => {
    setDefenderIndex(index);
    setShowDefenderSelector(false);
  };

  const getDefenderAnalysis = () => {
    if (!multiPersonAnalysis || !multiPersonAnalysis.people) return null;

    const defender = multiPersonAnalysis.people[defenderIndex];
    const attacker = multiPersonAnalysis.people[1 - defenderIndex];

    return {
      defender: defender,
      attacker: attacker,
      defenderScore: defender?.score || 0,
      attackerScore: attacker?.score || 0,
    };
  };

  const defenderAnalysis = getDefenderAnalysis();

  // Create start/stop detection functions
  const startDetection = () => {
    setIsRunning(true);
  };

  const stopDetection = () => {
    setIsRunning(false);
    stopAnimation();
  };

  return (
    <div className="dojo-container">
      {/* Dojo Header */}
      <div className="dojo-header">
        <div className="dojo-title">
          <div className="dojo-icon">🥋</div>
          <h1>{t("martialArtsDojo")}</h1>
          <div className="dojo-subtitle">{t("poseAnalysisTraining")}</div>
        </div>
      </div>

      {/* Main Dojo Layout */}
      <div className="dojo-layout">
        {/* Training Menu (Left) */}
        <div className="training-menu">
          <div className="menu-section">
            <div className="section-header">
              <span className="section-icon">⚔️</span>
              <h3>{t("trainingTechniques")}</h3>
            </div>
            <div className="technique-grid">
              {martialArtPoses.map((pose) => (
                <div
                  key={pose.id}
                  className={`technique-card ${
                    selectedPoseType?.id === pose.id ? "selected" : ""
                  }`}
                  onClick={() => handlePoseTypeSelect(pose)}
                >
                  <div className="technique-icon">
                    {pose.id === "stance" && "🦵"}
                    {pose.id === "punch" && "👊"}
                    {pose.id === "block" && "🛡️"}
                  </div>
                  <div className="technique-info">
                    <h4>{t(pose.name)}</h4>
                    <p>{t(pose.description)}</p>
                  </div>
                  {selectedPoseType?.id === pose.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Combat Setup */}
          {detectedPeople.length >= 2 && (
            <div className="menu-section">
              <div className="section-header">
                <span className="section-icon">🥊</span>
                <h3>{t("combatSetup")}</h3>
              </div>
              <div className="combat-setup">
                <div className="fighter-selector">
                  <div className="fighter-option">
                    <div className="fighter-avatar">🥷</div>
                    <button
                      className={`fighter-btn ${
                        defenderIndex === 0 ? "defender" : "attacker"
                      }`}
                      onClick={() => handleDefenderSelect(0)}
                    >
                      <span className="fighter-name">{t("fighter")} 1</span>
                      <span className="fighter-role">
                        {defenderIndex === 0
                          ? t("defender").toUpperCase()
                          : t("attacker").toUpperCase()}
                      </span>
                    </button>
                  </div>
                  <div className="vs-divider">VS</div>
                  <div className="fighter-option">
                    <div className="fighter-avatar">🥷</div>
                    <button
                      className={`fighter-btn ${
                        defenderIndex === 1 ? "defender" : "attacker"
                      }`}
                      onClick={() => handleDefenderSelect(1)}
                    >
                      <span className="fighter-name">{t("fighter")} 2</span>
                      <span className="fighter-role">
                        {defenderIndex === 1
                          ? t("defender").toUpperCase()
                          : t("attacker").toUpperCase()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Training Controls */}
          <div className="menu-section">
            <div className="section-header">
              <span className="section-icon">🎮</span>
              <h3>{t("trainingControls")}</h3>
            </div>
            <div className="control-panel">
              <button
                className={`control-btn primary ${
                  isRunning ? "stop" : "start"
                }`}
                onClick={isRunning ? stopDetection : startDetection}
              >
                <span className="btn-icon">{isRunning ? "⏹️" : "▶️"}</span>
                <span className="btn-text">
                  {isRunning ? t("stopTraining") : t("startTraining")}
                </span>
              </button>

              <button
                className="control-btn secondary"
                onClick={toggleCapture}
                disabled={!isRunning || isCapturing}
              >
                <span className="btn-icon">📸</span>
                <span className="btn-text">
                  {isCapturing ? t("capturing") : t("captureMove")}
                </span>
              </button>

              <button
                className={`control-btn toggle ${
                  autoCaptureEnabled ? "active" : ""
                }`}
                onClick={toggleAutoCapture}
              >
                <span className="btn-icon">🤖</span>
                <span className="btn-text">
                  {autoCaptureEnabled
                    ? `${t("autoCapture")} ON`
                    : `${t("autoCapture")} OFF`}
                </span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                className="control-btn secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="btn-icon">📁</span>
                <span className="btn-text">{t("uploadImage")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Training Arena (Center) */}
        <div className="training-arena">
          <div className="arena-header">
            <div className="arena-title">
              <span className="arena-icon">🏟️</span>
              <span>{t("trainingArena")}</span>
            </div>
            <div className="arena-status">
              {isRunning ? (
                <div className="status-indicator active">
                  <span className="status-dot"></span>
                  <span>{t("currentlyTraining")}</span>
                </div>
              ) : (
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span>{t("readyToTrain")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="video-arena">
            <div className="arena-frame">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  display: isRunning && mode === "webcam" ? "block" : "none",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "block" }} />
              {uploadedImage && (
                <img
                  src={uploadedImage.src}
                  alt="Uploaded"
                  style={{ display: "none" }}
                />
              )}
            </div>
            <div className="arena-overlay">
              <div className="pose-indicator">
                {selectedPoseType && (
                  <div className="current-pose">
                    <span className="pose-icon">
                      {selectedPoseType.id === "stance" && "🦵"}
                      {selectedPoseType.id === "punch" && "👊"}
                      {selectedPoseType.id === "block" && "🛡️"}
                    </span>
                    <span className="pose-name">
                      {t(selectedPoseType.name)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Training Status */}
          <div className="training-status">
            <StatusDisplay
              status={status}
              rules={rules}
              detectedPoseCategory={selectedPoseType?.name}
              multiPersonAnalysis={multiPersonAnalysis}
              detectedPeople={detectedPeople}
              mode="martial_art"
              defenderAnalysis={defenderAnalysis}
            />
          </div>
        </div>

        {/* Combat Analysis (Right) */}
        <div className="combat-analysis">
          <div className="analysis-header">
            <span className="analysis-icon">📊</span>
            <h3>{t("combatAnalysis")}</h3>
          </div>

          {defenderAnalysis ? (
            <div className="analysis-content">
              <div className="fighters-display">
                <div className="fighter-card defender">
                  <div className="fighter-header">
                    <div className="fighter-avatar">🛡️</div>
                    <div className="fighter-info">
                      <h4>{t("defender")}</h4>
                      <span className="fighter-id">
                        {t("fighter")} {defenderIndex + 1}
                      </span>
                    </div>
                  </div>
                  <div className="score-circle">
                    <div className="score-value">
                      {defenderAnalysis.defenderScore}%
                    </div>
                    <div className="score-label">Form Score</div>
                  </div>
                  <div className="fighter-feedback">
                    <p className="status">
                      {defenderAnalysis.defender?.status || "No data"}
                    </p>
                    <p className="rules">
                      {defenderAnalysis.defender?.rules || "No feedback"}
                    </p>
                  </div>
                </div>

                <div className="vs-separator">
                  <div className="vs-line"></div>
                  <div className="vs-text">{t("vs")}</div>
                  <div className="vs-line"></div>
                </div>

                <div className="fighter-card attacker">
                  <div className="fighter-header">
                    <div className="fighter-avatar">⚔️</div>
                    <div className="fighter-info">
                      <h4>{t("attacker")}</h4>
                      <span className="fighter-id">
                        {t("fighter")} {2 - defenderIndex}
                      </span>
                    </div>
                  </div>
                  <div className="score-circle">
                    <div className="score-value">
                      {defenderAnalysis.attackerScore}%
                    </div>
                    <div className="score-label">Form Score</div>
                  </div>
                  <div className="fighter-feedback">
                    <p className="status">
                      {defenderAnalysis.attacker?.status || "No data"}
                    </p>
                    <p className="rules">
                      {defenderAnalysis.attacker?.rules || "No feedback"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="combat-summary">
                <div className="summary-header">
                  <span className="summary-icon">🏆</span>
                  <h4>{t("combatSummary")}</h4>
                </div>
                <div className="summary-content">
                  <div className="result-display">
                    {defenderAnalysis.defenderScore >
                    defenderAnalysis.attackerScore ? (
                      <div className="winner defender">
                        <span className="winner-icon">🛡️</span>
                        <span className="winner-text">
                          {t("defender")} {t("winner")}!
                        </span>
                      </div>
                    ) : (
                      <div className="winner attacker">
                        <span className="winner-icon">⚔️</span>
                        <span className="winner-text">
                          {t("attacker")} {t("winner")}!
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="score-comparison">
                    <div className="score-bar">
                      <div className="score-label">{t("defender")}</div>
                      <div className="score-track">
                        <div
                          className="score-fill defender"
                          style={{
                            width: `${defenderAnalysis.defenderScore}%`,
                          }}
                        ></div>
                        <span className="score-text">
                          {defenderAnalysis.defenderScore}%
                        </span>
                      </div>
                    </div>
                    <div className="score-bar">
                      <div className="score-label">{t("attacker")}</div>
                      <div className="score-track">
                        <div
                          className="score-fill attacker"
                          style={{
                            width: `${defenderAnalysis.attackerScore}%`,
                          }}
                        ></div>
                        <span className="score-text">
                          {defenderAnalysis.attackerScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-analysis">
              <div className="no-analysis-icon">🥋</div>
              <p>Bắt đầu luyện tập để xem phân tích động tác</p>
            </div>
          )}

          {/* Training Gallery */}
          {capturedImages.length > 0 && (
            <div className="training-gallery">
              <div className="gallery-header">
                <span className="gallery-icon">📸</span>
                <h4>{t("trainingGallery")}</h4>
              </div>
              <div className="gallery-grid">
                {capturedImages.map((image) => (
                  <div key={image.id} className="gallery-item">
                    <div className="gallery-image">
                      <img src={image.imageData} alt="Captured pose" />
                      <div className="gallery-overlay">
                        <div className="gallery-score">
                          {image.averageScore}%
                        </div>
                      </div>
                    </div>
                    <div className="gallery-info">
                      <span className="gallery-people">
                        {image.totalPeople} {t("fighters")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dojo-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #1a1a2e 0%,
            #16213e 50%,
            #0f3460 100%
          );
          color: #ffffff;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .dojo-header {
          background: linear-gradient(
            90deg,
            #2c1810 0%,
            #8b4513 50%,
            #2c1810 100%
          );
          padding: 20px 30px;
          border-bottom: 3px solid #d4af37;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .dojo-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .dojo-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .dojo-title h1 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          color: #d4af37;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: 1px;
        }

        .dojo-subtitle {
          font-size: 0.9rem;
          color: #f4e4bc;
          margin-top: 5px;
          font-style: italic;
        }

        .dojo-layout {
          display: grid;
          grid-template-columns: 320px 1fr 350px;
          gap: 20px;
          padding: 20px;
          min-height: calc(100vh - 120px);
        }

        .training-menu {
          background: linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%);
          border-radius: 15px;
          border: 2px solid #8b4513;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .menu-section {
          margin-bottom: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #8b4513;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-header h3 {
          margin: 0;
          color: #d4af37;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .technique-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .technique-card {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
          border: 2px solid #8b4513;
          border-radius: 12px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .technique-card:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.2);
        }

        .technique-card.selected {
          border-color: #d4af37;
          background: linear-gradient(135deg, #4a2c17 0%, #3d2914 100%);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .technique-icon {
          font-size: 2rem;
          min-width: 40px;
          text-align: center;
        }

        .technique-info h4 {
          margin: 0 0 5px 0;
          color: #f4e4bc;
          font-size: 1rem;
          font-weight: 600;
        }

        .technique-info p {
          margin: 0;
          color: #d4af37;
          font-size: 0.85rem;
          line-height: 1.3;
        }

        .selected-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #d4af37;
          color: #2c1810;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .combat-setup {
          background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid #8b4513;
        }

        .fighter-selector {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .fighter-option {
          flex: 1;
          text-align: center;
        }

        .fighter-avatar {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .fighter-btn {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
          border: 2px solid #8b4513;
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .fighter-btn:hover {
          border-color: #d4af37;
          transform: scale(1.05);
        }

        .fighter-btn.defender {
          border-color: #e74c3c;
          background: linear-gradient(135deg, #4a1a1a 0%, #3d1818 100%);
        }

        .fighter-btn.attacker {
          border-color: #3498db;
          background: linear-gradient(135deg, #1a3a4a 0%, #183d3d 100%);
        }

        .fighter-name {
          color: #f4e4bc;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .fighter-role {
          color: #d4af37;
          font-size: 0.75rem;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .vs-divider {
          color: #d4af37;
          font-weight: bold;
          font-size: 1.2rem;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-btn {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
          border: 2px solid #8b4513;
          border-radius: 10px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f4e4bc;
          font-weight: 600;
        }

        .control-btn:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.2);
        }

        .control-btn.primary {
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
          border-color: #27ae60;
        }

        .control-btn.primary.stop {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          border-color: #e74c3c;
        }

        .control-btn.secondary {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          border-color: #f39c12;
        }

        .control-btn.toggle {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
        }

        .control-btn.toggle.active {
          background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
          border-color: #8e44ad;
        }

        .control-btn:disabled {
          background: #555;
          border-color: #666;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        .training-arena {
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 15px;
          border: 2px solid #0f3460;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .arena-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #0f3460;
        }

        .arena-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #d4af37;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .arena-icon {
          font-size: 1.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .status-indicator.active {
          color: #27ae60;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6c757d;
        }

        .status-indicator.active .status-dot {
          background: #27ae60;
          box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
        }

        .video-arena {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
          border: 3px solid #0f3460;
        }

        .arena-frame {
          position: relative;
        }

        .arena-frame video,
        .arena-frame canvas {
          width: 100%;
          height: auto;
          display: block;
        }

        .arena-overlay {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 10;
        }

        .pose-indicator {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #d4af37;
          border-radius: 10px;
          padding: 10px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current-pose {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d4af37;
        }

        .pose-icon {
          font-size: 1.5rem;
        }

        .pose-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .training-status {
          background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid #8b4513;
        }

        .combat-analysis {
          background: linear-gradient(180deg, #2c1810 0%, #1a0f0a 100%);
          border-radius: 15px;
          border: 2px solid #8b4513;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .analysis-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #8b4513;
        }

        .analysis-icon {
          font-size: 1.5rem;
        }

        .analysis-header h3 {
          margin: 0;
          color: #d4af37;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .fighters-display {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 25px;
        }

        .fighter-card {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
          border: 2px solid #8b4513;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
        }

        .fighter-card.defender {
          border-color: #e74c3c;
          background: linear-gradient(135deg, #4a1a1a 0%, #3d1818 100%);
        }

        .fighter-card.attacker {
          border-color: #3498db;
          background: linear-gradient(135deg, #1a3a4a 0%, #183d3d 100%);
        }

        .fighter-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .fighter-avatar {
          font-size: 2rem;
        }

        .fighter-info h4 {
          margin: 0;
          color: #f4e4bc;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .fighter-id {
          color: #d4af37;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .score-circle {
          background: rgba(0, 0, 0, 0.3);
          border: 3px solid #d4af37;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #d4af37;
        }

        .score-label {
          font-size: 0.7rem;
          color: #f4e4bc;
          margin-top: 2px;
        }

        .fighter-feedback {
          text-align: left;
        }

        .fighter-feedback .status {
          color: #f4e4bc;
          font-size: 0.9rem;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .fighter-feedback .rules {
          color: #d4af37;
          font-size: 0.8rem;
          margin: 0;
          line-height: 1.3;
        }

        .vs-separator {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
        }

        .vs-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
        }

        .vs-text {
          color: #d4af37;
          font-weight: bold;
          font-size: 1.1rem;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .combat-summary {
          background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
          border: 2px solid #d4af37;
          border-radius: 15px;
          padding: 20px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .summary-icon {
          font-size: 1.3rem;
        }

        .summary-header h4 {
          margin: 0;
          color: #d4af37;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .result-display {
          text-align: center;
          margin-bottom: 20px;
        }

        .winner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .winner.defender {
          background: linear-gradient(135deg, #4a1a1a 0%, #3d1818 100%);
          border: 2px solid #e74c3c;
          color: #e74c3c;
        }

        .winner.attacker {
          background: linear-gradient(135deg, #1a3a4a 0%, #183d3d 100%);
          border: 2px solid #3498db;
          color: #3498db;
        }

        .winner-icon {
          font-size: 1.5rem;
        }

        .score-comparison {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .score-bar {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .score-label {
          min-width: 70px;
          color: #f4e4bc;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .score-track {
          flex: 1;
          height: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        .score-fill.defender {
          background: linear-gradient(90deg, #e74c3c, #c0392b);
        }

        .score-fill.attacker {
          background: linear-gradient(90deg, #3498db, #2980b9);
        }

        .score-text {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }

        .no-analysis {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .no-analysis-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .training-gallery {
          margin-top: 25px;
        }

        .gallery-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #8b4513;
        }

        .gallery-icon {
          font-size: 1.2rem;
        }

        .gallery-header h4 {
          margin: 0;
          color: #d4af37;
          font-size: 1rem;
          font-weight: 600;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .gallery-item {
          background: linear-gradient(135deg, #3d2914 0%, #2c1810 100%);
          border: 1px solid #8b4513;
          border-radius: 10px;
          overflow: hidden;
        }

        .gallery-image {
          position: relative;
        }

        .gallery-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .gallery-overlay {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 5px;
          padding: 4px 8px;
        }

        .gallery-score {
          color: #d4af37;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .gallery-info {
          padding: 8px;
          text-align: center;
        }

        .gallery-people {
          color: #d4af37;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default MartialArt;
