/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock 팩토리 안, env를 정한 뒤 모듈을 불러올 때 require가 필요 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
  };
});
jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => new Uint8Array(require('node:crypto').randomBytes(n)),
}));

process.env.EXPO_PUBLIC_APP_ENV = 'local';
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_test';
process.env.EXPO_PUBLIC_ENABLE_EMAIL_LOGIN = 'true';

const { secureSessionStorage, supabase } =
  require('@/lib/supabase') as typeof import('@/lib/supabase');

const KEY = 'sb-127-auth-token';
const SESSION = JSON.stringify({ access_token: 'a'.repeat(3000), refresh_token: 'r' });

describe('세션 저장소 (16-architecture: 세션은 기기 보안 저장소에)', () => {
  beforeEach(async () => {
    await secureSessionStorage.removeItem(KEY);
  });

  it('저장한 세션을 다시 읽으면 같다 (SecureStore 2KB 제한보다 큰 세션 포함)', async () => {
    await secureSessionStorage.setItem(KEY, SESSION);
    expect(await secureSessionStorage.getItem(KEY)).toBe(SESSION);
  });

  it('AsyncStorage에는 암호화한 값만, SecureStore에는 키(32바이트)만 들어간다', async () => {
    await secureSessionStorage.setItem(KEY, SESSION);
    const stored = await AsyncStorage.getItem(KEY);
    expect(stored).not.toContain('access_token');
    const key = await SecureStore.getItemAsync(KEY);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it('지우면 두 저장소에서 모두 지워진다', async () => {
    await secureSessionStorage.setItem(KEY, SESSION);
    await secureSessionStorage.removeItem(KEY);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(await SecureStore.getItemAsync(KEY)).toBeNull();
  });

  it('암호화 키가 없으면(백업 복원 등) 로그아웃 상태(null)로 본다', async () => {
    await secureSessionStorage.setItem(KEY, SESSION);
    await SecureStore.deleteItemAsync(KEY);
    expect(await secureSessionStorage.getItem(KEY)).toBeNull();
  });
});

describe('Supabase 클라이언트', () => {
  it('env의 주소로 만들어진다', () => {
    expect((supabase as unknown as { supabaseUrl: string }).supabaseUrl).toBe(
      'http://127.0.0.1:54321',
    );
  });
});
