import { useState } from "react";
import ShootingStanceChecker from "./components/Shooting";
import MartialArt from "./components/MartialArt";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  const [appMode, setAppMode] = useState("shooting"); // "shooting" or "martial_art"

  const toggleAppMode = () => {
    setAppMode((prev) => (prev === "shooting" ? "martial_art" : "shooting"));
  };

  return (
    <>
      <div className="app-header">
        <div className="app-title">
          <h1>Pose Analysis System</h1>
        </div>
        <div className="app-controls">
          <LanguageSwitcher />
          <div className="app-mode-switcher">
            <button
              className={`mode-toggle-btn ${
                appMode === "shooting" ? "active" : ""
              }`}
              onClick={() => setAppMode("shooting")}
            >
              <span className="mode-icon">🎯</span>
              Shooting Mode
            </button>
            <button
              className={`mode-toggle-btn ${
                appMode === "martial_art" ? "active" : ""
              }`}
              onClick={() => setAppMode("martial_art")}
            >
              <span className="mode-icon">🥋</span>
              Martial Art Mode
            </button>
          </div>
        </div>
      </div>

      {appMode === "shooting" ? <ShootingStanceChecker /> : <MartialArt />}

      <style jsx>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: linear-gradient(
            90deg,
            #2c3e50 0%,
            #34495e 50%,
            #2c3e50 100%
          );
          border-bottom: 2px solid #3498db;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .app-title h1 {
          margin: 0;
          color: #ecf0f1;
          font-size: 1.8rem;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .app-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .app-mode-switcher {
          display: flex;
          gap: 8px;
        }

        .mode-toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 10px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #ecf0f1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mode-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }

        .mode-toggle-btn.active {
          background: #3498db;
          border-color: #3498db;
          color: white;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .mode-toggle-btn.active:hover {
          background: #2980b9;
          border-color: #2980b9;
        }

        .mode-icon {
          font-size: 1.1rem;
        }
      `}</style>
    </>
  );
}

export default App;
