import { fireEvent, renderRouter, screen, within } from 'expo-router/testing-library';

// renderRouter는 process.cwd() 기준으로 경로를 푼다 (jest는 프로젝트 루트에서 실행)
const APP_DIR = './src/app';

// 탭 버튼의 role과 접근성 이름은 플랫폼마다 달라서(iOS는 button) tabBarButtonTestID로 찾는다
const tabButtons = () => screen.getAllByTestId(/^tab-/);

describe('하단 탭 (16-architecture 4장 화면과 경로)', () => {
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
