import React, { useRef, useState } from "react";

/**
 * FlashlightAROverlay - Covers children with a blackout, except for a movable spotlight (circle) that reveals a portion.
 * Props:
 *   children: React nodes -- the content to overlay (e.g., puzzle, image)
 *   enabled: bool         -- whether to show the overlay
 *   revealRadius: number  -- radius of the circular reveal in px (default: 90)
 */
 // PUBLIC_INTERFACE
function FlashlightAROverlay({ enabled, children, revealRadius = 90 }) {
  const [light, setLight] = useState({
    x: null,
    y: null,
    active: false,
  });
  const containerRef = useRef();

  function handleMove(e) {
    let x, y;
    if (e.type.startsWith("touch")) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    setLight(l => ({ ...l, x, y, active: true }));
  }

  function handleLeave() {
    setLight({ x: null, y: null, active: false });
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchEnd={handleLeave}
    >
      {children}
      {enabled && light.active && light.x !== null && light.y !== null && (
        <div
          className="flashlight-overlay"
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 7,
            backdropFilter: "none",
            background: `radial-gradient(circle ${revealRadius}px at ${light.x}px ${light.y}px, rgba(255,255,255,0.01) 0%, rgba(32,31,54,0.4) 70%, rgba(0,0,0,0.94) 97%)`
          }}
        />
      )}
      {enabled && (!light.active || light.x === null) && (
        <div
          className="flashlight-overlay"
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 7,
            backdropFilter: "none",
            background: "rgba(0,0,0,0.93)"
          }}
        />
      )}
      {/* If AR is disabled, overlay not visible */}
    </div>
  );
}

export default FlashlightAROverlay;
