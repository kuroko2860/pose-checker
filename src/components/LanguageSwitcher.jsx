import React from "react";
import { t, setLanguage, getLanguage } from "../utils/translations";

const LanguageSwitcher = () => {
  const currentLang = getLanguage();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Force re-render by updating localStorage or triggering a state change
    localStorage.setItem("preferredLanguage", lang);
    window.location.reload(); // Simple way to refresh the app with new language
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleLanguageChange("vi")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentLang === "vi"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            🇻🇳 VI
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentLang === "en"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            🇺🇸 EN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
