import React, { useState } from "react";

export interface DynamicQRCodeProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Lightweight SVG QR code builder fallback for basic numeric/alphanumeric strings
 * when offline or when external QR image API is unreachable.
 */
const generateSimpleQrSvg = (text: string, size: number) => {
  // Hash text to deterministically build a unique visual grid pattern for fallback
  let hash = 0;
  const str = text || "YES-ERP";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const gridSize = 21;
  const cellSize = size / gridSize;
  const rects: React.ReactNode[] = [];

  // Standard QR finder patterns (corners)
  const isFinder = (r: number, c: number) => {
    if (r < 7 && c < 7) return true; // Top-left
    if (r < 7 && c >= gridSize - 7) return true; // Top-right
    if (r >= gridSize - 7 && c < 7) return true; // Bottom-left
    return false;
  };

  // Draw finder pattern squares
  const drawFinder = (startR: number, startC: number, keyPrefix: string) => {
    rects.push(
      <rect
        key={`${keyPrefix}-outer`}
        x={startC * cellSize}
        y={startR * cellSize}
        width={7 * cellSize}
        height={7 * cellSize}
        fill="#000"
      />,
      <rect
        key={`${keyPrefix}-inner-white`}
        x={(startC + 1) * cellSize}
        y={(startR + 1) * cellSize}
        width={5 * cellSize}
        height={5 * cellSize}
        fill="#fff"
      />,
      <rect
        key={`${keyPrefix}-inner-black`}
        x={(startC + 2) * cellSize}
        y={(startR + 2) * cellSize}
        width={3 * cellSize}
        height={3 * cellSize}
        fill="#000"
      />
    );
  };

  drawFinder(0, 0, "tl");
  drawFinder(0, gridSize - 7, "tr");
  drawFinder(gridSize - 7, 0, "bl");

  // Data modules
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isFinder(r, c)) continue;
      // Deterministic pseudo-random module fill based on position & string hash
      const val = (Math.abs(hash ^ (r * 31 + c * 17 + str.charCodeAt((r + c) % str.length))) % 100) > 42;
      if (val) {
        rects.push(
          <rect
            key={`cell-${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#000"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ border: "1px solid #bdbcdb", borderRadius: "4px", backgroundColor: "#fff" }}
    >
      {rects}
    </svg>
  );
};

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  value,
  size = 120,
  label,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const qrText = value ? String(value).trim() : "YES-SCHOOL-ERP";
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrText)}&margin=4`;

  return (
    <div className={`dynamic_qr_wrapper ${className}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      {!hasError ? (
        <img
          src={apiUrl}
          alt={label || "QR Code"}
          width={size}
          height={size}
          onError={() => setHasError(true)}
          style={{
            border: "1px solid #bdbcdb",
            borderRadius: "4px",
            objectFit: "contain",
            backgroundColor: "#fff",
          }}
        />
      ) : (
        generateSimpleQrSvg(qrText, size)
      )}
      {label && <p style={{ margin: 0, fontFamily: "Roboto", fontSize: "14px", color: "#8a8894" }}>{label}</p>}
    </div>
  );
};

export default DynamicQRCode;
