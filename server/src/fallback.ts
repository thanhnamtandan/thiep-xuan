import type { GenerateRequest, GenerateResult } from "./prompt.js";

// Lời chúc soạn sẵn: dùng khi chưa có API key, khi AI lỗi, hoặc khi hết lượt miễn phí.
// Không tốn tiền gọi AI, nên luôn có thứ để người dùng làm thiệp.

const BY_RECIPIENT: Record<string, string[]> = {
  "ong-ba": [
    "Năm mới Đinh Mùi, cháu kính chúc ông bà sống lâu trăm tuổi, mạnh khỏe an khang, con cháu sum vầy quây quần bên mâm cơm ngày Tết.",
    "Xuân về rộn rã, cháu chúc ông bà luôn vui vẻ, ăn ngon ngủ yên, mỗi ngày đều là một ngày Tết.",
    "Chúc ông bà phúc như Đông Hải, thọ tỉ Nam Sơn, năm mới thêm nhiều niềm vui bên con cháu.",
  ],
  "bo-me": [
    "Năm mới con chúc bố mẹ luôn mạnh khỏe, bình an, bớt lo toan và có thật nhiều niềm vui bên cả nhà.",
    "Tết này con chỉ mong bố mẹ khỏe mạnh, cười nhiều hơn năm cũ. Con thương bố mẹ nhiều lắm.",
    "Chúc bố mẹ một năm Đinh Mùi an khang thịnh vượng, vạn sự như ý, nhà mình lúc nào cũng ấm áp.",
  ],
  "vo-chong": [
    "Năm mới chúc mình của anh/em luôn xinh tươi, khỏe mạnh, và mình cùng nhau đi qua thêm một năm thật hạnh phúc.",
    "Cảm ơn mình đã cùng nhau vun vén tổ ấm. Chúc năm Đinh Mùi nhà mình thuận hòa, tiền vô như nước.",
  ],
  "nguoi-yeu": [
    "Năm mới chúc người thương luôn rạng rỡ, mọi điều suôn sẻ, và năm nay mình vẫn nắm tay nhau thật chặt.",
    "Xuân này có em/anh là đủ ấm. Chúc người ấy một năm Đinh Mùi hiền hòa, bình yên và mọi ước mơ đều thành thật.",
  ],
  "ban-be": [
    "Chúc bạn năm Đinh Mùi tam dương khai thái, tiền vào như nước, tình yêu như mơ, sức khỏe dồi dào.",
    "Năm mới chúc bạn bớt deadline, thêm lương thưởng, đi đâu cũng gặp may.",
    "Chúc bạn một năm Đinh Mùi hanh thông, mọi kế hoạch đều về đích đúng hẹn.",
  ],
  "dong-nghiep": [
    "Chúc anh/chị năm mới dồi dào sức khỏe, công việc thuận lợi, thăng tiến vững vàng và gia đình hạnh phúc.",
    "Cảm ơn bạn đã đồng hành suốt năm qua. Chúc năm Đinh Mùi của bạn thật nhiều thành tựu và niềm vui.",
  ],
  sep: [
    "Em kính chúc anh/chị năm mới an khang thịnh vượng, sức khỏe dồi dào, dẫn dắt công ty ngày càng vững mạnh.",
    "Nhân dịp xuân Đinh Mùi, em kính chúc anh/chị và gia đình vạn sự như ý, sự nghiệp ngày càng phát triển.",
  ],
  "khach-hang": [
    "Kính chúc Quý khách năm mới an khang thịnh vượng, kinh doanh phát đạt. Cảm ơn Quý khách đã tin tưởng đồng hành.",
    "Xuân Đinh Mùi, kính chúc Quý khách và gia đình sức khỏe, hạnh phúc, vạn sự hanh thông.",
  ],
  "thay-co": [
    "Năm mới em kính chúc thầy cô mạnh khỏe, hạnh phúc, luôn giữ ngọn lửa yêu nghề và gặp nhiều học trò ngoan.",
    "Nhân dịp Tết đến xuân về, em kính chúc thầy cô và gia đình an khang, vạn sự như ý.",
  ],
};

const COUPLETS = [
  { left: "Xuân sang cội phúc sinh nhành lộc", right: "Tết đến cây đời nảy lộc hoa", banner: "Vạn Sự Như Ý" },
  { left: "Tam dương khai thái xuân như ý", right: "Ngũ phúc lâm môn Tết an khang", banner: "Tam Dương Khai Thái" },
  { left: "Tân niên phúc lộc đầy nhà", right: "Xuân mới an khang khắp chốn", banner: "An Khang Thịnh Vượng" },
];

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function fallbackGreetings(req: GenerateRequest): GenerateResult {
  const pool = BY_RECIPIENT[req.recipient] ?? BY_RECIPIENT["ban-be"];
  const seed = hash(`${req.recipient}|${req.tone}|${req.recipientName ?? ""}`);
  const rotated = pool.map((_, i) => pool[(i + seed) % pool.length]);
  // Lời soạn sẵn đã có cách xưng hô theo người nhận, nên chỉ ký tên người gửi ở cuối.
  const withNames = rotated.map((g) => (req.senderName ? `${g}\n${req.senderName}` : g));
  return { greetings: withNames, couplet: COUPLETS[seed % COUPLETS.length] };
}
