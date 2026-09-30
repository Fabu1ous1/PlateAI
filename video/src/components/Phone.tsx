import { C, FONT } from "../theme";

// Корпус телефона + шапка чата Telegram
export const Phone: React.FC<{ children: React.ReactNode; inputText: string; cursor: boolean }> = ({
  children,
  inputText,
  cursor,
}) => (
  <div
    style={{
      width: 900,
      height: 1500,
      borderRadius: 90,
      background: "#050807",
      padding: 22,
      boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 3px #26332D",
      fontFamily: FONT,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 70,
        overflow: "hidden",
        background: C.tgBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* шапка */}
      <div
        style={{
          background: C.tgHeader,
          padding: "70px 36px 26px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 44, color: "#5AB3F0" }}>‹</div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}
        >
          🍽
        </div>
        <div>
          <div style={{ color: C.text, fontSize: 38, fontWeight: 700 }}>PlateAI</div>
          <div style={{ color: "#6D8196", fontSize: 28, fontWeight: 500 }}>бот</div>
        </div>
      </div>
      {/* лента сообщений: прижата к низу, старые уезжают вверх */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 26px 20px",
          overflow: "hidden",
          gap: 18,
        }}
      >
        {children}
      </div>
      {/* поле ввода */}
      <div
        style={{
          background: C.tgHeader,
          padding: "22px 26px 44px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ fontSize: 40 }}>📎</div>
        <div
          style={{
            flex: 1,
            fontSize: 34,
            color: inputText ? C.text : "#6D8196",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {inputText || "Сообщение"}
          {cursor ? <span style={{ color: "#5AB3F0" }}>|</span> : null}
        </div>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: inputText ? "#5AB3F0" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: inputText ? "#fff" : "#6D8196",
            fontSize: 36,
          }}
        >
          {inputText ? "➤" : "🎤"}
        </div>
      </div>
    </div>
  </div>
);
