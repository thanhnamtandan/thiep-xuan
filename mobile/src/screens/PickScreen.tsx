import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, C, F } from "../components/ui";
import type { GreetingResponse } from "../data";
import { shareText } from "../share";

export function PickScreen({
  data,
  loading,
  onBack,
  onRegenerate,
  onChoose,
}: {
  data: GreetingResponse;
  loading: boolean;
  onBack: () => void;
  onRegenerate: () => void;
  onChoose: (text: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [text, setText] = useState(data.greetings[0] ?? "");

  const pick = (i: number) => {
    setSelected(i);
    setText(data.greetings[i]);
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onBack} accessibilityRole="button">
        <Text style={s.back}>‹ Đổi người nhận</Text>
      </Pressable>
      <Text style={s.title}>Chọn một lời chúc</Text>
      <Text style={s.note}>{sourceNote(data)}</Text>

      {data.greetings.map((g, i) => (
        <Pressable key={i} onPress={() => pick(i)} style={[s.card, i === selected && s.cardOn]} accessibilityRole="radio" accessibilityState={{ checked: i === selected }}>
          <Text style={s.cardText}>{g}</Text>
        </Pressable>
      ))}

      <Text style={s.label}>Sửa lại cho vừa ý</Text>
      <TextInput style={s.editor} value={text} onChangeText={setText} multiline maxLength={320} />

      <View style={s.couplet}>
        <Text style={s.coupletBanner}>{data.couplet.banner}</Text>
        <Text style={s.coupletLine}>{data.couplet.left}</Text>
        <Text style={s.coupletLine}>{data.couplet.right}</Text>
      </View>

      <Button title="Làm thiệp với lời chúc này" onPress={() => onChoose(text.trim())} disabled={!text.trim()} style={{ marginTop: 20 }} />
      <View style={s.row}>
        <Button title="Gửi dạng chữ" variant="outline" onPress={() => shareText(text)} style={{ flex: 1 }} />
        <View style={{ width: 10 }} />
        <Button title="Viết lại" variant="outline" onPress={onRegenerate} loading={loading} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

function sourceNote(d: GreetingResponse): string {
  if (d.limitReached) return "Bạn đã dùng hết lượt AI miễn phí hôm nay, đây là lời chúc chọn sẵn. Mai quay lại nhé!";
  if (d.source === "offline") return "Không kết nối được máy chủ, đây là lời chúc chọn sẵn.";
  if (d.source === "library") return "Lời chúc chọn sẵn cho bạn.";
  if (d.remaining != null) return `AI viết riêng cho bạn. Còn ${d.remaining} lượt miễn phí hôm nay.`;
  return "AI viết riêng cho bạn.";
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 48 },
  back: { fontFamily: F.semibold, color: C.red, fontSize: 15, marginBottom: 8 },
  title: { fontFamily: F.bold, fontSize: 24, color: C.ink },
  note: { fontFamily: F.regular, color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: C.line, marginBottom: 10 },
  cardOn: { borderColor: C.red, backgroundColor: "#FFF1EC" },
  cardText: { fontFamily: F.regular, fontSize: 15, lineHeight: 23, color: C.ink },
  label: { fontFamily: F.bold, fontSize: 15, color: C.ink, marginTop: 14, marginBottom: 8 },
  editor: { borderWidth: 1.5, borderColor: C.line, borderRadius: 14, backgroundColor: "#fff", padding: 14, minHeight: 110, fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.ink, textAlignVertical: "top" },
  couplet: { marginTop: 18, backgroundColor: C.red, borderRadius: 16, padding: 16, alignItems: "center" },
  coupletBanner: { fontFamily: F.bold, color: C.gold, fontSize: 16, marginBottom: 6, letterSpacing: 1 },
  coupletLine: { fontFamily: F.medium, color: "#FFEFD6", fontSize: 15, lineHeight: 24 },
  row: { flexDirection: "row", marginTop: 10 },
});
