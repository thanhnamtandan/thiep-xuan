export type Option<T extends string> = { id: T; label: string; hint?: string };

export type RecipientId =
  | "ong-ba"
  | "bo-me"
  | "vo-chong"
  | "nguoi-yeu"
  | "ban-be"
  | "dong-nghiep"
  | "sep"
  | "khach-hang"
  | "thay-co";

export type ToneId = "trang-trong" | "am-ap" | "hai-huoc" | "tho-van";

export const RECIPIENTS: Option<RecipientId>[] = [
  { id: "ong-ba", label: "Ông bà" },
  { id: "bo-me", label: "Bố mẹ" },
  { id: "vo-chong", label: "Vợ / Chồng" },
  { id: "nguoi-yeu", label: "Người yêu" },
  { id: "ban-be", label: "Bạn bè" },
  { id: "dong-nghiep", label: "Đồng nghiệp" },
  { id: "sep", label: "Sếp" },
  { id: "khach-hang", label: "Khách hàng" },
  { id: "thay-co", label: "Thầy cô" },
];

export const TONES: Option<ToneId>[] = [
  { id: "am-ap", label: "Ấm áp", hint: "Chân thành, tình cảm" },
  { id: "trang-trong", label: "Trang trọng", hint: "Lịch sự, kính trọng" },
  { id: "hai-huoc", label: "Hài hước", hint: "Vui, dí dỏm" },
  { id: "tho-van", label: "Có vần", hint: "Như thơ lục bát" },
];

export type Couplet = { left: string; right: string; banner: string };

export type GreetingResponse = {
  greetings: string[];
  couplet: Couplet;
  source: "ai" | "cache" | "library" | "offline";
  remaining: number | null;
  limitReached?: boolean;
};

export type GreetingForm = {
  occasion: "tet";
  recipient: RecipientId;
  tone: ToneId;
  recipientName?: string;
  senderName?: string;
  note?: string;
};
