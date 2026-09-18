import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "AyeCalc AI Image Upscaler — 2× photo enhancement, private and free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#071c17",
        color: "#fffefa",
        padding: 80,
        fontFamily: "sans-serif",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 800 }}>
        <span style={{ fontSize: 28, color: "#8bdec0" }}>AyeCalc</span>
        <span
          style={{
            fontSize: 76,
            letterSpacing: -3,
            fontWeight: 700,
            marginTop: 52,
          }}
        >
          AI Image Upscaler
        </span>
        <span style={{ fontSize: 36, color: "#b7ebd5", marginTop: 18 }}>
          A clearer view. Twice the size.
        </span>
        <span style={{ fontSize: 24, color: "#c8dcd2", marginTop: 50 }}>
          Free · Local processing · No added watermark
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 180,
          height: 180,
          border: "2px solid #67e5b4",
          borderRadius: 30,
          color: "#67e5b4",
          fontSize: 90,
          fontWeight: 700,
        }}
      >
        2×
      </div>
    </div>,
    size,
  );
}
