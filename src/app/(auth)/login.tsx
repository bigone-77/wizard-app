import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { EmailLoginForm } from '@/features/auth/email-login-form';
import { getEnv } from '@/lib/env';

// S01 로그인 / 회원가입 (09-screen-list). 소셜 로그인(애플·구글)은 T025에서 더한다
export default function LoginScreen() {
  const { enableEmailLogin } = getEnv();

  return (
    <KeyboardAvoidingView
      testID="screen-S01"
      className="flex-1 bg-bg-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 justify-center gap-8 px-6">
        <Text className="text-text-3 typo-title-s-22-2">로그인</Text>
        {enableEmailLogin ? <EmailLoginForm /> : null}
      </View>
    </KeyboardAvoidingView>
  );
}
