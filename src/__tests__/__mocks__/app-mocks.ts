/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock 팩토리는 테스트마다 바뀌는 값을 늦게 읽어야 해서 require를 쓴다 */
// 화면 테스트 공통: supabase, env, 스플래시를 가짜로 바꾼다. 테스트 파일 맨 위에서 import한다
jest.mock('@/lib/supabase', () => ({
  supabase: {
    get auth() {
      return require('./fake-auth').testAuth.current.auth;
    },
    from: (table: string) => require('./fake-auth').testProfiles.current.from(table),
  },
}));
jest.mock('@/lib/env', () => ({
  getEnv: () => require('./fake-auth').testEnv.current,
}));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => {}),
  hideAsync: jest.fn(async () => {}),
}));

// 캐시(queryClient)는 모듈 하나라 테스트끼리 이어진다. 앞 테스트의 프로필이 남지 않게 매번 비우고 기본 사용자로 되돌린다
afterEach(() => {
  require('@/lib/query-client').queryClient.clear();
  const fake = require('./fake-auth');
  fake.testProfiles.current = fake.createFakeProfiles('experienced');
});

export {};
