import React, { useState, useEffect, useRef } from "react";
import "./DigitalEscapeOdysseyMain.css";
import EchoAI from "./EchoAI";
import "./EchoAI.css";
import FlashlightAROverlay from "./FlashlightAROverlay";

/**
 * Converts seconds to mm:ss
 */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// PUBLIC_INTERFACE
export function Timer({ timeLeftSecs }) {
  /** Timer display for countdown */
  return (
    <div className="deo-timer">
      <span role="img" aria-label="timer" className="deo-timer-icon">
        ⏱️
      </span>
      <span className="deo-timer-value">{formatTime(timeLeftSecs)}</span>
    </div>
  );
}

/**
 * List of Room Data (story, puzzle, hints)
 * Each room: { intro, puzzle: {title, description, solution}, hints: [str, str] }
 */
const ROOMS = [
  {
    intro:
      "You awaken in the Data Library, neon lights flicker across endless shelves stuffed with information. The door forward is locked by a digital riddle.",
    puzzle: {
      title: "Room 1: Cyber Library Lock",
      description:
        "Crack the riddle to access the next sector:\nI have keys but no locks, space but no rooms. You can enter, but can’t go outside. What am I?",
      solution: "keyboard", // Lowercase
    },
    hints: [
      "This object is in front of you whenever you use a computer.",
      "It has keys, but those keys can't open your front door."
    ],
  },
  {
    intro:
      "Passing through, you arrive at the Neon Server Farm. Humming machines surround you. The door projects a shimmering code lock.",
    puzzle: {
      title: "Room 2: Neon Cipher Gate",
      description:
        "Decrypt the clue:\nWhat English word retains its pronunciation, even after you take away four of its five letters?",
      solution: "queue", // Lowercase
    },
    hints: [
      "Think of waiting in line. What’s a British word for a line?",
      "It sounds the same, even as letters disappear..."
    ],
  },
  {
    intro:
      "The next room is a Virtual Reality Arcade, games whirring in the darkness. An old console flashes symbols at you.",
    puzzle: {
      title: "Room 3: Arcade Pattern Challenge",
      description:
        "Match the pattern: What 4-letter word can be written forward, backward or upside down, and can still be read from left to right?",
      solution: "noon", // Lowercase
    },
    hints: [
      "It’s a time of day–think of the hands on a digital clock.",
      "N-O-O-N is the same even upside down."
    ],
  },
  {
    intro:
      "Through a curtain of static, you step into the Cyber Alley. Neon graffiti spells a strange word on a wall-screen.",
    puzzle: {
      title: "Room 4: Alley Anagram",
      description:
        "Unscramble the neon letters: 'RGAOMRP'.\n(Hint: Coder's best friend)",
      solution: "program", // Lowercase
    },
    hints: [
      "It's something you write to make computers obey.",
      "Starts and ends with the same letter."
    ],
  },
  {
    intro:
      "Final chamber: the Quantum Core. Jet streams of code flow through glass walls. You face the last cipher before freedom.",
    puzzle: {
      title: "Room 5: Quantum Escape",
      description:
        "Enter the correct password: What comes once in a minute, twice in a moment, but never in a thousand years?",
      solution: "m", // Lowercase
    },
    hints: [
      "Read the riddle very, very literally.",
      "It's a single letter, and it's in the word minute..."
    ],
  },
];

const TOTAL_LEVELS = ROOMS.length;

// PUBLIC_INTERFACE
export function ProgressTracker({ level, totalLevels }) {
  /** Shows user's progress through game levels */
  return (
    <div className="deo-progress-tracker">
      <span>
        Level {level + 1} of {totalLevels}
      </span>
      <progress
        className="deo-progress-bar"
        value={level + 1}
        max={totalLevels}
        aria-label="progress"
      />
    </div>
  );
}

/**
 * Clues sidebar (shows discovered hints for the current room)
 */
export function CluesDisplay({ revealedClues }) {
  return (
    <aside className="deo-clues-sidebar">
      <h2 className="deo-sidebar-title">Clues</h2>
      <ul className="deo-clues-list">
        {revealedClues.length === 0
          ? <li className="deo-clue-empty">No clues yet!</li>
          : revealedClues.map((clue, idx) => (
              <li key={idx} className="deo-clue">{clue}</li>
            ))}
      </ul>
    </aside>
  );
}

/**
 * Puzzle and room display with hints button and level info.
 */
export function PuzzleInterface({
  roomIdx,
  room,
  inputValue,
  onInputChange,
  onSubmit,
  showSuccess,
  showError,
  revealedHints,
  hintCount,
  onHintClick,
  canUseHint,
  isLastRoom,
  timeLeftSecs,
  gameComplete,
  onNextRoom
}) {
  return (
    <section className="deo-puzzle-interface">
      <h2 className="deo-main-title">{room.puzzle.title}</h2>
      <div className="deo-puzzle-desc">
        <strong>Room {roomIdx + 1}:</strong> {room.intro}
        <br />
        <span style={{ color: "var(--deo-accent)" }}>{room.puzzle.description}</span>
      </div>
      {showSuccess && (
        <div style={{ color: "var(--deo-accent2)", fontWeight: 700, marginBottom: 12 }}>
          <span role="img" aria-label="success">✔️</span> Unlocked! {isLastRoom ? "You've completed your final challenge – Welcome to freedom!" : "Proceed to the next room!"}
        </div>
      )}
      {showError && (
        <div style={{ color: "var(--deo-secondary)", fontWeight: 500, marginBottom: 12 }}>
          <span role="img" aria-label="wrong">❌</span> Incorrect solution. Try again!
        </div>
      )}
      {gameComplete ? (
        <div style={{ color: "var(--deo-accent2)", fontWeight: 700, fontSize: "1.2em", padding: 20 }}>
          🎉 You Escaped the Digital Odyssey! 🎉
        </div>
      ) : (
        <>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSubmit(inputValue);
            }}
            className="deo-puzzle-form"
          >
            <input
              name="solution"
              className="deo-input"
              type="text"
              placeholder="Enter solution..."
              required
              autoComplete="off"
              value={inputValue}
              onChange={e => onInputChange(e.target.value)}
              disabled={showSuccess}
            />
            <button className="deo-submit-btn" type="submit" disabled={showSuccess}>
              Submit
            </button>
          </form>
          <button
            className="btn"
            onClick={onHintClick}
            disabled={!canUseHint}
            style={{
              background: canUseHint ? "var(--deo-accent2)" : "#333840",
              color: "#12112b",
              marginTop: 6,
              fontWeight: 600,
              boxShadow: canUseHint
                ? "0 0 17px #00ff9f, 0 0 7px #08f7fe55"
                : "none"
            }}
          >
            Reveal Hint ({hintCount}/2)
          </button>
          {showSuccess && !gameComplete && (
            <button
              style={{ marginLeft: 18, marginTop: 12, padding: "10px 22px",
                  fontWeight: 900, background: "var(--deo-primary)", color: "#181624",
                  border: "2.5px solid var(--deo-secondary)",
                  borderRadius: 5, boxShadow: "0 0 14px #08f7fe" }}
              onClick={onNextRoom}
            >
              Next Room &rarr;
            </button>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Main game container for Digital Escape Odyssey
 * Handles levels, puzzles, timer, hints, and room progression.
 */
// PUBLIC_INTERFACE
export default function DigitalEscapeOdysseyMain() {
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0); // 0-based index of current room
  const [revealedHintsArr, setRevealedHintsArr] = useState(Array(TOTAL_LEVELS).fill([])); // Array of arrays
  const [hintCounts, setHintCounts] = useState(Array(TOTAL_LEVELS).fill(0));
  const [inputValue, setInputValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  // Camera & AR feature states (Flashlight only):
  const [showFlashlight, setShowFlashlight] = useState(false);

  // Track per-room answer history: { timeTaken, wrongAttempts, usedHint }
  const [answerHistory, setAnswerHistory] = useState(
    Array(TOTAL_LEVELS)
      .fill()
      .map(() => ({
        wrongAttempts: 0,
        usedHint: false,
        timeTaken: 0,
      }))
  );
  const answerStartTimeRef = useRef(Date.now());

  const TIMER_START_SECS = 300; // 5 minutes
  const [timeLeftSecs, setTimeLeftSecs] = useState(TIMER_START_SECS);

  // Timer controls + ref
  const timerIntervalRef = useRef();

  // Reset states as you change room
  useEffect(() => {
    setInputValue("");
    setShowSuccess(false);
    setShowError(false);
    setTimeLeftSecs(TIMER_START_SECS);

    // Reset answer start time on room switch (for EchoAI time tracking)
    answerStartTimeRef.current = Date.now();

    // Reset any non-persistent states, but leave answerHistory
    // Clear timer interval for previous room!
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeftSecs(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [currentRoomIdx]);

  // Timer lose condition
  useEffect(() => {
    if (timeLeftSecs === 0 && !showSuccess && !gameComplete) {
      setShowError(false);
      setShowSuccess(false);
      setGameComplete(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [timeLeftSecs, showSuccess, gameComplete]);

  // Puzzle submission logic
  function handleInputChange(val) {
    setInputValue(val);
    setShowError(false);
  }

  // AR Flashlight
  function handleStartFlashlight() {
    setShowFlashlight(s => !s);
  }
  function handleFlashlightClose() {
    setShowFlashlight(false);
  }

  function handleHintClick() {
    // Reveal one more hint for this room (up to 2)
    if (hintCounts[currentRoomIdx] < 2) {
      const nextHintIdx = hintCounts[currentRoomIdx];
      const nextHint = ROOMS[currentRoomIdx].hints[nextHintIdx];
      setRevealedHintsArr(arr =>
        arr.map((hArr, idx) =>
          idx === currentRoomIdx ? [...hArr, nextHint] : hArr
        )
      );
      setHintCounts(arr =>
        arr.map((c, idx) => (idx === currentRoomIdx ? c + 1 : c))
      );
      // Mark this room's usedHint as true in answerHistory (for EchoAI)
      setAnswerHistory(arr =>
        arr.map((entry, idx) =>
          idx === currentRoomIdx ? { ...entry, usedHint: true } : entry
        )
      );
    }
  }

  function handlePuzzleSubmit(solution) {
    if (showSuccess || gameComplete) return;
    const canonical = s => (s || "").trim().toLowerCase();
    if (canonical(solution) === canonical(ROOMS[currentRoomIdx].puzzle.solution)) {
      setShowSuccess(true);
      setShowError(false);
      // Calculate time taken to answer
      const answeredAt = Date.now();
      const secondsToAnswer = Math.round((answeredAt - answerStartTimeRef.current) / 1000);
      setAnswerHistory(arr =>
        arr.map((entry, idx) =>
          idx === currentRoomIdx
            ? { ...entry, timeTaken: entry.timeTaken || secondsToAnswer }
            : entry
        )
      );
      setTimeout(() => {
        // If last room, complete game!
        if (currentRoomIdx === TOTAL_LEVELS - 1) {
          setGameComplete(true);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
      }, 500);
    } else {
      setShowError(true);
      // Increment wrongAttempts for this room for EchoAI tracking
      setAnswerHistory(arr =>
        arr.map((entry, idx) =>
          idx === currentRoomIdx
            ? { ...entry, wrongAttempts: (entry.wrongAttempts || 0) + 1 }
            : entry
        )
      );
    }
  }

  function handleNextRoom() {
    // Go to the next room, reset states
    if (currentRoomIdx < TOTAL_LEVELS - 1) {
      setCurrentRoomIdx(idx => idx + 1);
    }
  }

  // If game is complete, show a final Brave Escape screen
  const room = ROOMS[currentRoomIdx];
  const revealedClues = revealedHintsArr[currentRoomIdx] || [];
  const hintCount = hintCounts[currentRoomIdx];
  const canUseHint = hintCount < (room.hints.length);

  return (
    <div className="deo-root deo-theme-cyberpunk" style={{ display: "flex", flexDirection: "row" }}>
      <CluesDisplay
        revealedClues={revealedClues}
      />
      <main className="deo-main-area">
        <div className="deo-main-controls">
          <ProgressTracker level={currentRoomIdx} totalLevels={TOTAL_LEVELS} />
          <Timer timeLeftSecs={timeLeftSecs} />
          {/* Camera/AR actions demo control (flashlight only) */}
          <button
            className="btn"
            style={{
              marginLeft: 8,
              background: showFlashlight ? "#fe53bb" : "#23266d",
              color: showFlashlight ? "#fff" : "#fffe",
            }}
            onClick={handleStartFlashlight}
          >
            {showFlashlight ? "Disable Flashlight" : "Activate Flashlight Mode"}
          </button>
        </div>

        {showFlashlight ? (
          <FlashlightAROverlay enabled revealRadius={90}>
            <div style={{ padding: 28, maxWidth: 420, position: "relative" }}>
              {/* Sample secret message or puzzle — could use room-specific props */}
              <div style={{ color: "#fffbe7", fontSize: "1.18em" }}>
                <span style={{
                  opacity: 0.22,
                  fontStyle: "italic",
                  fontWeight: 500
                }}>
                  "Shine your flashlight to reveal the invisible ink message..."<br />
                  <span style={{
                    color: "#f5d300",
                    opacity: showFlashlight ? 0.98 : 0,
                    fontWeight: 700,
                  }}>
                    Secret: THE CODE IS CYBER42!
                  </span>
                </span>
              </div>
              <button
                className="btn"
                style={{ marginTop: 20, background: "var(--deo-secondary)", color: "#fff" }}
                onClick={handleFlashlightClose}
              >
                Close Flashlight AR
              </button>
            </div>
          </FlashlightAROverlay>
        ) : (
          <PuzzleInterface
            roomIdx={currentRoomIdx}
            room={room}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSubmit={handlePuzzleSubmit}
            showSuccess={showSuccess}
            showError={showError}
            revealedHints={revealedClues}
            hintCount={hintCount}
            onHintClick={handleHintClick}
            canUseHint={canUseHint && !gameComplete && !showSuccess}
            isLastRoom={currentRoomIdx === TOTAL_LEVELS - 1}
            timeLeftSecs={timeLeftSecs}
            gameComplete={gameComplete}
            onNextRoom={handleNextRoom}
          />
        )}
        {/* Stub for AR/Camera feature extension area */}
      </main>
      {/* ECHO AI SIDEBAR */}
      <EchoAI
        roomIdx={currentRoomIdx}
        totalRooms={TOTAL_LEVELS}
        puzzleTitle={room.puzzle.title}
        timerSecs={timeLeftSecs}
        timerTotal={300}
        answerHistory={answerHistory}
        hintCount={hintCount}
        maxHints={room.hints.length}
        onRequestHint={canUseHint && !showSuccess && !gameComplete ? handleHintClick : undefined}
        puzzleHints={room.hints}
        showSuccess={showSuccess}
        gameComplete={gameComplete}
      />
    </div>
  );
}
