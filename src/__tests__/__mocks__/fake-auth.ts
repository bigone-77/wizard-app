// 테스트용 가짜 supabase.auth. 세션을 바꾸면 onAuthStateChange 구독자에게 알린다
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type Listener = (event: AuthChangeEvent, session: Session | null) => void;

export const fakeSession = { access_token: 't', user: { id: 'u1' } } as unknown as Session;

export function createFakeAuth(initial: Session | null) {
  let session = initial;
  const listeners = new Set<Listener>();
  let resolveGetSession: (() => void) | undefined;
  let holdGetSession = false;

  const emit = (event: AuthChangeEvent, next: Session | null) => {
    session = next;
    listeners.forEach((l) => l(event, next));
  };

  const auth = {
    getSession: jest.fn(
      () =>
        new Promise<{ data: { session: Session | null }; error: null }>((resolve) => {
          const done = () => resolve({ data: { session }, error: null });
          if (holdGetSession) resolveGetSession = done;
          else done();
        }),
    ),
    onAuthStateChange: jest.fn((listener: Listener) => {
      listeners.add(listener);
      return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
    }),
    signInWithPassword: jest.fn(async () => {
      emit('SIGNED_IN', fakeSession);
      return { data: { session: fakeSession, user: fakeSession.user }, error: null };
    }),
    signUp: jest.fn(async () => {
      emit('SIGNED_IN', fakeSession);
      return { data: { session: fakeSession, user: fakeSession.user }, error: null };
    }),
    signOut: jest.fn(async () => {
      emit('SIGNED_OUT', null);
      return { error: null };
    }),
  };

  return {
    auth,
    emit,
    /** getSession 응답을 멈춰 둔다 (세션 읽는 중 상태 시험) */
    holdGetSession: () => {
      holdGetSession = true;
    },
    releaseGetSession: () => resolveGetSession?.(),
  };
}

// jest.mock 팩토리에서 늦게 읽도록 바꿀 수 있는 자리를 둔다 (테스트마다 새 값으로 바꿈)
export const testAuth = { current: createFakeAuth(null) };
export const testEnv = {
  current: {
    appEnv: 'local' as const,
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseAnonKey: 'sb_publishable_test',
    enableEmailLogin: true,
  },
};
