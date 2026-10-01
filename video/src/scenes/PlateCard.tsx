import { E3D, ICON } from "../lib/ui";

// «Фото» тарелки: льняная скатерть, керамическая тарелка, 3D-еда. Базовый размер 600×600.
export const PlateCard: React.FC<{ size: number; radius?: number }> = ({
  size,
  radius = 48,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      overflow: "hidden",
      position: "relative",
      background:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(0,0,0,0.025) 0 2px, transparent 2px 6px), linear-gradient(135deg, #E9DCC6, #D9C6A5)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${size / 600})`,
        transformOrigin: "0 0",
        width: 600,
        height: 600,
      }}
    >
      {/* тарелка */}
      <div
        style={{
          position: "absolute",
          left: 55,
          top: 55,
          width: 490,
          height: 490,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, #FFFFFF 0 60%, #EEF0EE 61% 66%, #FFFFFF 67% 70%, #E4E7E4 71% 100%)",
          boxShadow:
            "0 30px 50px rgba(80,55,20,0.35), inset 0 -6px 12px rgba(0,0,0,0.06)",
        }}
      />
      <E3D
        code={ICON.chicken}
        size={250}
        style={{
          position: "absolute",
          left: 95,
          top: 110,
          transform: "rotate(-18deg)",
        }}
      />
      <E3D
        code={ICON.potato}
        size={190}
        style={{
          position: "absolute",
          left: 320,
          top: 130,
          transform: "rotate(25deg)",
        }}
      />
      <E3D
        code={ICON.salad}
        size={230}
        style={{ position: "absolute", left: 200, top: 290 }}
      />
      {/* лёгкий блик «как на фото» */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.25), transparent 40%)",
        }}
      />
    </div>
  </div>
);
