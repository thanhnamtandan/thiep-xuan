import { useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { CardCanvas, TEMPLATES, type CardHandle, type TemplateId } from "../components/CardCanvas";
import { Button, C, F } from "../components/ui";
import type { Couplet } from "../data";
import { saveCard, shareCard } from "../share";

export function CardScreen({ greeting, couplet, onBack }: { greeting: string; couplet: Couplet; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 460);
  const [template, setTemplate] = useState<TemplateId>("mai");
  const [busy, setBusy] = useState<"share" | "save" | null>(null);
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

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Pressable onPress={onBack} accessibilityRole="button">
        <Text style={s.back}>‹ Đổi lời chúc</Text>
      </Pressable>

      <View style={s.cardShadow}>
        <CardCanvas ref={cardRef} template={template} width={cardWidth} greeting={greeting} couplet={couplet} watermark />
      </View>

      <Text style={s.label}>Chọn mẫu thiệp</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {TEMPLATES.map((t) => (
          <Pressable key={t.id} onPress={() => setTemplate(t.id)} style={[s.thumb, t.id === template && s.thumbOn]} accessibilityRole="button" accessibilityState={{ selected: t.id === template }}>
            <View pointerEvents="none">
              <CardCanvas template={t.id} width={84} greeting="" couplet={couplet} watermark={false} />
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
  thumb: { marginRight: 12, alignItems: "center", padding: 4, borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
  thumbOn: { borderColor: C.red },
  thumbText: { fontFamily: F.semibold, fontSize: 12, color: C.muted, marginTop: 6 },
});
