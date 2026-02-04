import { useState, useEffect } from "react";

export default function RobotGame() {
  // Grid constants
  const GRID_SIZE = 5;
  const GOAL = { x: 4, y: 4 };
  const OBSTACLES = [
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ];

  // Robot state: position + direction (0=right, 90=down, 180=left, 270=up)
  const [robot, setRobot] = useState({ x: 0, y: 0, direction: 0 });

  // Instruction queue
  const [queue, setQueue] = useState([]);

  // Game status: "idle" | "running" | "completed" | "error"
  const [status, setStatus] = useState("idle");

  // Current step during execution
  const [currentStep, setCurrentStep] = useState(0);

  // Show pseudo code toggle
  const [showPseudoCode, setShowPseudoCode] = useState(false);

  // Helper: Check if position is an obstacle
  const isObstacle = (x, y) => {
    return OBSTACLES.some((obs) => obs.x === x && obs.y === y);
  };

  // Helper: Check if position is out of bounds
  const isOutOfBounds = (x, y) => {
    return x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
  };

  // Helper: Check if robot reached goal
  const isAtGoal = (x, y) => {
    return x === GOAL.x && y === GOAL.y;
  };

  // Calculate new position when moving forward
  const moveForward = (currentRobot) => {
    let newX = currentRobot.x;
    let newY = currentRobot.y;

    // direction: 0=right, 90=down, 180=left, 270=up
    switch (currentRobot.direction) {
      case 0: // right
        newX += 1;
        break;
      case 90: // down
        newY += 1;
        break;
      case 180: // left
        newX -= 1;
        break;
      case 270: // up
        newY -= 1;
        break;
    }

    // Check bounds
    if (isOutOfBounds(newX, newY)) {
      throw new Error("Out of bounds!");
    }

    // Check obstacles
    if (isObstacle(newX, newY)) {
      throw new Error("Hit an obstacle!");
    }

    return { ...currentRobot, x: newX, y: newY };
  };

  // Turn left: subtract 90 degrees (mod 360)
  const turnLeft = (currentRobot) => {
    return { ...currentRobot, direction: (currentRobot.direction + 270) % 360 };
  };

  // Turn right: add 90 degrees (mod 360)
  const turnRight = (currentRobot) => {
    return { ...currentRobot, direction: (currentRobot.direction + 90) % 360 };
  };

  // Add instruction to queue
  const addInstruction = (command) => {
    if (status === "running") return;
    setQueue([...queue, command]);
  };

  // Run the instruction queue
  const runQueue = async () => {
    if (queue.length === 0) return;
    if (status === "running") return;

    setStatus("running");
    setCurrentStep(0);

    let currentRobot = { ...robot };

    try {
      for (let i = 0; i < queue.length; i++) {
        setCurrentStep(i);

        // Wait 800ms before executing
        await new Promise((resolve) => setTimeout(resolve, 800));

        const instruction = queue[i];

        // Execute instruction
        switch (instruction) {
          case "FORWARD":
            currentRobot = moveForward(currentRobot);
            break;
          case "LEFT":
            currentRobot = turnLeft(currentRobot);
            break;
          case "RIGHT":
            currentRobot = turnRight(currentRobot);
            break;
        }

        // Update robot position
        setRobot(currentRobot);

        // Check win condition
        if (isAtGoal(currentRobot.x, currentRobot.y)) {
          setStatus("completed");
          setCurrentStep(-1);
          return;
        }
      }

      // Finished queue without error or win
      setStatus("idle");
      setCurrentStep(-1);
    } catch (error) {
      // Error encountered (obstacle or out of bounds)
      setStatus("error");
      setCurrentStep(-1);
    }
  };

  // Reset game
  const reset = () => {
    setRobot({ x: 0, y: 0, direction: 0 });
    setQueue([]);
    setStatus("idle");
    setCurrentStep(-1);
  };

  // Undo last instruction
  const undo = () => {
    if (status === "running") return;
    if (queue.length === 0) return;
    setQueue(queue.slice(0, -1));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (status === "running") return;

      switch (e.key) {
        case "1":
          addInstruction("FORWARD");
          break;
        case "2":
          addInstruction("LEFT");
          break;
        case "3":
          addInstruction("RIGHT");
          break;
        case " ":
          e.preventDefault();
          runQueue();
          break;
        case "r":
        case "R":
          reset();
          break;
        case "u":
        case "U":
          undo();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, queue, robot]);

  // Render grid
  const renderGrid = () => {
    const tiles = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isGoalTile = x === GOAL.x && y === GOAL.y;
        const isObstacleTile = isObstacle(x, y);
        const hasRobot = robot.x === x && robot.y === y;

        let tileClass = "flex items-center justify-center rounded-[12px] border-4 transition-all duration-200 aspect-square";

        if (isGoalTile) {
          tileClass += " bg-green-200 border-green-500";
        } else if (isObstacleTile) {
          tileClass += " bg-gray-400 border-gray-600";
        } else {
          tileClass += " bg-blue-100 border-blue-300";
        }

        tiles.push(
          <div key={`${x}-${y}`} className={tileClass}>
            {hasRobot && (
              <div
                className="text-[72px] transition-all duration-800"
                style={{ transform: `rotate(${robot.direction}deg)` }}
              >
                🐻
              </div>
            )}
            {isGoalTile && !hasRobot && <div className="text-[72px]">🏫</div>}
            {isObstacleTile && <div className="text-[72px]">🚧</div>}
          </div>
        );
      }
    }
    return tiles;
  };

  // Render instruction queue
  const renderQueue = () => {
    if (queue.length === 0) {
      return (
        <div className="text-[22px] opacity-60 italic px-6 py-3">
          No instructions yet
        </div>
      );
    }

    return queue.map((instruction, index) => {
      const isCurrentStep = status === "running" && index === currentStep;
      let icon = "";
      let label = "";

      switch (instruction) {
        case "FORWARD":
          icon = "⬆️";
          label = "Move Forward";
          break;
        case "LEFT":
          icon = "↪️";
          label = "Turn Left";
          break;
        case "RIGHT":
          icon = "↩️";
          label = "Turn Right";
          break;
      }

      const itemClass = isCurrentStep
        ? "text-[22px] rounded-[10px] bg-yellow-200 border-4 border-yellow-500 font-extrabold px-6 py-3"
        : "text-[22px] rounded-[10px] bg-white border-2 border-gray-300 px-6 py-3";

      return (
        <div key={index} className={itemClass} style={{marginBottom: "1rem", padding: "0.5rem 1rem"}}>
          {index + 1}. {icon} {label}
        </div>
      );
    });
  };

  // Render pseudo code
  const renderPseudoCode = () => {
    if (queue.length === 0) {
      return (
        <div className="text-[20px] opacity-60 italic font-mono px-4 py-2">
          // No code yet
        </div>
      );
    }

    return queue.map((instruction, index) => {
      const isCurrentStep = status === "running" && index === currentStep;
      let code = "";

      switch (instruction) {
        case "FORWARD":
          code = "bear.moveForward();";
          break;
        case "LEFT":
          code = "bear.turnLeft();";
          break;
        case "RIGHT":
          code = "bear.turnRight();";
          break;
      }

      const lineClass = isCurrentStep
        ? "text-[20px] font-mono bg-yellow-200 font-extrabold px-4 py-2"
        : "text-[20px] font-mono px-4 py-2";

      return (
        <div key={index} className={lineClass}>
          {code}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center gap-6 mb-8">
          <h1 className="text-[48px] font-extrabold text-center">
            Broadoaks Bear Goes To School!
          </h1>
        </div>

        <div className="flex  items-start justify-center gap-8" style={{gap: "2rem"}}>
          {/* Left Column - Controls */}
          <div className="flex flex-col gap-6 w-[500px]">
            {/* Add Instruction Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => addInstruction("FORWARD")}
                disabled={status === "running"}
                style={{marginBottom: "1rem"}}
                className="text-[28px] px-8 py-5 rounded-[16px] bg-blue-500 text-white border-4 border-blue-700 font-extrabold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                ⬆️ Move Forward (1)
              </button>

              <button
                onClick={() => addInstruction("LEFT")}
                disabled={status === "running"}
                style={{marginBottom: "1rem"}}
                className="text-[28px] px-8 py-5 rounded-[16px] bg-blue-500 text-white border-4 border-blue-700 font-extrabold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                ↪️ Turn Left (2)
              </button>

              <button
                onClick={() => addInstruction("RIGHT")}
                disabled={status === "running"}
                style={{marginBottom: "1rem"}}
                className="text-[28px] px-8 py-5 rounded-[16px] bg-blue-500 text-white border-4 border-blue-700 font-extrabold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                ↩️ Turn Right (3)
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={runQueue}
                disabled={status === "running" || queue.length === 0}
                style={{marginBottom: "1rem"}}
                className="text-[28px] px-8 py-5 rounded-[16px] bg-green-500 text-white border-4 border-green-700 font-extrabold disabled:opacity-50 hover:bg-green-600 transition-colors"
              >
                ▶️ Run (Space)
              </button>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  style={{marginRight: "1rem"}}
                  className={`flex-1 text-[24px] px-6 py-4 rounded-[14px] bg-red-500 text-white border-4 border-red-700 font-bold hover:bg-red-600 transition-colors ${
                    status === "error" ? "animate-pulse" : ""
                  }`}
                >
                  🔄 Reset (R)
                </button>

                <button
                  onClick={undo}
                  disabled={status === "running" || queue.length === 0}
                  className="flex-1 text-[24px] px-6 py-4 rounded-[14px] bg-gray-500 text-white border-4 border-gray-700 font-bold disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  ↶ Undo (U)
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {status === "completed" && (
              <div className="text-[36px] font-extrabold text-green-600 text-center animate-bounce">
                🎉 You did it! 🎉
              </div>
            )}

            {status === "error" && (
              <div className="text-[28px] font-bold text-red-600 text-center">
                ⚠️ Oops! Bug found! Fix it and try again.
              </div>
            )}
          </div>

          {/* Middle Column - Grid */}
          <div>
            <div className="grid grid-cols-5 gap-4 w-[600px] h-[600px]">
              {renderGrid()}
            </div>
          </div>

          {/* Right Column - Instruction Queue */}
          <div className="flex flex-col gap-6 w-[500px] h-[600px]">
            {/* Instruction Queue */}
            <div
              className={`border-4 border-gray-300 rounded-[16px] bg-gray-50 min-h-[200px] p-6 text-left ${
                showPseudoCode ? "" : "h-full"
              }`}
            >
              <div className="px-4">
                <h2 className="text-[28px] font-extrabold mb-4" style={{paddingLeft: "1.5rem"}}>
                  Instruction Queue:
                </h2>
                <div className="flex flex-col gap-3" style={{paddingLeft: "1.5rem", paddingRight: "1.5rem"}}>{renderQueue()}</div>
              </div>
            </div>

            {/* Pseudo Code Display */}
            {showPseudoCode && (
              <div className="border-4 border-purple-500 rounded-[16px] bg-purple-50 min-h-[200px] p-6">
                <h2 className="text-[28px] font-extrabold text-purple-700 mb-4">
                  💻 Pseudo Code:
                </h2>
                <div className="bg-gray-900 text-green-400 rounded-[10px] font-mono flex flex-col p-6 gap-2">
                  {renderPseudoCode()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
