import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

export const C = {
  red: "#B3141D",
  redDark: "#7E0C12",
  gold: "#F6C453",
  cream: "#FFF8EE",
  ink: "#2B1210",
  muted: "#7A5A52",
  line: "#EAD9C6",
};

export const F = {
  regular: "BeVietnamPro_400Regular",
  medium: "BeVietnamPro_500Medium",
  semibold: "BeVietnamPro_600SemiBold",
  bold: "BeVietnamPro_700Bold",
  script: "DancingScript_700Bold",
};

export function Chip({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[s.chip, selected && s.chipOn]}
    >
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
      {hint ? <Text style={[s.chipHint, selected && { color: "#FFE3B0" }]}>{hint}</Text> : null}
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        primary ? s.btnPrimary : s.btnOutline,
        (pressed || disabled) && { opacity: 0.75 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? "#fff" : C.red} />
      ) : (
        <Text style={[s.btnText, { color: primary ? "#fff" : C.red }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={s.section}>{title}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, color: C.ink, fontSize: 15 },
  chipTextOn: { color: "#fff" },
  chipHint: { fontFamily: F.regular, color: C.muted, fontSize: 12, marginTop: 2 },
  btn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnPrimary: { backgroundColor: C.red },
  btnOutline: { borderWidth: 1.5, borderColor: C.red, backgroundColor: "#fff" },
  btnText: { fontFamily: F.bold, fontSize: 16 },
  section: { fontFamily: F.bold, fontSize: 15, color: C.ink, marginBottom: 10 },
});
