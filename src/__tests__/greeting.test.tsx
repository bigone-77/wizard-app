import './__mocks__/app-mocks';

import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import {
  createFakeAuth,
  createFakeProfiles,
  fakeSession,
  testAuth,
  testProfiles,
} from './__mocks__/fake-auth';

const APP_DIR = './src/app';
const SAVE_FAILED = '저장하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요';

const openGreeting = async () => {
  await renderRouter(APP_DIR, { initialUrl: '/' });
  await screen.findByTestId('screen-S02');
};

describe('S02 박사 인사 (09, 05 ①)', () => {
  let profiles: ReturnType<typeof createFakeProfiles>;

  beforeEach(() => {
    testAuth.current = createFakeAuth(fakeSession);
    profiles = createFakeProfiles(null);
    testProfiles.current = profiles;
  });

  it('박사 문구와 선택지 3개가 05 ① 순서대로 보인다', async () => {
    await openGreeting();

    expect(screen.getByText('도마뱀 박사')).toBeOnTheScreen();
    expect(
      screen.getByText('반가워! 나는 너랑 도마뱀을 도와줄 박사야.\n혹시 지금 어떤 상황이야?'),
    ).toBeOnTheScreen();
    const labels = screen
      .getAllByTestId(/^choice-/)
      .map((choice) => choice.props.accessibilityLabel);
    expect(labels).toEqual(['아직 데려오기 전이야', '막 데려왔어, 처음 키워봐', '키워본 적 있어']);
  });

  it.each([
    ['pre_adoption', 'screen-S03', '/pre-adoption'],
    ['beginner', 'screen-S04', '/register-pet'],
    ['experienced', 'screen-S04', '/register-pet'],
  ])('%s를 고르면 그 값으로 저장하고 %s로 간다', async (level, testId, path) => {
    await openGreeting();
    await fireEvent.press(screen.getByTestId(`choice-${level}`));

    expect(await screen.findByTestId(testId)).toBeOnTheScreen();
    expect(screen).toHavePathname(path);
    expect(profiles.row.experience_level).toBe(level);
  });

  it('저장할 때 경험 수준만 보낸다 (user_id 등 소유자 값은 보내지 않음, CLAUDE.md 규칙 6)', async () => {
    await openGreeting();
    await fireEvent.press(screen.getByTestId('choice-experienced'));
    await screen.findByTestId('screen-S04');

    expect(profiles.update).toHaveBeenCalledTimes(1);
    expect(profiles.update).toHaveBeenCalledWith({ experience_level: 'experienced' });
  });

  // 저장은 실패해도 두 번 더 시도한다(1초, 2초 뒤). 그래서 실패 테스트는 3초쯤 걸린다
  it('저장에 끝내 실패하면 안내하고 S02에 남는다. 다시 누르면 저장된다', async () => {
    profiles.failUpdate(3);
    await openGreeting();
    await fireEvent.press(screen.getByTestId('choice-beginner'));

    expect(await screen.findByText(SAVE_FAILED, {}, { timeout: 6000 })).toBeOnTheScreen();
    expect(screen.getByTestId('screen-S02')).toBeOnTheScreen();
    expect(profiles.update).toHaveBeenCalledTimes(3);

    await fireEvent.press(screen.getByTestId('choice-beginner'));

    expect(await screen.findByTestId('screen-S04')).toBeOnTheScreen();
    expect(profiles.row.experience_level).toBe('beginner');
  }, 10000);

  it('오류 없이 0개 행만 바뀌어도 실패로 보고 S02에 남는다', async () => {
    profiles.updateMatchesNothing();
    await openGreeting();
    await fireEvent.press(screen.getByTestId('choice-experienced'));

    expect(await screen.findByText(SAVE_FAILED, {}, { timeout: 6000 })).toBeOnTheScreen();
    expect(screen.getByTestId('screen-S02')).toBeOnTheScreen();
    expect(screen.queryByTestId('screen-S04')).toBeNull();
  }, 10000);

  it('빠르게 두 번 눌러도 한 번만 저장한다', async () => {
    profiles.holdUpdate();
    await openGreeting();
    await fireEvent.press(screen.getByTestId('choice-experienced'));
    await fireEvent.press(screen.getByTestId('choice-pre_adoption'));

    await act(async () => profiles.releaseUpdate());

    expect(await screen.findByTestId('screen-S04')).toBeOnTheScreen();
    expect(profiles.update).toHaveBeenCalledTimes(1);
  });
});
