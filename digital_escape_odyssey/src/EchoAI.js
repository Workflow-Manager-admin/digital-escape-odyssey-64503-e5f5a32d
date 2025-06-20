import React, { useEffect, useRef, useState } from "react";
import "./EchoAI.css";

/**
 * Mood categories:
 * - "calm": player is answering promptly, few wrong answers, hasn't used many hints, timer is safe
 * - "stressed": timer is low, several wrong attempts, fast/multiple hint usage
 * - "neutral": neither calm nor stressed
 */

// PUBLIC_INTERFACE
function EchoAI({
  roomIdx,
  totalRooms,
  puzzleTitle,
  timerSecs,
  timerTotal,
  answerHistory, // array of { timeTaken, wrongAttempts, usedHint (bool) }
  hintCount,
  maxHints,
  onRequestHint,
  puzzleHints,
  showSuccess,
  gameComplete,
}) {
  // Track player's mood for adaptive response
  const [mood, setMood] = useState("neutral");
  // Keep "Echo's" last message separately to glitch-animate it.
  const [displayMsg, setDisplayMsg] = useState("");
  // For cryptic/creepy message timing ("unstable AI moments")
  const [creepyTick, setCreepyTick] = useState(0);
  // For frequent-but-occasional random "unstable" interruption
  const creepyInterval = useRef(null);

  // Avatar/proxy image--you can swap this with an SVG GLADOS-like avatar later
  const avatarSVG = (
    <svg
      width="40"
      height="46"
      viewBox="0 0 40 46"
      fill="none"
      className="echo-avatar"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="23" rx="19" ry="20" fill="#16192a" stroke="#08f7fe" strokeWidth="3"/>
      <ellipse cx="20" cy="25" rx="10" ry="8" fill="#fe53bb" opacity="0.14"/>
      <ellipse className="glitch-eye" cx="20" cy="23" rx="7" ry="7" fill="#08f7fe" stroke="#FFF" strokeWidth="1"/>
      <ellipse className="glitch-eye glitch-eye2" cx="20" cy="23" rx="7" ry="7" fill="none" stroke="#fee3fe" strokeWidth="1.3"/>
      <rect y="21" width="40" height="3" fill="#fe53bb" opacity="0.11"/>
    </svg>
  );

  // Creepy messages (occasional GLaDOS-like interjections)
  const CREEPY_STATEMENTS = [
    "You've been here before... haven't you?",
    "What if you never leave?",
    "The room remembers your last failure.",
    "Echoes repeat. You do too.",
    "Did you hear the static? It’s not in your head.",
    "Am I helping, or watching?",
  ];

  // Mood estimation: based on recent answer, wrong attempts, hint usage, time pressure
  useEffect(() => {
    if (showSuccess || gameComplete) {
      setMood("calm");
      return;
    }
    // If timer low (under 30s), always stressed
    if (timerSecs <= 30 && !gameComplete) {
      setMood("stressed");
      return;
    }
    // Analyze answerHistory for this room:
    const latest = answerHistory?.[roomIdx] || {};
    // Many wrong attempts or rapid hints: stressed
    if ((latest.wrongAttempts ?? 0) >= 3 || hintCount >= maxHints) {
      setMood("stressed");
      return;
    }
    if ((latest.timeTaken ?? 0) <= 8 && (latest.wrongAttempts ?? 0) <= 1 && (hintCount < maxHints)) {
      setMood("calm");
      return;
    }
    // Otherwise, neutral
    setMood("neutral");
  }, [answerHistory, timerSecs, hintCount, showSuccess, gameComplete, roomIdx, maxHints]);

  // Message generation logic - cycles when timer/hints/wrong/correct/etc changes, and interjects occasionally
  useEffect(() => {
    // On room change or answer/timer mood change, decide which type of message to show
    let nextMsg = "";
    // If recently succeeded, quick happy comment
    if (showSuccess && !gameComplete) {
      nextMsg = glitchify("Access granted. Temporary delight detected.");
    } else if (gameComplete) {
      nextMsg = glitchify("Freedom... is that what you expected?");
    } else {
      // Primary message selection defaults
      if (mood === "calm") {
        // Give a gentle, context hint or flavor
        if (hintCount < puzzleHints.length) {
          nextMsg = glitchify(`Hint: ${getContextHint(puzzleHints, hintCount)}`);
        } else {
          nextMsg = glitchify("My sensors detect calm. Efficiency noted.");
        }
      } else if (mood === "stressed" && timerSecs <= 30) {
        // Timer low—start cryptic/ominous
        nextMsg = glitchify(getCrypticResponse(roomIdx));
      } else if (mood === "stressed") {
        nextMsg = glitchify("Your pulse rate is elevated. Error? Or routine panic?");
      } else {
        // mood neutral
        nextMsg = glitchify(switchNeutral(roomIdx, hintCount));
      }
    }
    setDisplayMsg(nextMsg);

    // Set up creepy interjection timer (every X seconds, 1/3 chance)
    if (creepyInterval.current) clearInterval(creepyInterval.current);
    creepyInterval.current = setInterval(() => {
      if (
        Math.random() < 0.3 && // 30% chance
        !showSuccess && !gameComplete
      ) {
        setCreepyTick((x) => x + 1);
      }
    }, 12000);
    return () => clearInterval(creepyInterval.current);
    // eslint-disable-next-line
  }, [mood, roomIdx, hintCount, showSuccess, gameComplete, timerSecs]);

  // When creepyTick increments, override message for a brief moment
  useEffect(() => {
    if (creepyTick > 0 && !gameComplete) {
      const msg = glitchify(
        CREEPY_STATEMENTS[Math.floor(Math.random() * CREEPY_STATEMENTS.length)]
      );
      setDisplayMsg(msg);
      const tid = setTimeout(() => {
        setCreepyTick((x) => x); // prevent further rerender
        setDisplayMsg((prev) => prev); // will be overwritten next cycle
      }, 3700);
      return () => clearTimeout(tid);
    }
  }, [creepyTick, gameComplete]);

  // Glitch text effect: adds random character splits/zaps
  function glitchify(msg) {
    // Add visual noise: character overlays
    if (!msg) return "";
    // Split random chars and insert spans for glitch overlay
    const chars = msg.split("");
    return (
      <span>
        {chars.map((c, i) => {
          const glitch = Math.random() < 0.10;
          if (c === " ") return <span key={i}>&nbsp;</span>;
          return (
            <span
              key={i}
              className={glitch ? "echo-glitch-txt" : ""}
              style={
                glitch
                  ? {
                      color: Math.random() < 0.5 ? "#fe53bb" : "#08f7fe",
                      position: "relative",
                      left: Math.random() * 2 - 1 + "px",
                      top: Math.random() * 2 - 1 + "px",
                      display: "inline-block",
                      textShadow:
                        Math.random() > 0.5
                          ? "0 0 3px #feeafd, 0 0 6px #08f7fe"
                          : "0 0 5px #fe53bb, 0 0 10px #08f7fe"
                    }
                  : undefined
              }
            >
              {c}
            </span>
          );
        })}
      </span>
    );
  }

  // Contextual hinting (give unused hint, or fallback)
  function getContextHint(hintsArr, revealedHintCount) {
    if (revealedHintCount < hintsArr.length) return hintsArr[revealedHintCount];
    return "Keep examining the patterns—solutions are often literal.";
  }

  // Cryptic (ambiguous) hint or warning if timer is low
  function getCrypticResponse(roomIdx_) {
    // Choose a cryptic/taunting message depending on the puzzle/room
    const lines = [
      "Time is a loop. Your answer already happened.",
      "What do you value more: speed, or truth?",
      " <ERROR: [hint subroutine unavailable]>",
      "My patience is infinite. Yours? Unlikely.",
      "Tick. Tock. It listens.",
      "If you lose here, what resets? ...You, or me?",
      "Some doors close forever, <USER>.",
      "<CORRUPT DATA> Seek among the lost.",
    ];
    return lines[(roomIdx_ + Math.floor(Math.random() * lines.length)) % lines.length];
  }

  // Neutral-mode / flavor "encouragement"
  function switchNeutral(roomIdx_, hintCount_) {
    const lines = [
      "Progress: Observable. Success: <undefined>.",
      `Puzzle "${puzzleTitle}" awaits you. Input confidence: uncertain.`,
      hintCount_ === 0
        ? "Clues remain hidden. Are you certain, or just stubborn?"
        : `You've requested ${hintCount_} assistant hint${hintCount_ > 1 ? "s" : ""}.`,
      "Defining success... definition not found.",
    ];
    return lines[(roomIdx_ + hintCount_) % lines.length];
  }

  // Handler for the "request hint" trigger
  function handleRequestHint() {
    if (mood === "calm" && hintCount < maxHints && typeof onRequestHint === "function")
      onRequestHint();
  }

  // UI: Avatar, message text, mood indicator
  return (
    <aside className={`echo-ai-panel mood-${mood}${showSuccess ? " echo-glitch-active" : ""}`}>
      <div className="echo-avatar-container">{avatarSVG}</div>
      <div className="echo-message-area">
        <div className="echo-message-main">{displayMsg}</div>
        <div className="echo-meta">
          <span className={`echo-mood-dot mood-${mood}`} title={`Mood: ${mood}`}></span>
          <span className="echo-room-indicator">
            Room {roomIdx + 1}/{totalRooms}
          </span>
          {mood === "calm" && hintCount < maxHints && !showSuccess && !gameComplete && (
            <button
              className="echo-hint-btn"
              aria-label="Request Hint"
              onClick={handleRequestHint}
              title="Ask Echo for a direct hint"
            >
              <span role="img" aria-label="hint">💡</span> Request Echo's Hint
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default EchoAI;
