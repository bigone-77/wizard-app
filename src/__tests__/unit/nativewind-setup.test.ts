import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const pkg = (dir: string) => JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'));

// Metro는 NODE_PATH를 보지 않고 node_modules 폴더만 따라간다.
// (pnpm 스크립트는 NODE_PATH를 .pnpm/node_modules로 잡아서 require.resolve로는 문제가 안 보인다)
describe('NativeWind 설치 (pnpm)', () => {
  const interop = resolve(root, 'node_modules/react-native-css-interop');

  // nativewind/babel이 모든 화면의 JSX를 react-native-css-interop/jsx-runtime으로 바꾼다
  it.each(['jsx-runtime', 'jsx-dev-runtime'])('최상위 node_modules에서 %s를 찾을 수 있다', (mod) => {
    expect(existsSync(resolve(interop, mod))).toBe(true);
  });

  it('직접 설치한 react-native-css-interop은 nativewind가 쓰는 버전과 같다', () => {
    const nativewind = pkg(resolve(root, 'node_modules/nativewind'));
    expect(pkg(interop).version).toBe(nativewind.dependencies['react-native-css-interop']);
  });
});
