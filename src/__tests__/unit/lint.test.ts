import { resolve } from 'node:path';

import { ESLint } from 'eslint';
import { format as prettierFormat, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
// 실제 화면 경로에 있는 것처럼 검사한다 (eslint.config.js의 파일 범위가 그대로 적용됨)
const filePath = resolve(root, 'src/app/lint-sample.tsx');

const lintClassName = async (className: string) => {
  const eslint = new ESLint({ cwd: root });
  const code = `import { View } from 'react-native';\n\nexport default function Sample() {\n  return <View className="${className}" />;\n}\n`;
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId?.startsWith('tailwindcss/'));
};

describe('ESLint 토큰 클래스 검사 (CLAUDE.md 토큰 규칙)', () => {
  it.each(['bg-sky-500', 'p-7', 'text-sm', 'font-bold'])(
    '토큰에 없는 클래스 %s는 오류',
    async (className) => {
      const messages = await lintClassName(className);
      expect(messages).toEqual([
        expect.objectContaining({ ruleId: 'tailwindcss/no-custom-classname', severity: 2 }),
      ]);
    },
  );

  it.each(['h-[44px]', 'bg-[#fff]'])('대괄호 값 %s는 오류', async (className) => {
    const messages = await lintClassName(className);
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: 'tailwindcss/no-arbitrary-value', severity: 2 }),
    );
  });

  it('토큰 클래스는 오류가 없다 (플러그인으로 만든 typo-*, 크기 h-touch 포함)', async () => {
    const messages = await lintClassName(
      'flex-1 bg-bg-1 p-4 h-touch rounded-12 shadow-level-1 typo-base-m-14-1 text-text-3',
    );
    expect(messages).toEqual([]);
  });
});

describe('Prettier (지금 코드 스타일)', () => {
  const format = async (code: string) => {
    const options = await resolveConfig(filePath);
    return prettierFormat(code, { ...options, filepath: filePath });
  };

  it('작은따옴표, 세미콜론, 끝 쉼표를 쓴다', async () => {
    const out = await format('const a = {x: "1", y: "2"}\n');
    expect(out).toBe("const a = { x: '1', y: '2' };\n");
  });

  it('한 줄 100자까지는 줄을 바꾸지 않는다', async () => {
    const line = `const value = ['${'a'.repeat(30)}', '${'b'.repeat(30)}', '${'c'.repeat(10)}'];\n`;
    expect(line.length).toBeLessThanOrEqual(101);
    expect(await format(line)).toBe(line);
  });

  it('className을 Tailwind 순서로 정렬한다 (tailwind.config.js를 읽음)', async () => {
    const out = await format('const x = <View className="typo-base-m-14-1 p-4 flex-1 bg-bg-1" />;\n');
    expect(out).toBe('const x = <View className="flex-1 bg-bg-1 p-4 typo-base-m-14-1" />;\n');
  });
});
