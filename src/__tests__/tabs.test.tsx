import './__mocks__/app-mocks';

import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import { createFakeAuth, fakeSession, testAuth } from './__mocks__/fake-auth';

import { colors } from '@/theme';

// renderRouter는 process.cwd() 기준으로 경로를 푼다 (jest는 프로젝트 루트에서 실행)
const APP_DIR = './src/app';

// 탭 버튼의 role과 접근성 이름은 플랫폼마다 달라서(iOS는 button) tabBarButtonTestID로 찾는다
const tabButtons = () => screen.getAllByTestId(/^tab-/);

describe('하단 탭 (16-architecture 4장 화면과 경로)', () => {
  // 탭은 로그인한 뒤에만 열린다 (이동 규칙 1단계)
  beforeEach(() => {
    testAuth.current = createFakeAuth(fakeSession);
  });

  it('시작 경로 /는 S06 홈', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });

    expect(screen).toHavePathname('/');
    expect(screen.getByTestId('screen-S06')).toBeOnTheScreen();
  });

  it('탭 이름이 홈, 기록, 박사, 가이드 순서로 보인다', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });

    const labels = tabButtons().map((button) => within(button).getByText(/.+/).props.children);
    expect(labels).toEqual(['홈', '기록', '박사', '가이드']);
  });

  it('선택된 탭은 text.primary, 선택 안 된 탭은 gray.500 (icon.1은 대비가 낮아 쓰지 않음)', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });

    const labelColor = (testId: string) =>
      StyleSheet.flatten(within(screen.getByTestId(testId)).getByText(/.+/).props.style).color;
    expect(labelColor('tab-home')).toBe(colors.text.primary);
    expect(labelColor('tab-records')).toBe(colors.gray['500']);
    expect(colors.text.primary).toBe('#7008e7');
    expect(colors.gray['500']).toBe('#6a7282');
  });

  it('탭 이름은 typo-base-s-12-2 (Pretendard SemiBold 12/16)', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });

    const label = within(screen.getByTestId('tab-home')).getByText('홈');
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: -0.24,
    });
  });

  it.each([
    ['/records', 'screen-S10'],
    ['/doctor', 'screen-S08'],
    ['/guide', 'screen-S12'],
  ])('%s 경로는 %s', async (url, testId) => {
    await renderRouter(APP_DIR, { initialUrl: url });

    expect(screen).toHavePathname(url);
    expect(screen.getByTestId(testId)).toBeOnTheScreen();
  });

  it('기록 탭을 누르면 S10 기록 목록으로 이동한다', async () => {
    await renderRouter(APP_DIR, { initialUrl: '/' });

    fireEvent.press(screen.getByTestId('tab-records'));

    expect(await screen.findByTestId('screen-S10')).toBeOnTheScreen();
    expect(screen).toHavePathname('/records');
  });
});
