// DB 타입 생성: pnpm db:types → src/types/database.ts (16-architecture 16.2)
// 로컬 Supabase(pnpm db:start)에서 public 스키마만 만든다. 세 환경은 같은 마이그레이션이라 결과가 같다
// 생성이 실패하면 기존 파일을 건드리지 않는다 (셸의 > 리디렉션은 실패해도 파일을 비워버림)

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HEADER = [
  '// 자동 생성 파일: 직접 수정하지 않는다.',
  '// wizard-backend 마이그레이션이 바뀌면 pnpm db:start 후 pnpm db:types로 다시 만든다.',
  '',
  '',
].join('\n');

export function databaseTypesFile(generated: string): string {
  if (!generated.includes('export type Database')) {
    throw new Error(
      'DB 타입을 만들지 못했다. 로컬 Supabase가 켜져 있는지 확인한다 (pnpm db:start)',
    );
  }
  return HEADER + generated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  let output = '';
  try {
    output = execFileSync(
      'npx',
      [
        'supabase',
        'gen',
        'types',
        'typescript',
        '--workdir',
        '../wizard-backend',
        '--schema',
        'public',
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
    );
  } catch {
    // 아래에서 안내한다
  }
  const out = `${root}src/types/database.ts`;
  writeFileSync(out, databaseTypesFile(output));
  console.log(`생성: ${out}`);
}
