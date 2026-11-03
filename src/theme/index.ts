// className을 쓸 수 없는 곳(탭 바 tintColor, 아이콘 size 등)에서 쓰는 토큰 값
import generated from './tokens.generated.json';

export const tokens = generated;
export const colors = generated.colors;
export const iconSize = generated.iconSize;
// typo-* 클래스와 같은 값. className을 못 쓰는 곳(탭 바 글자 등)의 style에 그대로 넘긴다
export const typography = generated.typography;
