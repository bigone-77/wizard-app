import { describe, expect, it } from 'vitest';

import { parseEnv } from '@/lib/env';

// JWT 형식 키 (서명은 검사하지 않으므로 아무 값)
const jwt = (payload: Record<string, unknown>) =>
  ['e30', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');

const local = {
  EXPO_PUBLIC_APP_ENV: 'local',
  EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'anon' }),
  EXPO_PUBLIC_ENABLE_EMAIL_LOGIN: 'true',
};

describe('env 검사 (16-architecture 12장, CLAUDE.md 환경 표)', () => {
  it('local 값을 읽고 이메일 로그인을 boolean으로 바꾼다', () => {
    expect(parseEnv(local)).toEqual({
      appEnv: 'local',
      supabaseUrl: 'http://127.0.0.1:54321',
      supabaseAnonKey: local.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      enableEmailLogin: true,
    });
  });

  it('publishable 키(sb_publishable_)도 받는다', () => {
    const key = 'sb_publishable_abc123';
    expect(parseEnv({ ...local, EXPO_PUBLIC_SUPABASE_ANON_KEY: key }).supabaseAnonKey).toBe(key);
  });

  it('빠진 변수가 있으면 이름을 알려주며 실패한다', () => {
    const { EXPO_PUBLIC_SUPABASE_URL: _url, ...missing } = local;
    expect(() => parseEnv(missing)).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
  });

  it('APP_ENV는 local, dev, alpha만', () => {
    expect(() => parseEnv({ ...local, EXPO_PUBLIC_APP_ENV: 'prod' })).toThrow(
      /EXPO_PUBLIC_APP_ENV/,
    );
  });

  it('local이 아니면 https 주소여야 한다', () => {
    expect(() =>
      parseEnv({
        ...local,
        EXPO_PUBLIC_APP_ENV: 'dev',
        EXPO_PUBLIC_SUPABASE_URL: 'http://x.supabase.co',
      }),
    ).toThrow(/https/);
  });

  it('alpha에서 이메일 로그인을 켜면 실패한다 (CLAUDE.md 규칙 13)', () => {
    expect(() =>
      parseEnv({
        ...local,
        EXPO_PUBLIC_APP_ENV: 'alpha',
        EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
        EXPO_PUBLIC_ENABLE_EMAIL_LOGIN: 'true',
      }),
    ).toThrow(/EXPO_PUBLIC_ENABLE_EMAIL_LOGIN/);
  });

  describe('비밀 키는 절대 받지 않는다 (CLAUDE.md 규칙 11)', () => {
    it.each([
      ['service_role JWT', jwt({ role: 'service_role' })],
      ['secret 키', 'sb_secret_abc123'],
    ])('%s', (_name, key) => {
      expect(() => parseEnv({ ...local, EXPO_PUBLIC_SUPABASE_ANON_KEY: key })).toThrow(
        /service_role|secret/,
      );
    });
  });
});
