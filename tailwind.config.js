// 디자인 토큰 원본: design/wizard-tokens.json → pnpm tokens → src/theme/tokens.generated.json
// 색·간격·모서리·그림자는 기본값을 확장하지 않고 통째로 바꾼다.
// 그래서 토큰에 없는 값(p-7, bg-sky-500, text-sm)은 클래스로 만들어지지 않는다.
const plugin = require('tailwindcss/plugin');
const tokens = require('./src/theme/tokens.generated.json');

const typography = plugin(({ addUtilities }) => {
  const utilities = {};
  for (const [name, style] of Object.entries(tokens.typography)) {
    utilities[`.typo-${name}`] = {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      lineHeight: `${style.lineHeight}px`,
      letterSpacing: `${style.letterSpacing}px`,
    };
  }
  addUtilities(utilities);
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors: { transparent: 'transparent', ...tokens.colors },
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.boxShadow,
    // 글자는 typo-* 묶음 클래스로만 지정한다 (크기·줄 높이·자간·폰트가 Figma 스타일 단위로 묶여 있음)
    fontSize: {},
    fontFamily: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {},
    // 크기 토큰은 간격 위에 더한다 (h-4도 h-touch도 됨). extend라서 h-full, w-auto 같은 기본값은 남는다
    extend: {
      height: tokens.size,
      width: tokens.size,
      minHeight: tokens.size,
      minWidth: tokens.size,
    },
  },
  plugins: [typography],
};
