/**
 * Apple Sign-In — v0.1.0 NotImplemented stub.
 * v0.2.0: expo-apple-authentication (iOS 13+). Android는 별도 OAuth 흐름.
 */
export type AppleSignInResult = {
  idToken: string;
  email: string | null;
  fullName: string | null;
};

export async function signInWithApple(): Promise<AppleSignInResult> {
  throw new Error('NotImplemented: Apple Sign-In은 v0.2.0에서 활성됩니다');
}
