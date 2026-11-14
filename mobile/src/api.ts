import AsyncStorage from "@react-native-async-storage/async-storage";
import { OFFLINE_RESPONSE, type GreetingForm, type GreetingResponse } from "./data";

// Đặt EXPO_PUBLIC_API_URL trong file .env (ví dụ http://192.168.1.10:8787 khi chạy thử trên điện thoại).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

let deviceId: string | null = null;

async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  try {
    const saved = await AsyncStorage.getItem("deviceId");
    if (saved) return (deviceId = saved);
  } catch {}
  const fresh = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    await AsyncStorage.setItem("deviceId", fresh);
  } catch {}
  return (deviceId = fresh);
}

export async function fetchGreetings(form: GreetingForm): Promise<GreetingResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}/api/greetings`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-device-id": await getDeviceId() },
      body: JSON.stringify(form),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as GreetingResponse;
  } catch (err) {
    console.warn("fetchGreetings failed, using offline greetings", err);
    return OFFLINE_RESPONSE;
  } finally {
    clearTimeout(timer);
  }
}
