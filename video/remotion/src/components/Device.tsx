import { Img, staticFile } from "remotion";

// A phone (screenshots 860 px wide, 1:2 screen) or a tablet (1536 px wide, 3:4 screen) showing a real app screenshot.
// `scroll` is in screenshot pixels: tall full-page captures slide up inside the screen.
export type DeviceKind = "phone" | "tablet";
export const DEVICE = {
  phone: { imgW: 860, aspect: 2, radius: 0.15, bezel: 0.035 },
  tablet: { imgW: 1536, aspect: 4 / 3, radius: 0.07, bezel: 0.035 },
};

export const screenGeometry = (kind: DeviceKind, width: number) => {
  const d = DEVICE[kind];
  const bezel = Math.round(width * d.bezel);
  const sw = width - 2 * bezel;
  // phones get a status bar above the app, like the real thing; the screenshot starts below it
  const status = kind === "phone" ? Math.round(sw * 0.085) : 0;
  return { bezel, sw, sh: sw * d.aspect, scale: sw / d.imgW, height: sw * d.aspect + 2 * bezel, status };
};

export const Device: React.FC<{
  readonly kind?: DeviceKind;
  readonly src: string;
  readonly width: number;
  readonly scroll?: number;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
}> = ({ kind = "phone", src, width, scroll = 0, style, children }) => {
  const d = DEVICE[kind];
  const g = screenGeometry(kind, width);
  return (
    <div
      style={{
        position: "absolute",
        width,
        height: g.height,
        borderRadius: width * d.radius,
        background: "linear-gradient(145deg, #1e293b, #0b1220 40%, #111827)",
        boxShadow: "0 0 0 2px rgba(148,163,184,0.25), 0 60px 120px -30px rgba(0,0,0,0.85), 0 0 90px -20px rgba(45,212,191,0.35)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: g.bezel,
          top: g.bezel,
          width: g.sw,
          height: g.sh,
          borderRadius: width * d.radius - g.bezel,
          overflow: "hidden",
          background: "#020617",
        }}
      >
        <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: g.status - scroll * g.scale, width: g.sw }} />
        {children}
        {kind === "phone" ? <StatusBar w={g.sw} h={g.status} /> : null}
      </div>
    </div>
  );
};

const StatusBar: React.FC<{ readonly w: number; readonly h: number }> = ({ w, h }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: "#020617", fontFamily: "PJS, sans-serif", fontWeight: 700, fontSize: h * 0.36, color: "#f8fafc" }}>
    <div style={{ position: "absolute", left: w * 0.1, top: h * 0.3 }}>21:00</div>
    <div style={{ position: "absolute", left: "50%", top: h * 0.2, width: w * 0.28, height: h * 0.62, marginLeft: -w * 0.14, borderRadius: 999, background: "#000" }} />
    <div style={{ position: "absolute", right: w * 0.08, top: h * 0.36, display: "flex", gap: h * 0.12, alignItems: "flex-end" }}>
      {[0.35, 0.5, 0.65, 0.8].map((k, i) => (
        <div key={i} style={{ width: h * 0.08, height: h * 0.34 * k, borderRadius: 2, background: "#f8fafc" }} />
      ))}
      <div style={{ width: h * 0.6, height: h * 0.3, borderRadius: h * 0.08, border: `${Math.max(2, h * 0.04)}px solid rgba(248,250,252,0.6)`, padding: 2, marginLeft: h * 0.08 }}>
        <div style={{ width: "75%", height: "100%", borderRadius: 2, background: "#f8fafc" }} />
      </div>
    </div>
  </div>
);

// A magnified crop of a screenshot, floating above the device.
export const Zoom: React.FC<{
  readonly src: string;
  readonly crop: readonly [number, number, number, number];
  readonly scale: number;
  readonly imgW?: number;
  readonly style?: React.CSSProperties;
}> = ({ src, crop, scale, imgW = 860, style }) => {
  const [x, y, w, h] = crop;
  return (
    <div
      style={{
        position: "absolute",
        width: w * scale,
        height: h * scale,
        borderRadius: 30,
        overflow: "hidden",
        background: "#020617",
        boxShadow: "0 0 0 3px rgba(45,212,191,0.75), 0 40px 90px -20px rgba(0,0,0,0.9), 0 0 80px -10px rgba(45,212,191,0.55)",
        ...style,
      }}
    >
      <Img src={staticFile(src)} style={{ position: "absolute", left: -x * scale, top: -y * scale, width: imgW * scale }} />
    </div>
  );
};
