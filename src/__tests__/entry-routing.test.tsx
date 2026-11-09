import './__mocks__/app-mocks';

import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as SplashScreen from 'expo-splash-screen';

import {
  createFakeAuth,
  createFakeProfiles,
  fakeSession,
  testAuth,
  testProfiles,
} from './__mocks__/fake-auth';

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

  it('로그인 됨, 경험 수준 있음 → 빈 홈 S06', async () => {
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

describe('앱 실행 이동 규칙 2단계: 경험 수준 (16-architecture 4.3, 09 S02)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testAuth.current = createFakeAuth(fakeSession);
  });

  it('로그인했고 경험 수준이 없으면 S02', async () => {
    testProfiles.current = createFakeProfiles(null);
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(await screen.findByTestId('screen-S02')).toBeOnTheScreen();
    expect(screen).toHavePathname('/greeting');
    expect(screen.queryByTestId('screen-S06')).toBeNull();
  });

  it('경험 수준이 없으면 다른 경로로 들어와도 S02', async () => {
    testProfiles.current = createFakeProfiles(null);
    await renderRouter(APP_DIR, { initialUrl: '/records' });

    expect(await screen.findByTestId('screen-S02')).toBeOnTheScreen();
  });

  it('경험 수준이 있으면 S02로 들어갈 수 없다', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/greeting' });

    expect(await screen.findByTestId('screen-S06')).toBeOnTheScreen();
    expect(screen.queryByTestId('screen-S02')).toBeNull();
  });

  it('프로필을 읽는 동안 아무 화면도 그리지 않고 스플래시를 유지한다', async () => {
    const profiles = createFakeProfiles(null);
    profiles.holdSelect();
    testProfiles.current = profiles;
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(screen.queryByTestId('screen-S02')).toBeNull();
    expect(screen.queryByTestId('screen-S06')).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(async () => profiles.releaseSelect());

    expect(await screen.findByTestId('screen-S02')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  // 읽기는 실패해도 두 번 더 시도한다(1초, 2초 뒤). 그래서 이 테스트는 3초쯤 걸린다
  it('프로필을 끝내 못 읽으면 다시 시도 화면을 보여주고, 누르면 다시 읽어 이어간다', async () => {
    const profiles = createFakeProfiles(null);
    profiles.failSelect(3);
    testProfiles.current = profiles;
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(
      await screen.findByTestId('profile-load-error', {}, { timeout: 6000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('인터넷 연결을 확인하고 다시 시도해 주세요')).toBeOnTheScreen();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('profile-retry'));

    expect(await screen.findByTestId('screen-S02')).toBeOnTheScreen();
    expect(profiles.select).toHaveBeenCalledTimes(4);
  }, 10000);

  it.each([
    ['pre_adoption', 'screen-S03', '/pre-adoption'],
    ['experienced', 'screen-S04', '/register-pet'],
  ])('%s를 고르면 %s에 머무르고 홈으로 바뀌지 않는다', async (level, testId, path) => {
    testProfiles.current = createFakeProfiles(null);
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await screen.findByTestId('screen-S02');

    await fireEvent.press(screen.getByTestId(`choice-${level}`));
    expect(await screen.findByTestId(testId)).toBeOnTheScreen();

    // 저장 뒤 캐시가 바뀌어 S02가 닫히고 홈이 열려도, 지금 화면은 그대로여야 한다
    await act(async () => {});
    expect(screen.getByTestId(testId)).toBeOnTheScreen();
    expect(screen.queryByTestId('screen-S06')).toBeNull();
    expect(screen).toHavePathname(path);
  });
});
