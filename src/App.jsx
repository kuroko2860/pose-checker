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
      <LanguageSwitcher />
      <ShootingStanceChecker />
    </>
  );
}

export default App;
