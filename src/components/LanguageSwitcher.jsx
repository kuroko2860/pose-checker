import React, { useState, useEffect, useRef } from "react";
import { t, setLanguage, getLanguage } from "../utils/translations";

const LanguageSwitcher = () => {
  const currentLang = getLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Force re-render by updating localStorage or triggering a state change
    localStorage.setItem("preferredLanguage", lang);
    setShowPopup(false);
    window.location.reload(); // Simple way to refresh the app with new language
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={togglePopup}
        className="text-white bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-2 flex items-center space-x-2 hover:bg-gray-700 transition-colors"
      >
        {currentLang === "vi" ? "🇻🇳" : "🇺🇸"}
        <span className="text-white text-sm font-medium ml-2">
          {currentLang.toUpperCase()}
        </span>
      </button>

      {showPopup && (
        <div
          ref={popupRef}
          className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-2"
        >
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleLanguageChange("vi")}
              className={`w-32 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentLang === "vi"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span>🇻🇳</span> <span>Tiếng Việt</span>
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-32 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentLang === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span>🇺🇸</span> <span>English</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
