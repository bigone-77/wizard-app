import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import tokens from '@/theme/tokens.generated.json';

const root = resolve(__dirname, '../../..');
const appJson = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8'));

// expo-font 플러그인은 빌드할 때 폰트를 앱에 넣는다. 폰트 이름 = 파일 이름 (iOS, Android 모두)
const embedded = (): string[] => {
  const entry = appJson.expo.plugins.find(
    (p: unknown) => Array.isArray(p) && p[0] === 'expo-font',
  );
  return entry ? entry[1].fonts : [];
};

describe('글자 스타일이 쓰는 폰트 (typo-*)', () => {
  it.each(tokens.fonts)('%s 파일이 assets/fonts에 있다', (font) => {
    expect(existsSync(resolve(root, `assets/fonts/${font}.otf`))).toBe(true);
  });

  it('모든 폰트가 expo-font 플러그인으로 앱에 들어간다', () => {
    expect(embedded().sort()).toEqual(tokens.fonts.map((f) => `./assets/fonts/${f}.otf`).sort());
  });
});
