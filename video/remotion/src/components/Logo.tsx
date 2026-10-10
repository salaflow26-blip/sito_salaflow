import { Img, staticFile } from "remotion";

export const Logo: React.FC<{ readonly size: number; readonly style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.225, overflow: "hidden", boxShadow: "0 40px 100px -30px rgba(45,212,191,0.75)", ...style }}>
    <Img src={staticFile("logo.png")} style={{ width: "100%", height: "100%", scale: "1.03" }} />
  </div>
);
