import { useMemo, useRef } from "react";
import { Image, PanResponder, View } from "react-native";

/** Ảnh người dùng ghép vào thiệp. Vị trí tính theo đơn vị khung 400 x 500 để xuất ảnh to vẫn đúng chỗ. */
export type CardPhoto = {
  uri: string;
  width: number; // kích thước gốc của ảnh, px
  height: number;
  zoom: number; // 1 = vừa khít khung
  offsetX: number; // dịch ảnh, đơn vị khung thiệp
  offsetY: number;
};

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

/** Kích thước ảnh hiển thị (đơn vị khung) để ảnh phủ kín khung, rồi nhân với zoom. */
function coverSize(photo: CardPhoto, fw: number, fh: number) {
  const s = Math.max(fw / photo.width, fh / photo.height) * photo.zoom;
  return { w: photo.width * s, h: photo.height * s };
}

/** Giữ ảnh luôn phủ kín khung, không để lộ khoảng trống. */
export function clampPhoto(photo: CardPhoto, fw: number, fh: number): CardPhoto {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, photo.zoom));
  const { w, h } = coverSize({ ...photo, zoom }, fw, fh);
  const maxX = (w - fw) / 2;
  const maxY = (h - fh) / 2;
  return {
    ...photo,
    zoom,
    offsetX: Math.min(maxX, Math.max(-maxX, photo.offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, photo.offsetY)),
  };
}

type Props = {
  photo: CardPhoto;
  k: number; // px trên mỗi đơn vị khung
  x: number;
  y: number;
  w: number;
  h: number;
  border: string;
  radius?: number;
  onChange?: (p: CardPhoto) => void; // có thì người dùng kéo được ảnh
  onDragging?: (dragging: boolean) => void;
};

export function PhotoFrame({ photo, k, x, y, w, h, border, radius = 10, onChange, onDragging }: Props) {
  const { w: iw, h: ih } = coverSize(photo, w, h);
  const left = (w - iw) / 2 + photo.offsetX;
  const top = (h - ih) / 2 + photo.offsetY;

  // PanResponder giữ bản mới nhất của ảnh qua ref, vì nó chỉ được tạo một lần.
  const latest = useRef({ photo, k, w, h, onChange, onDragging });
  latest.current = { photo, k, w, h, onChange, onDragging };
  const start = useRef({ x: 0, y: 0 });

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Boolean(latest.current.onChange),
        onMoveShouldSetPanResponder: () => Boolean(latest.current.onChange),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start.current = { x: latest.current.photo.offsetX, y: latest.current.photo.offsetY };
          latest.current.onDragging?.(true);
        },
        onPanResponderRelease: () => latest.current.onDragging?.(false),
        onPanResponderTerminate: () => latest.current.onDragging?.(false),
        onPanResponderMove: (_e, g) => {
          const c = latest.current;
          c.onChange?.(
            clampPhoto({ ...c.photo, offsetX: start.current.x + g.dx / c.k, offsetY: start.current.y + g.dy / c.k }, c.w, c.h),
          );
        },
      }),
    [],
  );

  return (
    <View
      {...(onChange ? pan.panHandlers : {})}
      style={{
        position: "absolute",
        left: (x - 3) * k,
        top: (y - 3) * k,
        width: (w + 6) * k,
        height: (h + 6) * k,
        borderRadius: (radius + 3) * k,
        borderWidth: 3 * k,
        borderColor: border,
        backgroundColor: border,
        overflow: "hidden",
      }}
    >
      <View style={{ width: w * k, height: h * k, borderRadius: radius * k, overflow: "hidden" }}>
        <Image
          source={{ uri: photo.uri }}
          style={{ position: "absolute", left: left * k, top: top * k, width: iw * k, height: ih * k }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}
