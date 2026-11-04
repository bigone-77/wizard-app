// 앱이 붙을 Supabase를 바꾼다. 결과는 .env 하나 (커밋하지 않음)
//   pnpm env:local  로컬 Supabase(pnpm db:start)의 주소와 anon 키로 .env를 만든다
//   pnpm env:dev    .env.dev(대시보드 값을 직접 채운 파일)를 검사한 뒤 .env로 복사한다
// 바꾼 뒤에는 Metro를 다시 켠다: npx expo start --dev-client --clear (EXPO_PUBLIC_ 값은 번들에 박힘)

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseEnv } from '../lib/env.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** KEY="value" 줄들을 읽는다 (supabase status -o env, .env 파일 모두 이 형식) */
function readKeyValues(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/.exec(line);
    if (match && !line.trim().startsWith('#')) values[match[1]] = match[2];
  }
  return values;
}

function toEnvFile(values: Record<string, string>): string {
  return `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}

/** supabase status -o env 출력에서 앱용 .env를 만든다. 비밀 키(SERVICE_ROLE_KEY, SECRET_KEY)는 옮기지 않는다 */
export function localEnvFromStatus(statusOutput: string): string {
  const status = readKeyValues(statusOutput);
  const url = status.API_URL;
  const key = status.ANON_KEY ?? status.PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('로컬 Supabase 주소를 찾지 못했다. 먼저 pnpm db:start로 켠다');
  }
  const values = {
    EXPO_PUBLIC_APP_ENV: 'local',
    EXPO_PUBLIC_SUPABASE_URL: url,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: key,
    EXPO_PUBLIC_ENABLE_EMAIL_LOGIN: 'true',
  };
  parseEnv(values);
  return toEnvFile(values);
}

function switchToLocal() {
  let output = '';
  try {
    output = execFileSync(
      'npx',
      ['supabase', 'status', '-o', 'env', '--workdir', '../wizard-backend'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch {
    // 꺼져 있으면 status가 실패한다. 아래에서 안내한다
  }
  writeFileSync(`${root}.env`, localEnvFromStatus(output));
}

function switchToDev() {
  const source = `${root}.env.dev`;
  if (!existsSync(source)) {
    throw new Error(
      '.env.dev가 없다. .env.example을 복사해 wizard-dev 대시보드의 URL과 anon 키를 채운다',
    );
  }
  const values = readKeyValues(readFileSync(source, 'utf8'));
  const env = parseEnv(values);
  if (env.appEnv !== 'dev') throw new Error('.env.dev의 EXPO_PUBLIC_APP_ENV는 dev여야 한다');
  writeFileSync(`${root}.env`, toEnvFile(values));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (target === 'local') switchToLocal();
  else if (target === 'dev') switchToDev();
  else throw new Error('사용법: pnpm env:local 또는 pnpm env:dev');
  console.log(
    `.env를 ${target} 환경으로 바꿨다. Metro를 다시 켠다: npx expo start --dev-client --clear`,
  );
}
