import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { easeInOut, mix, prog } from "../lib/motion";
import { E3D, ICON, MaskLine, Sfx } from "../lib/ui";
import { C, DISPLAY, UI } from "../theme";
import { Phone } from "./Phone";
import { PlateCard } from "./PlateCard";

// Тайминги сцены (локальные кадры)
const T = {
  flash: 12, // «щелчок» камеры
  toPhone: 28, // фото улетает в чат
  bubble: 44, // фото появилось в чате
  reply: 74, // ответ бота
  slide: 104, // телефон уезжает влево, справа — цифры
  chips: 116,
  total: 150,
};

const MEAL = [
  { c: ICON.chicken, name: "Курица гриль · 150 г", kcal: 248 },
  { c: ICON.potato, name: "Картофель · 200 г", kcal: 186 },
  { c: ICON.salad, name: "Овощной салат", kcal: 60 },
];
const TOTAL = 494;
const GOAL = 2200;

const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const second = f >= T.slide - 6;
  const out = second ? 1 : 1 - prog(f, T.slide - 12, 6);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        width: "100%",
        textAlign: "center",
        fontFamily: DISPLAY,
        fontWeight: 900,
        letterSpacing: -2,
        color: C.ink,
      }}
    >
      {!second ? (
        <div style={{ opacity: out }}>
          <MaskLine at={0}>
            <div style={{ fontSize: 80 }}>
              Сфоткай <span style={{ color: C.orange }}>тарелку</span>
            </div>
          </MaskLine>
        </div>
      ) : (
        <>
          <MaskLine at={T.slide - 6}>
            <div style={{ fontSize: 80 }}>AI посчитает</div>
          </MaskLine>
          <MaskLine at={T.slide - 2}>
            <div style={{ fontSize: 80, color: C.orange }}>калории и БЖУ</div>
          </MaskLine>
        </>
      )}
    </div>
  );
};

// Ответ бота внутри телефона (формат как в api/webhook.js)
const Reply: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.reply) return null;
  const s = spring({ frame: f - T.reply, fps, config: { damping: 15 } });
  const line = (i: number) => ({ opacity: prog(f, T.reply + 3 + i * 3, 8) });
  return (
    <div
      style={{
        maxHeight: s * 560,
        transformOrigin: "bottom left",
        transform: `scale(${0.9 + 0.1 * s})`,
        opacity: s,
      }}
    >
      <div
        style={{
          background: C.tgIn,
          color: "#fff",
          borderRadius: 28,
          borderBottomLeftRadius: 8,
          padding: "20px 26px",
          fontSize: 29,
          lineHeight: 1.45,
          width: 600,
          fontWeight: 500,
        }}
      >
        <div style={line(0)}>
          ✅ <b>Записал</b>
        </div>
        <div style={{ height: 10 }} />
        {MEAL.map((m, i) => (
          <div key={m.name} style={line(1 + i)}>
            {["🍗", "🥔", "🥗"][i]} {m.name.replace(" · ", ", ")} —{" "}
            <b>{m.kcal} ккал</b>
          </div>
        ))}
        <div style={{ height: 10 }} />
        <div style={line(4)}>
          <b>Итого: {TOTAL} ккал</b>
          <br />
          🥩 Б 53 · 🧈 Ж 9 · 🍞 У 48
        </div>
        <div
          style={{ ...line(5), marginTop: 8, color: "#AFC0CF", fontSize: 25 }}
        >
          📊 Сегодня: 815 / {GOAL} ккал · 37%
        </div>
      </div>
    </div>
  );
};

const Scan: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.bubble + 4 || f > T.reply) return null;
  const y = interpolate(f, [T.bubble + 4, T.reply], [0, 100]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${y}%`,
        height: 6,
        background: C.lime,
        boxShadow: `0 0 40px 14px ${C.lime}`,
      }}
    />
  );
};

const Typing: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.bubble + 8 || f >= T.reply) return null;
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          background: C.tgIn,
          borderRadius: 28,
          borderBottomLeftRadius: 8,
          padding: "24px 30px",
          display: "flex",
          gap: 12,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#8FA3B6",
              opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f / 3 - i * 0.9)),
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Карточка с блюдом, вылетающая из телефона
const Chip: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MEAL[i];
  const at = T.chips + i * 8;
  const s = spring({ frame: f - at, fps, config: { damping: 13 } });
  const n = Math.round(m.kcal * prog(f, at, 18));
  return (
    <div
      style={{
        position: "absolute",
        left: 590,
        top: 520 + i * 190,
        width: 450,
        height: 160,
        background: C.white,
        borderRadius: 36,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 26px",
        boxShadow: "0 24px 50px rgba(14,26,20,0.14)",
        transform: `translateX(${(1 - s) * -380}px) scale(${0.5 + 0.5 * s}) rotate(${(1 - s) * -10}deg)`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <Sfx at={at} name="pop" volume={0.35} />
      <E3D code={m.c} size={112} />
      <div>
        <div
          style={{
            fontFamily: UI,
            fontSize: 26,
            fontWeight: 600,
            color: C.muted,
          }}
        >
          {m.name}
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 52,
            fontWeight: 800,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n} <span style={{ fontSize: 30 }}>ккал</span>
        </div>
      </div>
    </div>
  );
};

// Итог: кольцо дневной нормы + счётчик + БЖУ
const Total: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - T.total, fps, config: { damping: 12 } });
  const count = prog(f, T.total + 4, 26);
  const R = 170;
  const len = 2 * Math.PI * R;
  const pct = (TOTAL / GOAL) * count;
  const MACROS = [
    { t: "Б", v: 53, c: C.orange },
    { t: "Ж", v: 9, c: "#F5B82E" },
    { t: "У", v: 48, c: "#6BCB3D" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 590,
        top: 1100,
        width: 450,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${s})`,
        opacity: s,
      }}
    >
      <Sfx at={T.total} name="whoosh" volume={0.3} />
      <Sfx at={T.total + 28} name="ding" volume={0.35} />
      <div style={{ position: "relative", width: 400, height: 400 }}>
        <svg width={400} height={400} style={{ position: "absolute" }}>
          <circle
            cx={200}
            cy={200}
            r={R}
            fill={C.white}
            stroke="#E6E3D9"
            strokeWidth={26}
          />
          <circle
            cx={200}
            cy={200}
            r={R}
            fill="none"
            stroke={C.orange}
            strokeWidth={26}
            strokeLinecap="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - pct)}
            transform="rotate(-90 200 200)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 116,
              fontWeight: 900,
              color: C.ink,
              letterSpacing: -4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(TOTAL * count)}
          </div>
          <div
            style={{
              fontFamily: UI,
              fontSize: 32,
              fontWeight: 700,
              color: C.muted,
              marginTop: -6,
            }}
          >
            ккал за обед
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
        {MACROS.map((m, i) => {
          const p = spring({
            frame: f - T.total - 16 - i * 4,
            fps,
            config: { damping: 12 },
          });
          return (
            <div
              key={m.t}
              style={{
                fontFamily: DISPLAY,
                fontSize: 30,
                fontWeight: 800,
                color: C.ink,
                whiteSpace: "nowrap",
                background: C.white,
                border: `4px solid ${m.c}`,
                borderRadius: 999,
                padding: "10px 18px",
                transform: `scale(${p})`,
              }}
            >
              {m.t} {m.v}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1) большое «фото» со вспышкой → улетает в чат
  const toPhone = prog(f, T.toPhone, 16, easeInOut);
  const flash = interpolate(
    f,
    [T.flash, T.flash + 2, T.flash + 10],
    [0, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const cardIn = spring({ frame: f, fps, config: { damping: 14 } });

  // 2) телефон выезжает снизу, затем уходит влево
  const phoneIn = spring({
    frame: f - T.toPhone + 4,
    fps,
    config: { damping: 16 },
  });
  const side = prog(f, T.slide, 20, easeInOut);
  const px = mix(0, -255, side);
  const ps = mix(0.88, 0.7, side);
  const rotY = mix(-10, 14, side) + Math.sin(f / 30) * 2;
  const rotX = 6;

  const bubble = spring({ frame: f - T.bubble, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Sfx at={T.flash} name="shutter" volume={0.6} />
      <Sfx at={T.toPhone} name="whoosh" volume={0.35} />
      <Sfx at={T.reply} name="pop" volume={0.4} />
      <Sfx at={T.slide} name="whoosh" volume={0.3} />
      <Caption />

      {/* телефон в 3D */}
      <AbsoluteFill style={{ perspective: 2600, alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 330,
            transform: `translateX(${px}px) translateY(${(1 - phoneIn) * 1700 + side * 110}px) scale(${ps}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
            transformOrigin: "50% 0%",
          }}
        >
          <Phone>
            {f >= T.bubble ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  maxHeight: bubble * 470,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    transform: `scale(${0.8 + 0.2 * bubble})`,
                    transformOrigin: "bottom right",
                    borderRadius: 28,
                    overflow: "hidden",
                  }}
                >
                  <PlateCard size={440} radius={28} />
                  <Scan />
                </div>
              </div>
            ) : null}
            <Typing />
            <Reply />
          </Phone>
        </div>
      </AbsoluteFill>

      {/* большое фото до отправки */}
      {f < T.bubble + 2 ? (
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div
            style={{
              transform: `translate(${toPhone * 140}px, ${toPhone * 330}px) scale(${mix(1, 0.42, toPhone) * (0.7 + 0.3 * cardIn)}) rotate(${mix(-3, 0, toPhone)}deg)`,
              opacity: 1 - prog(f, T.bubble - 4, 6),
              boxShadow: "0 50px 100px rgba(14,26,20,0.3)",
              borderRadius: 60,
            }}
          >
            <PlateCard size={860} radius={60} />
          </div>
        </AbsoluteFill>
      ) : null}

      {[0, 1, 2].map((i) => (
        <Chip key={i} i={i} />
      ))}
      <Total />

      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, pointerEvents: "none" }}
      />
    </AbsoluteFill>
  );
};

export const DEMO_FRAMES = 240;
