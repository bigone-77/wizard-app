import { Text, View } from 'react-native';
import { render, screen } from 'nativewind/test';

// tailwind.config.js에서 content만 빼고 넘긴다 (테스트 도구가 렌더한 className을 직접 모음)
const { content: _content, ...config } = require('../../tailwind.config.js');

const styleOf = (testID: string) => screen.getByTestId(testID).props.style;

describe('디자인 토큰 테마 (tailwind.config.js)', () => {
  it('시맨틱 색, 간격, 모서리 토큰이 RN 스타일이 된다', async () => {
    await render(<View testID="box" className="bg-bg-2 p-4 rounded-12 border-stroke-contents" />, {
      config,
    });

    expect(styleOf('box')).toEqual({
      backgroundColor: '#f9fafb',
      padding: 16,
      borderRadius: 12,
      borderColor: '#e5e7eb',
    });
  });

  it('간격 이름은 Tailwind 숫자와 같다 (p-0.5 = 2px, p-30 = 120px)', async () => {
    await render(<View testID="box" className="pt-0.5 pb-30" />, { config });

    expect(styleOf('box')).toEqual({ paddingTop: 2, paddingBottom: 120 });
  });

  it('그림자 토큰은 RN 그림자 속성이 된다', async () => {
    await render(<View testID="box" className="shadow-level-1" />, { config });

    expect(styleOf('box')).toEqual({
      shadowColor: '#00000033',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      shadowOpacity: 1,
    });
  });

  it('typo-* 하나로 폰트, 크기, 줄 높이, 자간이 함께 들어간다', async () => {
    await render(
      <Text testID="text" className="typo-base-m-14-2 text-text-3">
        박사
      </Text>,
      { config },
    );

    const style = styleOf('text');
    expect(style).toMatchObject({
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 14,
      lineHeight: 18,
      color: '#1e2939',
    });
    // CSS 변환기가 float32로 계산해서 -0.2800000011920929처럼 나온다
    expect(style.letterSpacing).toBeCloseTo(-0.28, 5);
  });

  it('토큰에 없는 값은 스타일이 생기지 않는다 (색·간격 하드코딩 방지)', async () => {
    await render(<View testID="box" className="bg-sky-500 p-7 text-sm" />, { config });

    expect(styleOf('box')).toBeUndefined();
  });
});
