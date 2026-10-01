import { C, UI } from "../theme";

// Телефон с открытым чатом Telegram (тёмная тема). Размер 760×1500.
export const Phone: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: 760,
      height: 1500,
      borderRadius: 96,
      padding: 18,
      background: "linear-gradient(145deg, #2A2F2C, #0B0D0C 40%, #1D2220)",
      boxShadow:
        "0 80px 120px rgba(14,26,20,0.35), 0 20px 40px rgba(14,26,20,0.25), inset 0 0 0 2px #3A413D",
      fontFamily: UI,
      position: "relative",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 80,
        overflow: "hidden",
        background: C.tgBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* статус-бар и «остров» */}
      <div style={{ height: 70, background: C.tgHeader, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 18,
            width: 200,
            height: 52,
            marginLeft: -100,
            borderRadius: 30,
            background: "#000",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 24,
            color: "#fff",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          9:41
        </div>
      </div>
      <div
        style={{
          background: C.tgHeader,
          padding: "14px 30px 22px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          borderBottom: "1px solid #0B1118",
        }}
      >
        <div style={{ color: C.tgBlue, fontSize: 40, marginTop: -6 }}>‹</div>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            background: `linear-gradient(135deg, ${C.lime}, #6BCB3D)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
          }}
        >
          🍽
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 34, fontWeight: 700 }}>
            PlateAI
          </div>
          <div style={{ color: "#6D8196", fontSize: 24, fontWeight: 500 }}>
            бот
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 22px 22px",
          gap: 16,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <div
        style={{
          background: C.tgHeader,
          padding: "20px 26px 40px",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ fontSize: 34 }}>📎</div>
        <div style={{ flex: 1, fontSize: 30, color: "#6D8196" }}>Сообщение</div>
        <div style={{ fontSize: 34 }}>🎤</div>
      </div>
    </div>
  </div>
);
