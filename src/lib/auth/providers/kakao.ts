/**
 * Kakao OAuth — v0.1.0 NotImplemented stub.
 * v0.2.0: @react-native-seoul/kakao-login 또는 expo-auth-session(Kakao REST API).
 */
export type KakaoSignInResult = {
  accessToken: string;
  idToken?: string;
  email: string | null;
};

export async function signInWithKakao(): Promise<KakaoSignInResult> {
  throw new Error('NotImplemented: Kakao OAuth는 v0.2.0에서 활성됩니다');
}
