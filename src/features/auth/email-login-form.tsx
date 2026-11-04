// S01 이메일 로그인·가입 (개발 빌드 전용: EXPO_PUBLIC_ENABLE_EMAIL_LOGIN). 성공하면 이동 규칙이 홈으로 보낸다

import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { authErrorMessage } from './auth-errors';

import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';

type Mode = 'signIn' | 'signUp';

export function EmailLoginForm() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 상태(submitting)는 다음 렌더에야 바뀌어서, 빠르게 두 번 누르면 둘 다 통과한다. ref로 바로 막는다
  const inFlight = useRef(false);

  const submit = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    const credentials = { email: email.trim(), password };
    const { error: authError } =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);
    if (authError) setError(authErrorMessage(authError));
    inFlight.current = false;
    setSubmitting(false);
  };

  return (
    <View className="gap-3">
      <TextInput
        testID="email-input"
        className="h-touch rounded-8 border border-stroke-contents px-4 text-text-3 typo-base-l-16-1"
        placeholder="이메일"
        placeholderTextColor={colors.text['1']}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        testID="password-input"
        className="h-touch rounded-8 border border-stroke-contents px-4 text-text-3 typo-base-l-16-1"
        placeholder="비밀번호"
        placeholderTextColor={colors.text['1']}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
      />
      {error ? <Text className="text-danger-text typo-base-m-14-1">{error}</Text> : null}
      <Pressable
        testID="email-submit"
        className="h-touch items-center justify-center rounded-8 bg-button-primary-1 disabled:opacity-50"
        onPress={submit}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting }}
      >
        <Text className="text-text-inverse typo-base-l-16-2">
          {mode === 'signIn' ? '로그인' : '가입하기'}
        </Text>
      </Pressable>
      <Pressable
        testID="mode-toggle"
        className="h-touch items-center justify-center"
        onPress={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          setError(null);
        }}
        accessibilityRole="button"
      >
        <Text className="text-text-2 typo-base-m-14-1">
          {mode === 'signIn' ? '계정이 없으면 가입하기' : '이미 계정이 있으면 로그인'}
        </Text>
      </Pressable>
    </View>
  );
}
