import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, C, Chip, F, Section } from "../components/ui";
import { RECIPIENTS, TONES, type GreetingForm, type RecipientId, type ToneId } from "../data";

export function FormScreen({ initial, loading, onSubmit }: { initial: GreetingForm; loading: boolean; onSubmit: (f: GreetingForm) => void }) {
  const [recipient, setRecipient] = useState<RecipientId>(initial.recipient);
  const [tone, setTone] = useState<ToneId>(initial.tone);
  const [recipientName, setRecipientName] = useState(initial.recipientName ?? "");
  const [senderName, setSenderName] = useState(initial.senderName ?? "");
  const [note, setNote] = useState(initial.note ?? "");

  const submit = () =>
    onSubmit({
      occasion: "tet",
      recipient,
      tone,
      recipientName: recipientName.trim() || undefined,
      senderName: senderName.trim() || undefined,
      note: note.trim() || undefined,
    });

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <Text style={s.heroTitle}>Thiệp Xuân</Text>
        <Text style={s.heroSub}>Lời chúc Tết Đinh Mùi 2027 do AI viết riêng cho người bạn thương</Text>
      </View>

      <Section title="Gửi cho ai?">
        <View style={s.row}>
          {RECIPIENTS.map((r) => (
            <Chip key={r.id} label={r.label} selected={r.id === recipient} onPress={() => setRecipient(r.id)} />
          ))}
        </View>
      </Section>

      <Section title="Giọng điệu">
        <View style={s.row}>
          {TONES.map((t) => (
            <Chip key={t.id} label={t.label} hint={t.hint} selected={t.id === tone} onPress={() => setTone(t.id)} />
          ))}
        </View>
      </Section>

      <Section title="Cá nhân hóa (không bắt buộc)">
        <TextInput style={s.input} placeholder="Tên người nhận, ví dụ: bà Nội, anh Hùng" placeholderTextColor={C.muted} value={recipientName} onChangeText={setRecipientName} maxLength={40} />
        <TextInput style={s.input} placeholder="Tên của bạn, ví dụ: cháu Na" placeholderTextColor={C.muted} value={senderName} onChangeText={setSenderName} maxLength={40} />
        <TextInput
          style={[s.input, { height: 84, textAlignVertical: "top", paddingTop: 12 }]}
          placeholder="Muốn nhắc điều gì? Ví dụ: bà vừa khỏi ốm, anh ấy mới lên chức"
          placeholderTextColor={C.muted}
          value={note}
          onChangeText={setNote}
          maxLength={200}
          multiline
        />
      </Section>

      <Button title="Viết lời chúc" onPress={submit} loading={loading} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 48 },
  hero: { backgroundColor: C.red, borderRadius: 22, padding: 22, borderWidth: 2, borderColor: C.gold },
  heroTitle: { fontFamily: F.script, fontSize: 44, color: C.gold },
  heroSub: { fontFamily: F.medium, fontSize: 15, color: "#FFEFD6", marginTop: 4, lineHeight: 22 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  input: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    height: 50,
    fontFamily: F.regular,
    fontSize: 15,
    color: C.ink,
    marginBottom: 10,
  },
});
