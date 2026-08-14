import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AyeCalc — Numbers, made human";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          color: "white",
          background: "linear-gradient(125deg, #071c17, #123d32)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            border: "1px solid rgba(103,229,180,.2)",
            borderRadius: "50%",
            right: -150,
            top: -90,
          }}
        />
        <div style={{ width: 1000, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                color: "#071c17",
                background: "#67e5b4",
              }}
            >
              ≋
            </span>
            AyeCalc
          </div>
          <div
            style={{
              marginTop: 70,
              fontSize: 82,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -4,
            }}
          >
            Make numbers
            <br />
            <span style={{ color: "#67e5b4" }}>make sense.</span>
          </div>
          <div style={{ marginTop: 32, color: "rgba(255,255,255,.68)", fontSize: 26 }}>
            Free, accurate calculators for everyday decisions.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
