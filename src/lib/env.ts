// 앱 환경 변수 검사 (16-architecture 12장, CLAUDE.md 환경 표)
// EXPO_PUBLIC_ 값은 앱 번들에 그대로 들어간다. 비밀 키가 들어오면 여기서 막는다 (CLAUDE.md 규칙 11, 12)
//
// pnpm env:dev 스크립트도 이 파일을 Node로 바로 불러 쓴다. 그래서 zod 말고는 import하지 않는다.

import { z } from 'zod';

export type AppEnv = {
  appEnv: 'local' | 'dev' | 'alpha';
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableEmailLogin: boolean;
};

/** service_role JWT, sb_secret_ 키인지 본다. 서명은 확인하지 않는다 (확인할 비밀이 앱에 없으므로) */
function isSecretKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const payload = key.split('.')[1];
  if (!payload) return false;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json: unknown = JSON.parse(
      globalThis.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
    );
    return (
      typeof json === 'object' && json !== null && 'role' in json && json.role === 'service_role'
    );
  } catch {
    return false;
  }
}

const schema = z
  .object({
    EXPO_PUBLIC_APP_ENV: z.enum(['local', 'dev', 'alpha']),
    EXPO_PUBLIC_SUPABASE_URL: z.url(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z
      .string()
      .min(1)
      .refine((key) => !isSecretKey(key), {
        message: 'service_role·secret 키는 앱에 넣지 않는다. anon(publishable) 키를 넣는다',
      }),
    EXPO_PUBLIC_ENABLE_EMAIL_LOGIN: z.enum(['true', 'false']),
  })
  .superRefine((value, ctx) => {
    if (
      value.EXPO_PUBLIC_APP_ENV !== 'local' &&
      !value.EXPO_PUBLIC_SUPABASE_URL.startsWith('https://')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['EXPO_PUBLIC_SUPABASE_URL'],
        message: 'local이 아니면 https 주소여야 한다',
      });
    }
    if (value.EXPO_PUBLIC_APP_ENV === 'alpha' && value.EXPO_PUBLIC_ENABLE_EMAIL_LOGIN === 'true') {
      ctx.addIssue({
        code: 'custom',
        path: ['EXPO_PUBLIC_ENABLE_EMAIL_LOGIN'],
        message: 'alpha에서는 이메일 로그인을 끈다 (false)',
      });
    }
  });

export function parseEnv(raw: Record<string, string | undefined>): AppEnv {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(
      `환경 변수가 올바르지 않다 (.env 확인, pnpm env:local 또는 pnpm env:dev)\n${lines.join('\n')}`,
    );
  }
  const v = result.data;
  return {
    appEnv: v.EXPO_PUBLIC_APP_ENV,
    supabaseUrl: v.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: v.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    enableEmailLogin: v.EXPO_PUBLIC_ENABLE_EMAIL_LOGIN === 'true',
  };
}

let cached: AppEnv | undefined;

/** 앱에서 쓰는 env. Expo는 process.env.EXPO_PUBLIC_X를 점으로 직접 쓴 곳만 값으로 바꿔 넣는다 */
export function getEnv(): AppEnv {
  cached ??= parseEnv({
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_ENABLE_EMAIL_LOGIN: process.env.EXPO_PUBLIC_ENABLE_EMAIL_LOGIN,
  });
  return cached;
}
