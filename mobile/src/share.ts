import type { RefObject } from "react";
import { Platform, Share } from "react-native";
import type { CardHandle } from "./components/CardCanvas";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Asset, requestPermissionsAsync } from "expo-media-library";

const EXPORT_WIDTH = 1080; // ảnh 1080 x 1350, vừa khung Facebook, Zalo, Instagram

async function capture(ref: RefObject<CardHandle | null>): Promise<string> {
  return captureRef(ref, {
    format: "png",
    quality: 1,
    width: EXPORT_WIDTH,
    height: (EXPORT_WIDTH * 5) / 4,
    result: Platform.OS === "web" ? "data-uri" : "tmpfile",
  });
}

function downloadOnWeb(dataUri: string) {
  const a = document.createElement("a");
  a.href = dataUri;
  a.download = `thiep-xuan-${Date.now()}.png`;
  a.click();
}

/** Trên trình duyệt điện thoại: mở bảng chia sẻ của máy nếu trình duyệt hỗ trợ gửi ảnh. */
async function shareOnWeb(dataUri: string): Promise<boolean> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (!nav?.share || !nav.canShare) return false;
  const blob = await (await fetch(dataUri)).blob();
  const file = new File([blob], "thiep-tet.png", { type: "image/png" });
  if (!nav.canShare({ files: [file] })) return false;
  try {
    await nav.share({ files: [file], title: "Thiệp Tết" });
  } catch (e) {
    // Người dùng đóng bảng chia sẻ thì thôi, không coi là lỗi.
    if (e instanceof Error && e.name === "AbortError") return true;
    throw e;
  }
  return true;
}

/** Mở bảng chia sẻ của máy: Zalo, Messenger, Facebook, Instagram... */
export async function shareCard(ref: RefObject<CardHandle | null>): Promise<void> {
  const uri = await capture(ref);
  if (Platform.OS === "web") {
    if (!(await shareOnWeb(uri))) downloadOnWeb(uri);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error("Máy không hỗ trợ chia sẻ");
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Gửi thiệp Tết", UTI: "public.png" });
}

/** Lưu thiệp vào thư viện ảnh. Trả về false nếu người dùng không cho phép. */
export async function saveCard(ref: RefObject<CardHandle | null>): Promise<boolean> {
  const uri = await capture(ref);
  if (Platform.OS === "web") {
    downloadOnWeb(uri);
    return true;
  }
  const perm = await requestPermissionsAsync(true);
  if (!perm.granted) return false;
  await Asset.create(uri);
  return true;
}

export async function shareText(text: string): Promise<void> {
  await Share.share({ message: text });
}
