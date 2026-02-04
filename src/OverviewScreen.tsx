import { useEffect, useState } from "react";

export default function OverviewScreen({
  seconds = 12,
  onDone,
  onBack, // optional: go back to intro
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      if (key === "enter" || key === " " || key === "spacebar") {
        e.preventDefault();
        if (!isRevealed) {
          setIsRevealed(true);
          return;
        }
        onDone?.();
      } else if (key === "b") {
        // optional: go back to intro
        onBack?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDone, onBack, isRevealed]);

  // Tile component for the 4 steps
  const Tile = ({ title, subtitle }) => (

    <div
      style={{
        minWidth: 160,
        padding: 18,
        borderRadius: 14,
        textAlign: "center",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
      className="border-2 border-gray-300 bg-gray-50 "
    >
      <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 16, opacity: 0.8 }}>
        {subtitle}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white text-gray-900 grid place-items-center overflow-hidden font-sans">
      <div className="max-w-[960px] w-full text-center px-6">
        <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>
          What does a software engineer do?
        </div>

        {!isRevealed && (
          <div style={{ fontSize: 18, opacity: 0.7 }}>
            Press Space to reveal the rest
          </div>
        )}

        {isRevealed && (
          <>
            <div
              style={{
                fontSize: 22,
                opacity: 0.85,
                marginBottom: 26,
                lineHeight: 1.4,
              }}
            >
              We break problems into steps, tell a computer what to do, try it,
              and fix it until it works. You’ll see all four today.
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 28,
              }}
            >
              <Tile title="Build" subtitle="Make something (a program)" />
              <Tile title="Test" subtitle="Try it out" />
              <Tile title="Fix" subtitle="Find and correct mistakes" />
              <Tile title="Ship" subtitle="Share it with people" />
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <button
                onClick={() => onDone?.()}
                style={{
                  fontSize: 20,
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: "2px solid #111",
                  background: "#fff",
                  color: "#111",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Continue (Enter / Space)
              </button>

              <button
                onClick={() => onBack?.()}
                style={{
                  fontSize: 18,
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "2px dashed #666",
                  background: "#fff",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                Back to Intro (B)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
