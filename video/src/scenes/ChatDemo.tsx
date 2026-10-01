import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { count, ease, pop } from "../components/anim";
import { FoodRow, Macros, Phone, TypingDots, UserBubble } from "../components/Phone";
import { Title } from "../components/Title";
import { C } from "../theme";

const MESSAGE = "2 яйца и 150 г гречки";

export const ChatDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = Math.round(ease(frame, 8, 28) * MESSAGE.length);
  const sent = frame >= 30;
  const card = pop(frame, fps, 46, 14);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill>
      <Title top="Или просто" accent="напиши текстом" />
      <Phone top={480} height={1060}>
        {frame >= 2 && (
          <UserBubble scale={pop(frame, fps, 2, 14)}>
            {MESSAGE.slice(0, typed)}
            {!sent && <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>}
            {sent && <span style={{ fontSize: 30, marginLeft: 14, opacity: 0.6 }}>✓✓</span>}
          </UserBubble>
        )}
        {frame >= 32 && frame < 46 && <TypingDots frame={frame} />}
        {frame >= 46 && (
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
            <FoodRow emoji="🥚" name="Яйцо варёное" amount="2 шт (~110 г)" kcal={155} p={pop(frame, fps, 54)} />
            <FoodRow emoji="🍚" name="Гречка варёная" amount="150 г" kcal={165} p={pop(frame, fps, 60)} />
            <div style={{ height: 2, backgroundColor: C.cardLine, opacity: ease(frame, 64, 68) }} />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                opacity: ease(frame, 66, 70),
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>Итого</div>
              <div
                style={{
                  fontSize: 84,
                  fontWeight: 800,
                  color: C.lime,
                  scale: String(1 + 0.08 * pop(frame, fps, 90) * (1 - ease(frame, 98, 110))),
                }}
              >
                {count(frame, 68, 90, 320)} <span style={{ fontSize: 40 }}>ккал</span>
              </div>
            </div>
            <Macros p={19} f={13} c={31} opacity={ease(frame, 76, 84)} />
          </div>
        )}
      </Phone>
    </AbsoluteFill>
  );
};
