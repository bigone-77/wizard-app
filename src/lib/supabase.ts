// Supabase 클라이언트 (16-architecture 3장·5장). 주소와 키는 env(local/dev/alpha)로 바뀐다
// DB 타입(Database 제네릭)은 T013에서 src/types/database.ts를 만든 뒤 붙인다

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

import { getEnv } from './env';

/**
 * 세션 저장소: 값마다 새 암호화 키(256비트)를 만들어 SecureStore(Keychain)에 두고,
 * 암호화한 세션은 AsyncStorage에 둔다. SecureStore는 값 크기 제한(2KB)이 있어 세션을 통째로 넣지 않는다.
 * (Supabase React Native 문서의 방식)
 */
export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    const keyHex = await SecureStore.getItemAsync(key);
    // 키가 없으면(앱 재설치, 백업 복원 등) 읽을 수 없다. 로그아웃 상태로 본다
    if (!keyHex) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(keyHex),
      new aesjs.Counter(1),
    );
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(encrypted)));
  },

  async setItem(key: string, value: string): Promise<void> {
    // 값마다 키를 새로 만들어서 CTR 카운터를 다시 써도 같은 키·카운터 조합이 나오지 않는다
    const encryptionKey = getRandomBytes(32);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  },
};

const env = getEnv();

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    // 앱은 URL로 세션을 받지 않는다 (웹 전용 옵션)
    detectSessionInUrl: false,
  },
});

// 앱이 앞에 있을 때만 토큰을 자동 갱신한다 (Supabase React Native 안내)
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
