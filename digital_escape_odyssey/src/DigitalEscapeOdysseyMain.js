import React, { useState } from "react";
import "./DigitalEscapeOdysseyMain.css";

// PUBLIC_INTERFACE
export function Timer({ timeLeft }) {
  /** Timer display for countdown */
  return (
    <div className="deo-timer">
      <span role="img" aria-label="timer" className="deo-timer-icon">
        ⏱️
      </span>
      <span className="deo-timer-value">{timeLeft}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ProgressTracker({ level, totalLevels }) {
  /** Shows user's progress through game levels */
  return (
    <div className="deo-progress-tracker">
      <span>
        Level {level} of {totalLevels}
      </span>
      <progress
        className="deo-progress-bar"
        value={level}
        max={totalLevels}
        aria-label="progress"
      />
    </div>
  );
}

// PUBLIC_INTERFACE
export function CluesDisplay({ clues }) {
  /** Sidebar panel listing available clues */
  return (
    <aside className="deo-clues-sidebar">
      <h2 className="deo-sidebar-title">Clues</h2>
      <ul className="deo-clues-list">
        {clues.length === 0
          ? <li className="deo-clue-empty">No clues yet!</li>
          : clues.map((clue, idx) => (
              <li key={idx} className="deo-clue">{clue}</li>
            ))}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
export function PuzzleInterface({ puzzle, onSubmit }) {
  /** Central area for displaying/interacting with the puzzle */
  return (
    <section className="deo-puzzle-interface">
      <h2 className="deo-main-title">{puzzle.title}</h2>
      <div className="deo-puzzle-desc">{puzzle.description}</div>
      {/* Placeholder: Replace with custom puzzle UI components */}
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(e.target.elements.solution.value);
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
        />
        <button className="deo-submit-btn" type="submit">
          Submit
        </button>
      </form>
    </section>
  );
}

// PUBLIC_INTERFACE
export default function DigitalEscapeOdysseyMain() {
  /**
   * The core container for Digital Escape Odyssey app.
   * Manages game state, layout and passes data to child components.
   */
  // Example placeholder state, to be replaced with backend/game logic later
  const [level, setLevel] = useState(1);
  const totalLevels = 3;
  const [clues, setClues] = useState(["Check the bookshelf.", "The clock hides a secret!"]);
  const [timeLeft, setTimeLeft] = useState("15:00");
  const [puzzle, setPuzzle] = useState({
    title: "The Library Lock",
    description: "Solve the riddle to unlock the next room: \nI have keys but no locks, space but no rooms. You can enter, but can’t go outside. What am I?"
  });

  // Placeholder handler for puzzle submission
  function handlePuzzleSubmit(solution) {
    // In real app: validate solution, update progress, give clues, etc.
    alert(`You submitted: ${solution}`);
  }

  return (
    <div className="deo-root deo-theme-light">
      <CluesDisplay clues={clues} />
      <main className="deo-main-area">
        <div className="deo-main-controls">
          <ProgressTracker level={level} totalLevels={totalLevels} />
          <Timer timeLeft={timeLeft} />
        </div>
        <PuzzleInterface puzzle={puzzle} onSubmit={handlePuzzleSubmit} />
      </main>
    </div>
  );
}
