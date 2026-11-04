import './__mocks__/app-mocks';

import { AuthApiError } from '@supabase/supabase-js';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { createFakeAuth, fakeSession, testAuth, testEnv } from './__mocks__/fake-auth';

const APP_DIR = './src/app';
const base = { ...testEnv.current };

const openLogin = async () => {
  await renderRouter(APP_DIR, { initialUrl: '/login' });
  await screen.findByTestId('screen-S01');
};

// RNTL 14의 fireEvent는 비동기라 await해야 상태가 반영된다
const fill = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByTestId('email-input'), email);
  await fireEvent.changeText(screen.getByTestId('password-input'), password);
};

describe('S01 이메일 로그인 (개발 빌드 전용)', () => {
  beforeEach(() => {
    testAuth.current = createFakeAuth(null);
    testEnv.current = { ...base, enableEmailLogin: true };
  });

  it('로그인하면 빈 홈 S06으로 간다. 이메일 앞뒤 공백은 지운다', async () => {
    await openLogin();
    await fill('  gecko@test.dev ', 'secret123');
    await fireEvent.press(screen.getByTestId('email-submit'));

    expect(await screen.findByTestId('screen-S06')).toBeOnTheScreen();
    expect(testAuth.current.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'gecko@test.dev',
      password: 'secret123',
    });
  });

  it('가입 모드로 바꾸면 signUp을 부른다 (로컬은 확인 메일 없이 바로 로그인)', async () => {
    await openLogin();
    await fireEvent.press(screen.getByTestId('mode-toggle'));
    await fill('new@test.dev', 'secret123');
    await fireEvent.press(screen.getByTestId('email-submit'));

    expect(await screen.findByTestId('screen-S06')).toBeOnTheScreen();
    expect(testAuth.current.auth.signUp).toHaveBeenCalledWith({
      email: 'new@test.dev',
      password: 'secret123',
    });
  });

  it('비밀번호가 틀리면 안내 문구를 보이고 S01에 남는다', async () => {
    testAuth.current.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    } as never);
    await openLogin();
    await fill('gecko@test.dev', 'wrong');
    await fireEvent.press(screen.getByTestId('email-submit'));

    expect(await screen.findByText('이메일 또는 비밀번호가 맞지 않아요')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-S01')).toBeOnTheScreen();
  });

  it('빠르게 두 번 눌러도 한 번만 보낸다', async () => {
    await openLogin();
    await fill('gecko@test.dev', 'secret123');
    const button = screen.getByTestId('email-submit');
    // 바깥 act 하나 안에서 두 번 눌러 그 사이에 다시 그리지 않게 한다 (빠른 두 번 탭)
    // 한 act 안에서 누름 처리기를 두 번 바로 불러, 그 사이에 다시 그리지 않게 한다 (빠른 두 번 탭)
    const press = () => button.props.onClick({ nativeEvent: {} });
    await act(async () => {
      press();
      press();
    });

    expect(testAuth.current.auth.signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it('스위치(EXPO_PUBLIC_ENABLE_EMAIL_LOGIN)가 꺼지면 이메일 입력이 없다', async () => {
    testEnv.current = { ...base, enableEmailLogin: false };
    await openLogin();

    expect(screen.queryByTestId('email-input')).toBeNull();
    expect(screen.queryByTestId('email-submit')).toBeNull();
  });
});

describe('개발용 로그아웃 (홈 S06, 같은 스위치)', () => {
  beforeEach(() => {
    testAuth.current = createFakeAuth(fakeSession);
  });

  it('스위치가 켜져 있으면 버튼이 있고, 누르면 S01로 간다', async () => {
    testEnv.current = { ...base, enableEmailLogin: true };
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await fireEvent.press(await screen.findByTestId('dev-sign-out'));

    expect(await screen.findByTestId('screen-S01')).toBeOnTheScreen();
    expect(testAuth.current.auth.signOut).toHaveBeenCalled();
  });

  it('스위치가 꺼지면(alpha) 버튼이 없다', async () => {
    testEnv.current = { ...base, enableEmailLogin: false };
    await renderRouter(APP_DIR, { initialUrl: '/' });
    await screen.findByTestId('screen-S06');

    expect(screen.queryByTestId('dev-sign-out')).toBeNull();
  });
});
