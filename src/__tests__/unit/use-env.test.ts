import { describe, expect, it } from 'vitest';

import { localEnvFromStatus } from '@/scripts/use-env';

// supabase status -o env 출력 형식 (KEY="value")
const status = [
  'API_URL="http://127.0.0.1:54321"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"',
  'ANON_KEY="anon-jwt"',
  'SERVICE_ROLE_KEY="service-jwt"',
  'PUBLISHABLE_KEY="sb_publishable_local"',
  'SECRET_KEY="sb_secret_local"',
].join('\n');

describe('pnpm env:local (supabase status에서 .env 만들기)', () => {
  it('URL과 anon 키로 local .env를 만든다', () => {
    expect(localEnvFromStatus(status)).toBe(
      [
        'EXPO_PUBLIC_APP_ENV=local',
        'EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321',
        'EXPO_PUBLIC_SUPABASE_ANON_KEY=anon-jwt',
        'EXPO_PUBLIC_ENABLE_EMAIL_LOGIN=true',
        '',
      ].join('\n'),
    );
  });

  it('비밀 키(service_role, secret)는 옮기지 않는다', () => {
    const out = localEnvFromStatus(status);
    expect(out).not.toMatch(/service-jwt|sb_secret_local/);
  });

  it('ANON_KEY가 없으면 PUBLISHABLE_KEY를 쓴다', () => {
    const noAnon = status.replace('ANON_KEY="anon-jwt"\n', '');
    expect(localEnvFromStatus(noAnon)).toMatch(/ANON_KEY=sb_publishable_local/);
  });

  it('로컬 Supabase가 꺼져 있으면(주소가 없으면) pnpm db:start를 안내한다', () => {
    expect(() => localEnvFromStatus('')).toThrow(/pnpm db:start/);
  });
});
