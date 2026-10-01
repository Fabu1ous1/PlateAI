import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { count, ease, pop } from "../components/anim";
import { FoodRow, Macros, Phone, TypingDots, UserBubble } from "../components/Phone";
import { Title } from "../components/Title";
import { C } from "../theme";

const MESSAGE = "2 яйца и 150 г гречки";

export const ChatDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = Math.round(ease(frame, 22, 52) * MESSAGE.length);
  const sent = frame >= 56;
  const card = pop(frame, fps, 84, 14);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill>
      <Title top="Просто напиши," accent="что съел" y={140} />
      <Phone top={480} height={1120}>
        {frame >= 14 && (
          <UserBubble scale={pop(frame, fps, 14, 14)}>
            {MESSAGE.slice(0, typed)}
            {!sent && <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>}
            {sent && <span style={{ fontSize: 30, marginLeft: 14, opacity: 0.6 }}>✓✓</span>}
          </UserBubble>
        )}
        {frame >= 60 && frame < 84 && <TypingDots frame={frame} />}
        {frame >= 84 && (
          <div
            style={{
              alignSelf: "flex-start",
              width: "100%",
              padding: "36px 36px",
              borderRadius: "40px 40px 40px 12px",
              backgroundColor: "#16231A",
              border: `2px solid ${C.cardLine}`,
              display: "flex",
              flexDirection: "column",
              gap: 26,
              scale: String(0.85 + card * 0.15),
              opacity: card,
              transformOrigin: "0% 100%",
            }}
          >
            <div style={{ fontSize: 46, fontWeight: 800, color: C.text }}>✅ Записал</div>
            <FoodRow emoji="🥚" name="Яйцо варёное" amount="2 шт (~110 г)" kcal={155} p={pop(frame, fps, 96)} />
            <FoodRow emoji="🍚" name="Гречка варёная" amount="150 г" kcal={165} p={pop(frame, fps, 106)} />
            <div style={{ height: 2, backgroundColor: C.cardLine, opacity: ease(frame, 114, 120) }} />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                opacity: ease(frame, 116, 122),
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>Итого</div>
              <div
                style={{
                  fontSize: 84,
                  fontWeight: 800,
                  color: C.lime,
                  scale: String(1 + 0.08 * pop(frame, fps, 150) * (1 - ease(frame, 160, 175))),
                }}
              >
                {count(frame, 118, 150, 320)} <span style={{ fontSize: 40 }}>ккал</span>
              </div>
            </div>
            <Macros p={19} f={13} c={31} opacity={ease(frame, 130, 140)} />
          </div>
        )}
      </Phone>
    </AbsoluteFill>
  );
};
