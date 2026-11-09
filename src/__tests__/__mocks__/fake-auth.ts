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

type DbError = { message: string; code: string };
const networkError: DbError = { message: 'Network request failed', code: '' };

/**
 * 테스트용 가짜 profiles 테이블. 앱이 쓰는 두 모양만 흉내 낸다
 * - 읽기: from('profiles').select(...).eq('id', id).single()
 * - 저장: from('profiles').update(values).eq('id', id).select('id')
 */
export function createFakeProfiles(experienceLevel: string | null) {
  const row = { id: fakeSession.user.id, experience_level: experienceLevel };
  let selectFailures = 0;
  let holdSelect = false;
  let releaseSelect: (() => void) | undefined;
  let updateFailures = 0;
  let updateMatchesNothing = false;
  let holdUpdate = false;
  let releaseUpdate: (() => void) | undefined;

  const wait = (hold: boolean, keep: (release: () => void) => void) =>
    new Promise<void>((resolve) => (hold ? keep(resolve) : resolve()));

  const select = jest.fn((_columns: string) => ({
    eq: (_column: 'id', id: string) => ({
      single: async () => {
        await wait(holdSelect, (r) => (releaseSelect = r));
        if (selectFailures > 0) {
          selectFailures -= 1;
          return { data: null, error: networkError };
        }
        return id === row.id
          ? { data: { experience_level: row.experience_level }, error: null }
          : { data: null, error: { message: 'no rows', code: 'PGRST116' } };
      },
    }),
  }));

  const update = jest.fn((values: { experience_level: string }) => ({
    eq: (_column: 'id', id: string) => ({
      select: async (_columns: 'id') => {
        await wait(holdUpdate, (r) => (releaseUpdate = r));
        if (updateFailures > 0) {
          updateFailures -= 1;
          return { data: null, error: networkError };
        }
        // 조건에 맞는 행이 없으면 PostgREST는 오류 없이 빈 배열을 준다
        if (updateMatchesNothing || id !== row.id) return { data: [], error: null };
        row.experience_level = values.experience_level;
        return { data: [{ id: row.id }], error: null };
      },
    }),
  }));

  return {
    row,
    select,
    update,
    from: jest.fn((_table: 'profiles') => ({ select, update })),
    /** 다음 n번 읽기를 네트워크 오류로 */
    failSelect: (times: number) => {
      selectFailures = times;
    },
    holdSelect: () => {
      holdSelect = true;
    },
    releaseSelect: () => {
      holdSelect = false;
      releaseSelect?.();
    },
    /** 다음 n번 저장을 네트워크 오류로 */
    failUpdate: (times: number) => {
      updateFailures = times;
    },
    /** 저장이 오류 없이 0개 행만 바꾸게 */
    updateMatchesNothing: () => {
      updateMatchesNothing = true;
    },
    holdUpdate: () => {
      holdUpdate = true;
    },
    releaseUpdate: () => {
      holdUpdate = false;
      releaseUpdate?.();
    },
  };
}

// jest.mock 팩토리에서 늦게 읽도록 바꿀 수 있는 자리를 둔다 (테스트마다 새 값으로 바꿈)
export const testAuth = { current: createFakeAuth(null) };
// 기본은 경험 수준이 있는 사용자 (로그인 후 바로 홈). S02를 시험할 때는 null로 바꾼다
export const testProfiles = { current: createFakeProfiles('experienced') };
export const testEnv = {
  current: {
    appEnv: 'local' as const,
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseAnonKey: 'sb_publishable_test',
    enableEmailLogin: true,
  },
};
