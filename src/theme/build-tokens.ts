// Tokens Studio JSON(design/wizard-tokens.json)을 NativeWind 테마로 바꾼다.
// 실행: pnpm tokens → src/theme/tokens.generated.json 생성 (tailwind.config.js와 앱 코드가 읽음)
//
// Node가 타입만 지우고 바로 실행하므로(--experimental-strip-types) 다른 파일을 import하지 않는다.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type TokenValue = string | Record<string, string>;
type Token = { $type: string; $value: TokenValue };
type TokenGroup = { [key: string]: Token | TokenGroup };
export type TokenSource = {
  $metadata: { tokenSetOrder: string[] };
  [set: string]: unknown;
};

export type ColorTree = { [key: string]: string | ColorTree };
export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};
export type Theme = {
  colors: ColorTree;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  size: Record<string, string>;
  iconSize: Record<string, number>;
  typography: Record<string, TextStyle>;
  fonts: string[];
};

// Figma 굵기 이름 → 폰트 파일 이름의 접미사 (assets/fonts/Pretendard-{접미사}.otf)
const FONT_WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'];

// 시맨틱 색 세트 이름. 이 세트의 첫 단계(text, bg ...)가 색 이름의 앞부분이 된다
const SEMANTIC_COLOR_SET = 'semantic_color';

const isToken = (node: unknown): node is Token =>
  typeof node === 'object' && node !== null && '$value' in node;

const isGroup = (node: unknown): node is TokenGroup =>
  typeof node === 'object' && node !== null && !Array.isArray(node) && !isToken(node);

// 이름의 _는 클래스 이름에 맞게 -로 (primary_1 → primary-1, level_0 → level-0)
const kebab = (key: string) => key.replace(/_/g, '-').toLowerCase();

const px = (value: string | number) => `${parseFloat(String(value))}px`;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** 자간: "-2%"는 글자 크기 기준, 숫자는 px 그대로 */
export function toLetterSpacing(value: string, fontSize: number): number {
  if (value.endsWith('%')) return round2((parseFloat(value) / 100) * fontSize);
  return round2(parseFloat(value));
}

/** 줄 높이: "150%"는 글자 크기 배수, 숫자는 px 그대로 */
export function toLineHeight(value: string, fontSize: number): number {
  if (value.endsWith('%')) return round2((parseFloat(value) / 100) * fontSize);
  return round2(parseFloat(value));
}

/** 세트 이름을 빼고 모든 토큰을 "color.gray.400" 같은 경로로 모은다 (Tokens Studio 참조 규칙) */
function collect(source: TokenSource): Map<string, Token> {
  const tokens = new Map<string, Token>();
  const walk = (node: TokenGroup, path: string[]) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (isToken(child)) tokens.set([...path, key].join('.'), child);
      else if (isGroup(child)) walk(child, [...path, key]);
    }
  };
  for (const set of source.$metadata.tokenSetOrder) {
    const node = source[set];
    if (isGroup(node)) walk(node, []);
  }
  return tokens;
}

function makeResolver(tokens: Map<string, Token>) {
  const resolveString = (value: string, seen: string[]): string => {
    const ref = /^\{([^}]+)\}$/.exec(value);
    if (!ref) return value;
    const path = ref[1];
    if (seen.includes(path)) throw new Error(`토큰 참조가 순환한다: ${[...seen, path].join(' → ')}`);
    const target = tokens.get(path);
    if (!target) throw new Error(`없는 토큰을 참조한다: {${path}}`);
    if (typeof target.$value !== 'string') throw new Error(`묶음 토큰은 참조할 수 없다: {${path}}`);
    return resolveString(target.$value, [...seen, path]);
  };
  return (value: string) => resolveString(value, []);
}

export function buildTheme(source: TokenSource): Theme {
  const tokens = collect(source);
  const resolve = makeResolver(tokens);
  const byPrefix = (prefix: string) =>
    [...tokens.entries()]
      .filter(([path]) => path.startsWith(`${prefix}.`))
      .map(([path, token]) => [path.slice(prefix.length + 1), token] as const);

  // 색: 원색(color.*) + 시맨틱 색(text, bg, button ...)을 한 나무로. bg-gray-50, text-text-1
  const colors: ColorTree = {};
  const setColor = (path: string[], value: string) => {
    let node = colors;
    for (const key of path.slice(0, -1)) {
      const next = node[key];
      if (typeof next === 'string') throw new Error(`색 이름이 겹친다: ${path.join('.')}`);
      node = next ?? (node[key] = {});
    }
    node[path[path.length - 1]] = value;
  };
  for (const [path, token] of byPrefix('color')) {
    setColor(path.split('.').map(kebab), resolve(String(token.$value)));
  }
  const semantic = source[SEMANTIC_COLOR_SET];
  if (isGroup(semantic)) {
    for (const group of Object.keys(semantic)) {
      for (const [path, token] of byPrefix(group)) {
        setColor([group, ...path.split('.')].map(kebab), resolve(String(token.$value)));
      }
    }
  }

  // 간격: x0_5 → "0.5", x4 → "4". 0은 토큰이 아니지만 여백을 없앨 때(p-0) 필요해서 둔다
  const spacing: Record<string, string> = { '0': '0px' };
  for (const [name, token] of byPrefix('spacing')) {
    spacing[name.replace(/^x/, '').replace('_', '.')] = px(resolve(String(token.$value)));
  }

  const borderRadius: Record<string, string> = {};
  for (const [name, token] of byPrefix('radius')) {
    borderRadius[kebab(name)] = px(resolve(String(token.$value)));
  }

  // 크기: 간격과 따로 둔다 (p-touch 같은 여백으로 쓰이지 않게). h-touch, min-w-touch
  const size: Record<string, string> = {};
  for (const [name, token] of byPrefix('size')) {
    size[kebab(name)] = px(resolve(String(token.$value)));
  }

  const iconSize: Record<string, number> = {};
  for (const [name, token] of byPrefix('iconSize')) {
    iconSize[kebab(name)] = parseFloat(resolve(String(token.$value)));
  }

  const boxShadow: Record<string, string> = {};
  for (const [name, token] of byPrefix('shadow')) {
    const v = token.$value;
    if (typeof v === 'string') throw new Error(`그림자 형식이 아니다: shadow.${name}`);
    const r = (key: string) => resolve(v[key] ?? '0');
    boxShadow[kebab(name)] = `${px(r('x'))} ${px(r('y'))} ${px(r('blur'))} ${px(r('spread'))} ${r('color')}`;
  }

  // 글자 스타일: Base.m_14_2 → "base-m-14-2" (클래스 typo-base-m-14-2)
  const typography: Record<string, TextStyle> = {};
  const fonts = new Set<string>();
  for (const [path, token] of tokens) {
    if (token.$type !== 'typography') continue;
    const v = token.$value;
    if (typeof v === 'string') throw new Error(`글자 스타일 형식이 아니다: ${path}`);
    const weight = resolve(v.fontWeight);
    if (!FONT_WEIGHTS.includes(weight)) {
      throw new Error(`폰트 파일이 없는 굵기다: ${weight} (${path}). 가능한 값: ${FONT_WEIGHTS.join(', ')}`);
    }
    const fontFamily = `${resolve(v.fontFamily)}-${weight}`;
    const fontSize = parseFloat(resolve(v.fontSize));
    fonts.add(fontFamily);
    typography[path.split('.').map(kebab).join('-')] = {
      fontFamily,
      fontSize,
      lineHeight: toLineHeight(resolve(v.lineHeight), fontSize),
      letterSpacing: toLetterSpacing(resolve(v.letterSpacing ?? '0'), fontSize),
    };
  }

  return {
    colors,
    spacing,
    borderRadius,
    boxShadow,
    size,
    iconSize,
    typography,
    fonts: [...fonts].sort(),
  };
}

// pnpm tokens로 직접 실행했을 때만 파일을 쓴다 (테스트에서 import할 때는 쓰지 않음)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const source = JSON.parse(readFileSync(`${root}design/wizard-tokens.json`, 'utf8'));
  const out = `${root}src/theme/tokens.generated.json`;
  writeFileSync(out, `${JSON.stringify(buildTheme(source), null, 2)}\n`);
  console.log(`생성: ${out}`);
}
