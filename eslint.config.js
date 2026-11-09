// ESLint 9 flat 설정. 서식은 Prettier가 맡고(eslint-config-prettier가 서식 규칙을 끔), ESLint는 코드 문제만 본다
const path = require('node:path');

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const tailwind = require('eslint-plugin-tailwindcss');

module.exports = defineConfig([
  expoConfig,
  tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: { config: path.join(__dirname, 'tailwind.config.js') },
    },
    rules: {
      // CLAUDE.md 토큰 규칙: 토큰에 없는 클래스(bg-sky-500, text-sm)와 대괄호 값(h-[44px])은 오류
      'tailwindcss/no-custom-classname': 'error',
      'tailwindcss/no-arbitrary-value': 'error',
      // 클래스 순서는 prettier-plugin-tailwindcss가 정렬한다 (둘 다 켜면 서로 부딪힘)
      'tailwindcss/classnames-order': 'off',
    },
  },
  {
    // 루트 설정 파일(babel, metro, tailwind, eslint)은 Node에서 CommonJS로 실행된다
    files: ['*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { __dirname: 'readonly', require: 'readonly', module: 'writable' },
    },
  },
  prettierConfig,
  {
    ignores: ['ios/*', 'android/*', 'src/theme/tokens.generated.json', 'src/types/database.ts'],
  },
]);
