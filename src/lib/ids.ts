// 모든 insert의 ID (CLAUDE.md 규칙 5, 16-architecture 1장). 재시도는 같은 ID로
//
// uuid의 v7()은 난수를 직접 넘기면(전역 crypto 없이 expo-crypto를 쓰려면 필요) 같은 밀리초 안의 순서를
// 지켜주는 내부 상태를 쓰지 않는다. 그래서 그 상태(시각, 순번)만 여기서 uuid와 같은 방식으로 관리한다.

import { getRandomBytes } from 'expo-crypto';
import { v7 } from 'uuid';

export function createUuidv7(random: (n: number) => Uint8Array, now: () => number = Date.now) {
  let msecs = -Infinity;
  let seq = 0;
  return function uuidv7(): string {
    const bytes = random(16);
    const t = now();
    if (t > msecs) {
      // 새 밀리초: 순번을 난수에서 시작 (uuid의 v7Sequence와 같은 31비트)
      seq = ((bytes[6] & 0x7f) << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
      msecs = t;
    } else {
      // 같은 밀리초이거나 시계가 뒤로 감: 순번을 올린다. 넘치면 시각을 1ms 앞으로
      seq = (seq + 1) | 0;
      if (seq === 0) msecs++;
    }
    return v7({ msecs, seq, random: bytes });
  };
}

export const uuidv7 = createUuidv7(getRandomBytes);
