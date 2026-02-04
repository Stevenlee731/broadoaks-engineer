import { useState, useEffect } from "react";
import IntroScreen from "./IntroScreen";
import OverviewScreen from "./OverviewScreen";
import GridGame from "./GridGame"; // your grid game component

export default function App() {
  const [stage, setStage] = useState("intro"); // "intro" | "overview" | "game"

  // Optional: allow 'i' to replay intro at any time (panic reset)
  useEffect(() => {
    const handler = (e) => {
      if (e.key?.toLowerCase() === "i") {
        setStage("intro");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (stage === "intro") {
    return <IntroScreen onDone={() => setStage("overview")} />;
  }

  if (stage === "overview") {
    return (
      <OverviewScreen
        seconds={12}
        onDone={() => setStage("game")}
        onBack={() => setStage("intro")}
      />
    );
  }

  // stage === "game"
  return <GridGame onExit={() => setStage("intro")} />;
}