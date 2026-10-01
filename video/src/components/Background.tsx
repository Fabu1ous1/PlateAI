import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          left: -420,
          top: -380,
          background: `radial-gradient(circle, ${C.lime}38 0%, transparent 62%)`,
          translate: `${interpolate(frame, [0, 900], [0, 260])}px ${Math.sin(frame / 60) * 80}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          right: -560,
          bottom: -480,
          background: `radial-gradient(circle, ${C.mint}30 0%, transparent 60%)`,
          translate: `${Math.cos(frame / 70) * 90}px ${interpolate(frame, [0, 900], [0, -300])}px`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.text}10 1.5px, transparent 1.5px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};
