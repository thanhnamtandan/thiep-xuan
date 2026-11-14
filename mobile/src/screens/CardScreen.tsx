import { useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { CardCanvas, TEMPLATES, photoSlot, type CardHandle, type TemplateId } from "../components/CardCanvas";
import { MAX_ZOOM, MIN_ZOOM, clampPhoto, type CardPhoto } from "../components/PhotoFrame";
import { Button, C, F } from "../components/ui";
import type { Couplet } from "../data";
import { pickPhoto } from "../photo";
import { saveCard, shareCard } from "../share";

type Props = {
  greeting: string;
  couplet: Couplet;
  photo: CardPhoto | null;
  onPhotoChange: (p: CardPhoto | null) => void;
  onBack: () => void;
};

export function CardScreen({ greeting, couplet, photo, onPhotoChange, onBack }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 460);
  const [template, setTemplate] = useState<TemplateId>("mai");
  const [busy, setBusy] = useState<"share" | "save" | null>(null);
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef<CardHandle>(null);

  const notify = (msg: string) => (Platform.OS === "web" ? console.log(msg) : Alert.alert("Thiệp Xuân", msg));

  const run = async (kind: "share" | "save") => {
    setBusy(kind);
    try {
      if (kind === "share") await shareCard(cardRef);
      else notify((await saveCard(cardRef)) ? "Đã lưu thiệp vào thư viện ảnh." : "Bạn cần cho phép truy cập ảnh để lưu thiệp.");
    } catch (e) {
      notify("Có lỗi khi xuất thiệp, bạn thử lại nhé.");
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };

  const slot = photoSlot(template);
  const fit = (p: CardPhoto, t: TemplateId = template) => clampPhoto(p, photoSlot(t).w, photoSlot(t).h);

  const choosePhoto = async (source: "library" | "camera") => {
    try {
      const res = await pickPhoto(source);
      if (!res) return;
      if ("error" in res) return notify("Bạn cần cho phép dùng máy ảnh để chụp ảnh.");
      onPhotoChange(fit(res.photo));
    } catch (e) {
      notify("Không mở được ảnh, bạn thử lại nhé.");
      console.warn(e);
    }
  };

  const zoomBy = (delta: number) => photo && onPhotoChange(fit({ ...photo, zoom: photo.zoom + delta }));

  const changeTemplate = (t: TemplateId) => {
    setTemplate(t);
    // Khung ảnh mỗi mẫu một cỡ, nên chỉnh lại vị trí ảnh cho khỏi lộ khoảng trống.
    if (photo) onPhotoChange(fit(photo, t));
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} scrollEnabled={!dragging}>
      <Pressable onPress={onBack} accessibilityRole="button">
        <Text style={s.back}>‹ Đổi lời chúc</Text>
      </Pressable>

      <View style={s.cardShadow}>
        <CardCanvas
          ref={cardRef}
          template={template}
          width={cardWidth}
          greeting={greeting}
          couplet={couplet}
          watermark
          photo={photo}
          onPhotoChange={(p) => onPhotoChange(clampPhoto(p, slot.w, slot.h))}
          onPhotoDragging={setDragging}
        />
      </View>

      <Text style={s.label}>Ảnh gia đình</Text>
      {photo ? (
        <>
          <Text style={s.hint}>Kéo ảnh trong khung để căn chỉnh.</Text>
          <View style={s.row}>
            <Button title="−" variant="outline" onPress={() => zoomBy(-0.25)} disabled={photo.zoom <= MIN_ZOOM} style={s.zoomBtn} />
            <Button title="+" variant="outline" onPress={() => zoomBy(0.25)} disabled={photo.zoom >= MAX_ZOOM} style={s.zoomBtn} />
            <Button title="Đổi ảnh" variant="outline" onPress={() => choosePhoto("library")} style={s.flex} />
            <Button title="Bỏ ảnh" variant="outline" onPress={() => onPhotoChange(null)} style={s.flex} />
          </View>
        </>
      ) : (
        <View style={s.row}>
          <Button title="Chọn ảnh" variant="outline" onPress={() => choosePhoto("library")} style={s.flex} />
          {Platform.OS !== "web" ? <Button title="Chụp ảnh" variant="outline" onPress={() => choosePhoto("camera")} style={s.flex} /> : null}
        </View>
      )}

      <Text style={s.label}>Chọn mẫu thiệp</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {TEMPLATES.map((t) => (
          <Pressable key={t.id} onPress={() => changeTemplate(t.id)} style={[s.thumb, t.id === template && s.thumbOn]} accessibilityRole="button" accessibilityState={{ selected: t.id === template }}>
            <View pointerEvents="none">
              <CardCanvas template={t.id} width={84} greeting="" couplet={couplet} watermark={false} photo={photo ? fit(photo, t.id) : null} />
            </View>
            <Text style={[s.thumbText, t.id === template && { color: C.red }]}>{t.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Button title="Gửi qua Zalo, Facebook..." onPress={() => run("share")} loading={busy === "share"} style={{ marginTop: 20 }} />
      <Button title="Lưu vào máy" variant="outline" onPress={() => run("save")} loading={busy === "save"} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 48, alignItems: "stretch" },
  back: { fontFamily: F.semibold, color: C.red, fontSize: 15, marginBottom: 12 },
  cardShadow: {
    alignSelf: "center",
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: { fontFamily: F.bold, fontSize: 15, color: C.ink, marginTop: 20, marginBottom: 10 },
  hint: { fontFamily: F.regular, fontSize: 13, color: C.muted, marginTop: -4, marginBottom: 10 },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1, paddingHorizontal: 8 },
  zoomBtn: { width: 52, paddingHorizontal: 0 },
  thumb: { marginRight: 12, alignItems: "center", padding: 4, borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
  thumbOn: { borderColor: C.red },
  thumbText: { fontFamily: F.semibold, fontSize: 12, color: C.muted, marginTop: 6 },
});
