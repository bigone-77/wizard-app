import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { authErrorMessage } from '@/features/auth/auth-errors';

const api = (code: string) => new AuthApiError('x', 400, code);

describe('로그인 실패 문구 (S01)', () => {
  it.each([
    ['invalid_credentials', '이메일 또는 비밀번호가 맞지 않아요'],
    ['user_already_exists', '이미 가입된 이메일이에요. 로그인해 주세요'],
    ['weak_password', '비밀번호는 6자 이상이어야 해요'],
    ['email_address_invalid', '이메일 형식을 확인해 주세요'],
  ])('%s', (code, message) => {
    expect(authErrorMessage(api(code))).toBe(message);
  });

  it('네트워크 오류', () => {
    expect(authErrorMessage(new AuthRetryableFetchError('Network request failed', 0))).toBe(
      '인터넷 연결을 확인하고 다시 시도해 주세요',
    );
  });

  it('처음 보는 오류는 기본 문구', () => {
    expect(authErrorMessage(api('something_new'))).toBe(
      '로그인하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
    expect(authErrorMessage(new Error('boom'))).toBe(
      '로그인하지 못했어요. 잠시 후 다시 시도해 주세요',
    );
  });
});
