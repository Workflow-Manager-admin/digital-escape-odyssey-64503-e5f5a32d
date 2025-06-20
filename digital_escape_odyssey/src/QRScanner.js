import React, { useRef, useEffect, useState } from "react";

/**
 * QRScanner - Opens camera, scans QR codes using getUserMedia and external library if needed.
 * Props:
 *    onScan(resultText: string) => void    // Called with QR code data on detection
 *    onClose() => void                     // Called when the scanner is closed
 */
// PUBLIC_INTERFACE
function QRScanner({ onScan, onClose }) {
  // Using qr-scanner library would be ideal, or a fallback to basic canvas if unavailable.
  const videoRef = useRef();
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [stream, setStream] = useState(null);

  // Try to load the QR Scanner library only if present, else fallback to note.
  useEffect(() => {
    let localStream;
    let animationId;
    let scanningActive = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (e) {
        setError("Could not access camera – permission denied or unavailable.");
      }
    }

    startCamera();

    // Live decode loop using jsQR if present in window, else show message
    async function tick() {
      if (!videoRef.current || !scanningActive) return;
      const video = videoRef.current;
      if (video.readyState === 4) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
          // Use jsQR library from global (expected to be loaded somewhere), for accuracy.
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR(imageData.data, canvas.width, canvas.height);
          if (code) {
            setScanning(false);
            scanningActive = false;
            cleanup();
            if (onScan) onScan(code.data);
            return;
          }
        }
      }
      animationId = requestAnimationFrame(tick);
    }

    animationId = requestAnimationFrame(tick);

    function cleanup() {
      scanningActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      cleanup();
    };
  }, [onScan]);

  function handleManualClose() {
    setScanning(false);
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (onClose) onClose();
  }

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <video ref={videoRef} autoPlay playsInline style={{ width: "320px", height: "240px", borderRadius: 8, background: "#181624" }} />
        <div style={{ color: "#fff", marginTop: 12, fontWeight: 500 }}>
          Point camera at QR code to reveal a bonus clue.
          <br />
          {!window.jsQR && (
            <span style={{ color: "#fe53bb", fontSize: "0.96em" }}>
              QR detection library <tt>jsQR</tt> not present. Demo video only.
            </span>
          )}
        </div>
        {error && <div style={{ color: "#fe53bb", fontWeight: 600 }}>{error}</div>}
        <button className="btn" onClick={handleManualClose} style={{ marginTop: 14, background: "var(--deo-secondary)", color: "#fff" }}>
          Close Scanner
        </button>
      </div>
    </div>
  );
}

export default QRScanner;
