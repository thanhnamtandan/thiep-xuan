import * as ImagePicker from "expo-image-picker";
import type { CardPhoto } from "./components/PhotoFrame";

export type PickResult = { photo: CardPhoto } | { error: "denied" } | null;

/** Chọn ảnh từ thư viện hoặc chụp mới. Trả về null nếu người dùng bấm hủy. */
export async function pickPhoto(source: "library" | "camera"): Promise<PickResult> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { error: "denied" };
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.85, allowsEditing: false };
  const res =
    source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return { photo: { uri: a.uri, width: a.width || 1000, height: a.height || 750, zoom: 1, offsetX: 0, offsetY: 0 } };
}
