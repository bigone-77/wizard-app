import { defineConfig } from 'vitest/config';

// Vitest: 순수 로직 (CLAUDE.md 테스트 표). 컴포넌트·화면은 Jest가 맡는다
export default defineConfig({
  test: {
    include: ['src/__tests__/unit/**/*.test.ts'],
  },
});
