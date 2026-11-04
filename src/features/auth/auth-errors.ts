// S01 로그인 실패 문구. 16-architecture 11장에 로그인 항목이 없어서 src/lib/errors.ts가 아니라 여기 둔다
// 틀린 비밀번호와 가입 안 된 이메일은 같은 문구 (가입 여부를 알려주지 않음, Supabase도 같은 코드)

import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

const BY_CODE: Record<string, string> = {
  invalid_credentials: '이메일 또는 비밀번호가 맞지 않아요',
  user_already_exists: '이미 가입된 이메일이에요. 로그인해 주세요',
  weak_password: '비밀번호는 6자 이상이어야 해요',
  email_address_invalid: '이메일 형식을 확인해 주세요',
};

const NETWORK = '인터넷 연결을 확인하고 다시 시도해 주세요';
const FALLBACK = '로그인하지 못했어요. 잠시 후 다시 시도해 주세요';

export function authErrorMessage(error: unknown): string {
  if (isAuthRetryableFetchError(error)) return NETWORK;
  if (isAuthApiError(error) && error.code && BY_CODE[error.code]) return BY_CODE[error.code];
  return FALLBACK;
}
