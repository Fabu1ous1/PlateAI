import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, Bubble, InlineButtons, Typing } from "../components/Bubbles";
import { Phone } from "../components/Phone";
import { C, FONT } from "../theme";

// Тайминги сцены (кадры, 30 fps)
const T = {
  typeStart: 14,
  send1: 54,
  reply1: 84,
  photo: 180,
  reply2: 214,
};
const TEXT = "2 яйца и 150 г гречки";
const GOAL = 2200;
const LINE = "━━━━━━━━━━";

// Та же логика полоски, что в боте: 🟩 норма, 🟨 почти, 🟥 перебор
const bar = (v: number, goal: number, n = 10) => {
  const pct = v / goal;
  const filled = Math.max(0, Math.min(n, Math.round(pct * n)));
  const on = pct > 1 ? "🟥" : pct > 0.9 ? "🟨" : "🟩";
  return on.repeat(filled) + "⬜".repeat(n - filled);
};

type Item = { e: string; name: string; kcal: number };

// Ответ бота — копирует формат mealText() + progress() из api/webhook.js
const MealReply: React.FC<{
  at: number;
  items: Item[];
  macros: [number, number, number];
  dayFrom: number;
  dayTo: number;
  dayMacros: [number, number, number];
  time: string;
}> = ({ at, items, macros, dayFrom, dayTo, dayMacros, time }) => {
  const f = useCurrentFrame();
  const total = items.reduce((s, i) => s + i.kcal, 0);
  // строки ответа проявляются по очереди
  const line = (i: number) => ({
    opacity: interpolate(f, [at + i * 3, at + i * 3 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  });
  // счётчик дня «доезжает» до нового значения
  const day = Math.round(
    interpolate(f, [at + 20, at + 45], [dayFrom, dayTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const pct = Math.round((day / GOAL) * 100);
  return (
    <Appear at={at} h={900} side="in">
      <div>
        <Bubble side="in" time={time}>
          <div style={line(0)}>
            ✅ <b>Записал</b>
          </div>
          <div style={{ height: 14 }} />
          {items.map((it, i) => (
            <div key={it.name} style={line(1 + i)}>
              {it.e} {it.name} — <b>{it.kcal} ккал</b>
            </div>
          ))}
          <div style={{ height: 14 }} />
          <div style={line(items.length + 1)}>
            <b>Итого: {total} ккал</b>
            <br />
            🥩 Б {macros[0]} · 🧈 Ж {macros[1]} · 🍞 У {macros[2]}
          </div>
          <div style={{ ...line(items.length + 2), color: "#4A5D70", letterSpacing: -2 }}>{LINE}</div>
          <div style={line(items.length + 3)}>
            📊{" "}
            <b>
              Сегодня: <span style={{ fontVariantNumeric: "tabular-nums" }}>{day}</span> / {GOAL} ккал
            </b>{" "}
            · {pct}%
            <div style={{ fontSize: 34, letterSpacing: 2 }}>{bar(day, GOAL)}</div>
            Осталось: <b>{GOAL - day} ккал</b>
            <div style={{ height: 10 }} />
            <i style={{ color: "#AFC0CF" }}>Съедено БЖУ, г:</i>
            <br />
            🥩 Б {dayMacros[0]} · 🧈 Ж {dayMacros[1]} · 🍞 У {dayMacros[2]}
          </div>
        </Bubble>
        <div style={line(items.length + 5)}>
          <InlineButtons />
        </div>
      </div>
    </Appear>
  );
};

// «Фото» тарелки, нарисованное средствами CSS
const PlatePhoto: React.FC = () => (
  <div
    style={{
      width: 480,
      height: 400,
      borderRadius: 30,
      borderBottomRightRadius: 8,
      background: "repeating-linear-gradient(100deg, #6B4A2E 0 38px, #7A5536 38px 70px, #62432A 70px 110px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: 340,
        height: 340,
        borderRadius: 170,
        background: "radial-gradient(circle, #FFFFFF 0 55%, #E9EDEA 56% 64%, #FFFFFF 65%)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        position: "relative",
      }}
    >
      <span style={{ position: "absolute", fontSize: 120, left: 45, top: 45 }}>🍗</span>
      <span style={{ position: "absolute", fontSize: 100, left: 180, top: 75 }}>🥔</span>
      <span style={{ position: "absolute", fontSize: 110, left: 105, top: 170 }}>🥗</span>
    </div>
    <span style={{ position: "absolute", fontSize: 70, right: 24, top: 150, transform: "rotate(20deg)" }}>🍴</span>
  </div>
);

// Вспышка «сканирования» фото
const Scan: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [T.photo + 6, T.reply2], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < T.photo + 6 || f > T.reply2) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${y}%`,
        height: 6,
        background: C.green,
        boxShadow: `0 0 30px 10px ${C.green}`,
        opacity: 0.8,
      }}
    />
  );
};

const Caption: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from || f >= to) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 14 } });
  const out = interpolate(f, [to - 8, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        width: "100%",
        textAlign: "center",
        fontSize: 78,
        fontWeight: 900,
        color: C.text,
        opacity: s * out,
        transform: `translateY(${(1 - s) * -40}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const ChatDemo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame: f, fps, config: { damping: 16 } });

  const typed = f >= T.send1 ? "" : TEXT.slice(0, Math.max(0, Math.floor((f - T.typeStart) / 1.6)));
  const cursor = f < T.send1 && Math.floor(f / 8) % 2 === 0;

  // лёгкий «наезд камеры» на ответ бота
  const zoom = interpolate(f, [T.reply1, T.reply1 + 40, T.photo - 10, T.photo], [1, 1.04, 1.04, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <Caption from={0} to={T.photo - 4}>
        Напиши, что съел ✍️
      </Caption>
      <Caption from={T.photo - 4} to={400}>
        Или просто сфоткай 📸
      </Caption>
      <div
        style={{
          position: "absolute",
          top: 300,
          transform: `translateY(${(1 - phoneIn) * 1400}px) scale(${zoom})`,
        }}
      >
        <Phone inputText={typed} cursor={cursor}>
          <Appear at={T.send1} h={160} side="out">
            <Bubble side="out" time="13:02">
              {TEXT}
            </Bubble>
          </Appear>
          <Typing from={T.send1 + 6} to={T.reply1} />
          <MealReply
            at={T.reply1}
            time="13:02"
            items={[
              { e: "🥚", name: "Яйца, 2 шт", kcal: 156 },
              { e: "🍚", name: "Гречка, 150 г", kcal: 165 },
            ]}
            macros={[19, 12, 33]}
            dayFrom={0}
            dayTo={321}
            dayMacros={[19, 12, 33]}
          />
          <Appear at={T.photo} h={420} side="out">
            <div style={{ position: "relative", borderRadius: 30, overflow: "hidden" }}>
              <PlatePhoto />
              <Scan />
            </div>
          </Appear>
          <Typing from={T.photo + 8} to={T.reply2} />
          <MealReply
            at={T.reply2}
            time="19:40"
            items={[
              { e: "🍗", name: "Курица гриль, 150 г", kcal: 248 },
              { e: "🥔", name: "Картофель, 200 г", kcal: 186 },
              { e: "🥗", name: "Овощной салат", kcal: 60 },
            ]}
            macros={[53, 9, 48]}
            dayFrom={321}
            dayTo={815}
            dayMacros={[72, 21, 81]}
          />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

export const CHAT_DEMO_FRAMES = 330;
