import { randomBytes } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => new Uint8Array(randomBytes(n)),
}));

const { createUuidv7, uuidv7 } = await import('@/lib/ids');

const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const random = (n: number) => new Uint8Array(randomBytes(n));

describe('uuidv7() (CLAUDE.md 규칙 5: ID는 앱이 만든다)', () => {
  it('UUID 버전 7 형식이다', () => {
    expect(uuidv7()).toMatch(V7);
  });

  it('앞 48비트는 만든 시각(밀리초)이다', () => {
    const now = 1_762_000_000_000;
    const id = createUuidv7(random, () => now)();
    expect(parseInt(id.replace(/-/g, '').slice(0, 12), 16)).toBe(now);
  });

  it('같은 밀리초에 만든 ID도 만든 순서대로 정렬된다', () => {
    const make = createUuidv7(random, () => 1_762_000_000_000);
    const ids = Array.from({ length: 1000 }, () => make());
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(1000);
  });

  it('기기 시계가 뒤로 가도 이전 ID보다 뒤에 정렬된다', () => {
    let now = 1_762_000_000_000;
    const make = createUuidv7(random, () => now);
    const first = make();
    now -= 5_000;
    const second = make();
    expect(second > first).toBe(true);
  });
});
