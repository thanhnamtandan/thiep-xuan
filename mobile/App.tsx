import { useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
// Import từng font riêng để app không phải đóng gói cả bộ font.
import { DancingScript_700Bold } from "@expo-google-fonts/dancing-script/700Bold";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { fetchGreetings } from "./src/api";
import { C } from "./src/components/ui";
import type { GreetingForm, GreetingResponse } from "./src/data";
import { CardScreen } from "./src/screens/CardScreen";
import { FormScreen } from "./src/screens/FormScreen";
import { PickScreen } from "./src/screens/PickScreen";

type Step = { name: "form" } | { name: "pick"; data: GreetingResponse } | { name: "card"; data: GreetingResponse; greeting: string };

export default function App() {
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });
  const [form, setForm] = useState<GreetingForm>({ occasion: "tet", recipient: "bo-me", tone: "am-ap" });
  const [step, setStep] = useState<Step>({ name: "form" });
  const [loading, setLoading] = useState(false);

  const generate = async (f: GreetingForm) => {
    setForm(f);
    setLoading(true);
    try {
      setStep({ name: "pick", data: await fetchGreetings(f) });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={C.red} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      {step.name === "form" && <FormScreen initial={form} loading={loading} onSubmit={generate} />}
      {step.name === "pick" && (
        <PickScreen
          key={step.data.greetings.join("|")}
          data={step.data}
          loading={loading}
          onBack={() => setStep({ name: "form" })}
          onRegenerate={() => generate({ ...form, note: form.note ? `${form.note} (viết khác lần trước)` : "Viết khác lần trước" })}
          onChoose={(greeting) => setStep({ name: "card", data: step.data, greeting })}
        />
      )}
      {step.name === "card" && (
        <CardScreen greeting={step.greeting} couplet={step.data.couplet} onBack={() => setStep({ name: "pick", data: step.data })} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
});
