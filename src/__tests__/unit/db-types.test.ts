import { describe, expect, it } from 'vitest';

import { databaseTypesFile } from '@/scripts/db-types';

const generated = 'export type Json = string\n\nexport type Database = {\n  public: {}\n}\n';

describe('pnpm db:types (src/types/database.ts 생성)', () => {
  it('맨 위에 자동 생성 안내를 붙인다', () => {
    const out = databaseTypesFile(generated);
    expect(out.split('\n')[0]).toMatch(/자동 생성/);
    expect(out).toMatch(/직접 수정하지 않는다/);
    expect(out).toMatch(/pnpm db:types/);
    expect(out.endsWith(generated)).toBe(true);
  });

  it.each([
    ['빈 출력', ''],
    ['오류 메시지', '{"_tag":"Error","error":{"code":"DbConnectError"}}'],
  ])('%s이면 실패하고 pnpm db:start를 안내한다 (기존 파일을 덮어쓰지 않게)', (_name, output) => {
    expect(() => databaseTypesFile(output)).toThrow(/pnpm db:start/);
  });
});
