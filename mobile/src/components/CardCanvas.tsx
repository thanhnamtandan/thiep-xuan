import type { ComponentRef, Ref } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { Couplet } from "../data";
import { PhotoFrame, type CardPhoto } from "./PhotoFrame";

export type TemplateId = "mai" | "dao" | "denlong" | "caudoi";

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: "mai", name: "Mai vàng" },
  { id: "dao", name: "Đào hồng" },
  { id: "denlong", name: "Đèn lồng" },
  { id: "caudoi", name: "Câu đối" },
];

export const YEAR_LINE = "Xuân Đinh Mùi 2027";

export type CardHandle = ComponentRef<typeof View>;

type Props = {
  ref?: Ref<CardHandle>;
  template: TemplateId;
  width: number;
  greeting: string;
  couplet: Couplet;
  watermark: boolean;
  photo?: CardPhoto | null;
  onPhotoChange?: (p: CardPhoto) => void;
  onPhotoDragging?: (dragging: boolean) => void;
};

/** Vị trí khung ảnh trên từng mẫu, đơn vị khung 400 x 500. */
export function photoSlot(template: TemplateId) {
  return template === "caudoi" ? { x: 110, y: 134, w: 180, h: 135 } : { x: 90, y: 102, w: 220, h: 165 };
}

// Thiệp vẽ trên khung 400 x 500 rồi co giãn theo chiều rộng màn hình.
const VB_W = 400;
const VB_H = 500;

export function CardCanvas({ ref, template, width, greeting, couplet, watermark, photo, onPhotoChange, onPhotoDragging }: Props) {
  const height = (width * VB_H) / VB_W;
  const k = width / VB_W;
  const theme = THEMES[template];

  return (
    <View ref={ref} collapsable={false} style={{ width, height, overflow: "hidden", backgroundColor: theme.bg }}>
      <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
        <Background template={template} compact={Boolean(photo)} />
      </Svg>

      {template === "caudoi" ? (
        <CoupletLayout k={k} couplet={couplet} greeting={greeting} photo={photo} onPhotoChange={onPhotoChange} onPhotoDragging={onPhotoDragging} />
      ) : photo ? (
        <>
          <View style={[StyleSheet.absoluteFill, { paddingHorizontal: 44 * k, paddingTop: 50 * k, alignItems: "center" }]}>
            <Text style={{ fontFamily: "DancingScript_700Bold", fontSize: 34 * k, color: theme.title, textAlign: "center", lineHeight: 42 * k }}>
              Chúc Mừng Năm Mới
            </Text>
            <View style={{ height: (photoSlot(template).h + 18) * k }} />
            <Text style={{ fontFamily: "BeVietnamPro_600SemiBold", fontSize: 11 * k, letterSpacing: 3 * k, color: theme.accent }}>
              {YEAR_LINE.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: "BeVietnamPro_500Medium",
                fontSize: fitSize(greeting, k) * 0.8,
                lineHeight: fitSize(greeting, k) * 0.8 * 1.45,
                color: theme.body,
                textAlign: "center",
                marginTop: 10 * k,
              }}
            >
              {greeting}
            </Text>
          </View>
          <PhotoFrame photo={photo} k={k} {...photoSlot(template)} border={theme.accent} onChange={onPhotoChange} onDragging={onPhotoDragging} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { paddingHorizontal: 44 * k, paddingTop: 92 * k, alignItems: "center" }]}>
          <Text style={{ fontFamily: "DancingScript_700Bold", fontSize: 42 * k, color: theme.title, textAlign: "center", lineHeight: 50 * k }}>
            Chúc Mừng{"\n"}Năm Mới
          </Text>
          <Text style={{ fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 * k, letterSpacing: 3 * k, color: theme.accent, marginTop: 6 * k }}>
            {YEAR_LINE.toUpperCase()}
          </Text>
          <View style={{ height: 1, width: 80 * k, backgroundColor: theme.accent, marginVertical: 16 * k, opacity: 0.7 }} />
          <Text
            style={{
              fontFamily: "BeVietnamPro_500Medium",
              fontSize: fitSize(greeting, k),
              lineHeight: fitSize(greeting, k) * 1.5,
              color: theme.body,
              textAlign: "center",
            }}
          >
            {greeting}
          </Text>
        </View>
      )}

      {watermark && (
        <Text style={[styles.watermark, { fontSize: 10 * k, bottom: (template === "caudoi" ? 6 : 28) * k, color: theme.watermark }]}>
          Thiệp Xuân · tạo thiệp miễn phí
        </Text>
      )}
    </View>
  );
}

function fitSize(text: string, k: number): number {
  const n = text.length;
  const base = n < 90 ? 19 : n < 150 ? 16.5 : n < 220 ? 14.5 : 13;
  return base * k;
}

const THEMES: Record<TemplateId, { bg: string; title: string; accent: string; body: string; watermark: string }> = {
  mai: { bg: "#A3121B", title: "#FFD66B", accent: "#F6C453", body: "#FFF4DC", watermark: "rgba(255,244,220,0.6)" },
  dao: { bg: "#FFF6EC", title: "#C2185B", accent: "#B0302F", body: "#5A1E1E", watermark: "rgba(90,30,30,0.45)" },
  denlong: { bg: "#3B0A0F", title: "#FFCF5A", accent: "#E8A93A", body: "#FBE7C6", watermark: "rgba(251,231,198,0.5)" },
  caudoi: { bg: "#F7EBD3", title: "#FFD66B", accent: "#A3121B", body: "#4A1A12", watermark: "rgba(74,26,18,0.45)" },
};

// compact: cành hoa nhỏ lại để chừa chỗ cho khung ảnh và tiêu đề.
function Background({ template, compact }: { template: TemplateId; compact: boolean }) {
  const bs = compact ? 0.6 : 1;
  switch (template) {
    case "mai":
      return (
        <>
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#C4161F" />
              <Stop offset="1" stopColor="#7E0C12" />
            </LinearGradient>
          </Defs>
          <Rect width={VB_W} height={VB_H} fill="url(#g)" />
          <Frame color="#F6C453" />
          <Branch x={0} y={0} flip={false} petal="#FFD23F" center="#C77700" scale={bs} />
          <Branch x={VB_W} y={VB_H} flip petal="#FFD23F" center="#C77700" />
        </>
      );
    case "dao":
      return (
        <>
          <Rect width={VB_W} height={VB_H} fill="#FFF6EC" />
          <Frame color="#E7A1A8" />
          <Branch x={VB_W} y={0} flip={false} mirror petal="#F48FB1" center="#AD1457" scale={bs} />
          <Branch x={0} y={VB_H} flip mirror petal="#F8BBD0" center="#C2185B" />
        </>
      );
    case "denlong":
      return (
        <>
          <Defs>
            <LinearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#5C0F16" />
              <Stop offset="1" stopColor="#2A0609" />
            </LinearGradient>
          </Defs>
          <Rect width={VB_W} height={VB_H} fill="url(#g2)" />
          <Lantern x={60} len={40} />
          <Lantern x={340} len={58} />
          <Lantern x={200} len={10} small />
          {[...Array(26)].map((_, i) => (
            <Circle key={i} cx={(i * 97) % VB_W} cy={330 + ((i * 53) % 160)} r={1 + (i % 3) * 0.6} fill="#FFCF5A" opacity={0.5} />
          ))}
        </>
      );
    case "caudoi":
      return (
        <>
          <Rect width={VB_W} height={VB_H} fill="#F7EBD3" />
          <Rect x={95} y={22} width={210} height={50} rx={4} fill="#B3141D" />
          <Rect x={99} y={26} width={202} height={42} rx={3} fill="none" stroke="#F6C453" strokeWidth={1.2} />
          <Rect x={22} y={92} width={64} height={386} rx={4} fill="#B3141D" />
          <Rect x={314} y={92} width={64} height={386} rx={4} fill="#B3141D" />
          <Rect x={26} y={96} width={56} height={378} rx={3} fill="none" stroke="#F6C453" strokeWidth={1.2} />
          <Rect x={318} y={96} width={56} height={378} rx={3} fill="none" stroke="#F6C453" strokeWidth={1.2} />
          <Blossom x={200} y={440} r={12} petal="#FFD23F" center="#C77700" />
          <Blossom x={172} y={448} r={8} petal="#FFD23F" center="#C77700" />
          <Blossom x={228} y={448} r={8} petal="#FFD23F" center="#C77700" />
        </>
      );
  }
}

function Frame({ color }: { color: string }) {
  return (
    <G>
      <Rect x={14} y={14} width={VB_W - 28} height={VB_H - 28} fill="none" stroke={color} strokeWidth={1.5} />
      <Rect x={20} y={20} width={VB_W - 40} height={VB_H - 40} fill="none" stroke={color} strokeWidth={0.6} opacity={0.7} />
    </G>
  );
}

function Blossom({ x, y, r, petal, center }: { x: number; y: number; r: number; petal: string; center: string }) {
  return (
    <G>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180;
        return <Circle key={a} cx={x + Math.cos(rad) * r * 0.62} cy={y + Math.sin(rad) * r * 0.62} r={r * 0.55} fill={petal} />;
      })}
      <Circle cx={x} cy={y} r={r * 0.3} fill={center} />
    </G>
  );
}

// Cành hoa mọc từ một góc của thiệp.
function Branch({
  x,
  y,
  flip,
  mirror = false,
  petal,
  center,
  scale = 1,
}: {
  x: number;
  y: number;
  flip: boolean;
  mirror?: boolean;
  petal: string;
  center: string;
  scale?: number;
}) {
  const sx = (mirror ? -1 : 1) * (flip ? -1 : 1) * scale;
  const sy = (flip ? -1 : 1) * scale;
  const flowers: [number, number, number][] = [
    [40, 22, 13],
    [88, 40, 11],
    [130, 30, 9],
    [62, 70, 10],
    [24, 96, 12],
    [150, 58, 7],
    [100, 82, 6],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <Path d="M -6 6 C 40 30, 90 34, 160 52" stroke="#4E2A12" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M 30 22 C 40 50, 30 80, 22 110" stroke="#4E2A12" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M 70 32 C 80 50, 70 64, 62 76" stroke="#4E2A12" strokeWidth={2} fill="none" strokeLinecap="round" />
      {flowers.map(([fx, fy, r], i) => (
        <Blossom key={i} x={fx} y={fy} r={r} petal={petal} center={center} />
      ))}
    </G>
  );
}

function Lantern({ x, len, small = false }: { x: number; len: number; small?: boolean }) {
  const s = small ? 0.6 : 1;
  const top = len;
  return (
    <G>
      <Line x1={x} y1={0} x2={x} y2={top} stroke="#E8A93A" strokeWidth={1.2} />
      <G transform={`translate(${x} ${top}) scale(${s})`}>
        <Rect x={-12} y={0} width={24} height={8} fill="#E8A93A" />
        <Path d="M -30 8 C -44 40, -44 70, -30 96 L 30 96 C 44 70, 44 40, 30 8 Z" fill="#D7261E" />
        <Path d="M -12 8 C -18 40, -18 70, -12 96 M 12 8 C 18 40, 18 70, 12 96 M 0 8 L 0 96" stroke="#A3121B" strokeWidth={1.5} fill="none" />
        <Rect x={-12} y={96} width={24} height={8} fill="#E8A93A" />
        <Line x1={0} y1={104} x2={0} y2={132} stroke="#FFCF5A" strokeWidth={2} />
      </G>
    </G>
  );
}

function CoupletLayout({
  k,
  couplet,
  greeting,
  photo,
  onPhotoChange,
  onPhotoDragging,
}: {
  k: number;
  couplet: Couplet;
  greeting: string;
  photo?: CardPhoto | null;
  onPhotoChange?: (p: CardPhoto) => void;
  onPhotoDragging?: (dragging: boolean) => void;
}) {
  const bodySize = Math.min(15, fitSize(greeting, 1) * (photo ? 0.72 : 0.85));
  const col = (text: string, left: number) => (
    <View style={{ position: "absolute", left: left * k, top: 104 * k, width: 64 * k, height: 362 * k, alignItems: "center", justifyContent: "space-evenly" }}>
      {text.split(/\s+/).filter(Boolean).slice(0, 9).map((w, i) => (
        <Text key={i} style={{ fontFamily: "BeVietnamPro_700Bold", color: "#FFD66B", fontSize: 13 * k, textAlign: "center" }}>
          {w}
        </Text>
      ))}
    </View>
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ position: "absolute", left: 95 * k, top: 22 * k, width: 210 * k, height: 50 * k, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "BeVietnamPro_700Bold", color: "#FFD66B", fontSize: 15 * k, letterSpacing: 1 * k }}>
          {couplet.banner.toUpperCase()}
        </Text>
      </View>
      {/* Vế đầu dán bên phải, vế sau bên trái, theo cách treo câu đối truyền thống. */}
      {col(couplet.left, 314)}
      {col(couplet.right, 22)}
      <View style={{ position: "absolute", left: 100 * k, width: 200 * k, top: 100 * k, alignItems: "center" }}>
        <Text style={{ fontFamily: "DancingScript_700Bold", fontSize: (photo ? 24 : 34) * k, color: "#A3121B", textAlign: "center", lineHeight: (photo ? 30 : 40) * k }}>
          {photo ? "Chúc Mừng Năm Mới" : "Chúc Mừng\nNăm Mới"}
        </Text>
        {photo ? <View style={{ height: 144 * k }} /> : null}
        <Text style={{ fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10 * k, letterSpacing: 2 * k, color: "#A3121B", marginTop: 4 * k }}>
          {YEAR_LINE.toUpperCase()}
        </Text>
        <Text style={{ fontFamily: "BeVietnamPro_500Medium", fontSize: bodySize * k, lineHeight: bodySize * 1.5 * k, color: "#4A1A12", textAlign: "center", marginTop: (photo ? 8 : 14) * k }}>
          {greeting}
        </Text>
      </View>
      {photo ? <PhotoFrame photo={photo} k={k} {...photoSlot("caudoi")} border="#B3141D" onChange={onPhotoChange} onDragging={onPhotoDragging} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: "BeVietnamPro_400Regular" },
});
