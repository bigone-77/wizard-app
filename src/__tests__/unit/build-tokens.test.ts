import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildTheme, type ColorTree, toLetterSpacing, toLineHeight } from '@/theme/build-tokens';

// 색 나무에서 "text.1" 같은 경로로 값을 꺼낸다
const at = (tree: ColorTree, path: string): string | ColorTree | undefined =>
  path
    .split('.')
    .reduce<string | ColorTree | undefined>(
      (node, key) => (typeof node === 'object' ? node[key] : undefined),
      tree,
    );

const root = resolve(__dirname, '../../..');
const source = JSON.parse(readFileSync(resolve(root, 'design/wizard-tokens.json'), 'utf8'));

// 최소 Tokens Studio 형식: 세트 이름(core 등)은 참조 경로에 들어가지 않는다
const minimal = (extra: Record<string, unknown> = {}) => ({
  core: {
    color: {
      white: { $type: 'color', $value: '#ffffff' },
      gray: { '400': { $type: 'color', $value: '#99a1af' } },
    },
    spacing: {
      x0_5: { $type: 'spacing', $value: '2px' },
      x4: { $type: 'spacing', $value: '16px' },
    },
    size: { touch: { $type: 'sizing', $value: '44px' } },
    fontFamilies: { pretendard: { $type: 'fontFamilies', $value: 'Pretendard' } },
    fontWeights: { semibold: { $type: 'fontWeights', $value: 'SemiBold' } },
    fontSize: { '14': { $type: 'fontSizes', $value: '14' } },
    lineHeights: { '18': { $type: 'lineHeights', $value: '18' } },
    letterSpacing: { tight: { $type: 'letterSpacing', $value: '-2%' } },
  },
  semantic_color: {
    text: { '1': { $type: 'color', $value: '{color.gray.400}' } },
    button: { primary_1: { $type: 'color', $value: '{color.white}' } },
  },
  typography: {
    Base: {
      m_14_2: {
        $type: 'typography',
        $value: {
          fontFamily: '{fontFamilies.pretendard}',
          fontWeight: '{fontWeights.semibold}',
          fontSize: '{fontSize.14}',
          lineHeight: '{lineHeights.18}',
          letterSpacing: '{letterSpacing.tight}',
        },
      },
    },
  },
  $themes: [],
  $metadata: { tokenSetOrder: ['core', 'semantic_color', 'typography'] },
  ...extra,
});

describe('참조 풀기', () => {
  it('시맨틱 색의 {color.gray.400} 참조를 실제 값으로 바꾼다', () => {
    const theme = buildTheme(minimal());
    expect(at(theme.colors, 'text.1')).toBe('#99a1af');
  });

  it('이름의 _는 클래스에 맞게 -로 바꾼다 (button.primary_1 → bg-button-primary-1)', () => {
    const theme = buildTheme(minimal());
    expect(at(theme.colors, 'button.primary-1')).toBe('#ffffff');
  });

  it('없는 토큰을 참조하면 경로를 알려주며 실패한다', () => {
    const broken = minimal();
    broken.semantic_color.text['1'].$value = '{color.gray.999}';
    expect(() => buildTheme(broken)).toThrow(/color\.gray\.999/);
  });

  it('서로 참조하는 고리가 있으면 실패한다', () => {
    const cyclic = minimal();
    cyclic.core.color.white.$value = '{text.1}';
    cyclic.semantic_color.text['1'].$value = '{color.white}';
    expect(() => buildTheme(cyclic)).toThrow(/순환/);
  });
});

describe('간격', () => {
  it('x0_5, x4를 Tailwind 숫자 키 0.5, 4로 바꾼다 (p-4 = 16px)', () => {
    const theme = buildTheme(minimal());
    expect(theme.spacing).toMatchObject({ '0': '0px', '0.5': '2px', '4': '16px' });
  });
});

describe('크기', () => {
  it('size.touch를 h-touch, min-h-touch 등에 쓸 크기로 만든다', () => {
    const theme = buildTheme(minimal());
    expect(theme.size).toEqual({ touch: '44px' });
  });
});

describe('글자 스타일', () => {
  it('자간 -2%는 글자 크기 기준 px로 바꾼다', () => {
    expect(toLetterSpacing('-2%', 14)).toBe(-0.28);
    expect(toLetterSpacing('-2%', 40)).toBe(-0.8);
    expect(toLetterSpacing('0.5', 14)).toBe(0.5);
  });

  it('줄 높이는 숫자면 px, %면 글자 크기 배수', () => {
    expect(toLineHeight('18', 14)).toBe(18);
    expect(toLineHeight('150%', 14)).toBe(21);
  });

  it('굵기 이름을 Pretendard 파일 이름으로 바꾼다 (Android는 굵기마다 폰트 이름이 달라야 함)', () => {
    const theme = buildTheme(minimal());
    expect(theme.typography['base-m-14-2']).toEqual({
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: -0.28,
    });
    expect(theme.fonts).toEqual(['Pretendard-SemiBold']);
  });

  it('모르는 굵기 이름이면 실패한다', () => {
    const broken = minimal();
    broken.core.fontWeights.semibold.$value = 'Heavy';
    expect(() => buildTheme(broken)).toThrow(/Heavy/);
  });
});

describe('실제 토큰 파일 (design/wizard-tokens.json)', () => {
  const theme = buildTheme(source);

  it('모든 참조가 풀린다', () => {
    const values = JSON.stringify(theme);
    expect(values).not.toMatch(/\{[a-zA-Z]/);
  });

  it('Figma 시맨틱 색 이름이 그대로 있다', () => {
    expect(at(theme.colors, 'text')).toMatchObject({
      '1': '#99a1af',
      '3': '#1e2939',
      primary: '#7008e7',
    });
    expect(at(theme.colors, 'bg')).toMatchObject({ '1': '#ffffff', '2': '#f9fafb' });
    expect(at(theme.colors, 'signal.red')).toEqual({
      bg: '#fef2f2',
      fill: '#e7000b',
      text: '#c10007',
    });
  });

  it('글자 스타일 20종, 굵기 4종', () => {
    expect(Object.keys(theme.typography)).toHaveLength(20);
    expect(theme.fonts).toEqual([
      'Pretendard-Bold',
      'Pretendard-Medium',
      'Pretendard-Regular',
      'Pretendard-SemiBold',
    ]);
  });

  it('터치 영역 44px이 있다', () => {
    expect(theme.size.touch).toBe('44px');
  });

  it('그림자는 CSS box-shadow 문자열', () => {
    expect(theme.boxShadow['level-0']).toBe('0px 2px 4px 0px rgba(0, 0, 0, 0.10)');
  });

  it('생성 파일이 원본과 같다 (다르면 pnpm tokens 실행)', () => {
    const generated = JSON.parse(
      readFileSync(resolve(root, 'src/theme/tokens.generated.json'), 'utf8'),
    );
    expect(generated).toEqual(theme);
  });
});
