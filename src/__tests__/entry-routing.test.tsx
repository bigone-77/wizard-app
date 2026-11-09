import './__mocks__/app-mocks';

import { act, renderRouter, screen } from 'expo-router/testing-library';
import * as SplashScreen from 'expo-splash-screen';

import { createFakeAuth, fakeSession, testAuth } from './__mocks__/fake-auth';

import { queryClient } from '@/lib/query-client';

const APP_DIR = './src/app';

describe('앱 실행 이동 규칙 1단계 (16-architecture 4.3, 15 M1 완료 기준)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('로그인 안 됨 → S01', async () => {
    testAuth.current = createFakeAuth(null);
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(await screen.findByTestId('screen-S01')).toBeOnTheScreen();
    expect(screen).toHavePathname('/login');
  });

  it('로그인 됨 → 빈 홈 S06', async () => {
    testAuth.current = createFakeAuth(fakeSession);
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(await screen.findByTestId('screen-S06')).toBeOnTheScreen();
    expect(screen.queryByTestId('screen-S01')).toBeNull();
  });

  it('껐다 켜도 로그인 유지: 저장된 세션을 읽는 동안 아무 화면도 그리지 않고 스플래시를 유지한다', async () => {
    const fake = createFakeAuth(fakeSession);
    fake.holdGetSession();
    testAuth.current = fake;
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(screen.queryByTestId('screen-S01')).toBeNull();
    expect(screen.queryByTestId('screen-S06')).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(async () => fake.releaseGetSession());

    expect(await screen.findByTestId('screen-S06')).toBeOnTheScreen();
    expect(screen.queryByTestId('screen-S01')).toBeNull();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('로그인 안 된 채 다른 경로로 들어와도 S01로 간다', async () => {
    testAuth.current = createFakeAuth(null);
    await renderRouter(APP_DIR, { initialUrl: '/records' });

    expect(await screen.findByTestId('screen-S01')).toBeOnTheScreen();
  });

  it('로그아웃되면 S01로 가고, 이전 계정의 캐시를 지운다', async () => {
    const fake = createFakeAuth(fakeSession);
    testAuth.current = fake;
    const clear = jest.spyOn(queryClient, 'clear');
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await screen.findByTestId('screen-S06');

    await act(async () => fake.emit('SIGNED_OUT', null));

    expect(await screen.findByTestId('screen-S01')).toBeOnTheScreen();
    expect(clear).toHaveBeenCalled();
  });
});
