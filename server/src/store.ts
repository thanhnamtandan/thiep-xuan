// Bộ nhớ trong tiến trình. Đủ cho MVP chạy 1 máy chủ.
// Khi chạy nhiều máy chủ, chuyển sang Redis (hoặc Upstash) với cùng giao diện.

export class TtlCache<V> {
  private map = new Map<string, { value: V; expires: number }>();
  constructor(private maxEntries: number, private ttlMs: number) {}

  get(key: string): V | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V): void {
    if (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

/** Giới hạn lượt gọi AI miễn phí mỗi thiết bị mỗi ngày (giờ Việt Nam). */
export class Quota {
  private used = new Map<string, number>();
  private day = Quota.today();
  constructor(private perDay: number) {}

  private static today(): string {
    return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  }

  private roll(): void {
    const d = Quota.today();
    if (d !== this.day) {
      this.day = d;
      this.used.clear();
    }
  }

  remaining(id: string): number {
    this.roll();
    return Math.max(0, this.perDay - (this.used.get(id) ?? 0));
  }

  take(id: string): boolean {
    if (this.remaining(id) <= 0) return false;
    this.used.set(id, (this.used.get(id) ?? 0) + 1);
    return true;
  }

  refund(id: string): void {
    const n = this.used.get(id) ?? 0;
    if (n > 0) this.used.set(id, n - 1);
  }
}
