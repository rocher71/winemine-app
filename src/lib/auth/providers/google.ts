/**
 * Google OAuth — v0.1.0 NotImplemented stub.
 * v0.2.0: expo-auth-session + Google iOS/Android client IDs.
 */
export type GoogleSignInResult = {
  idToken: string;
  accessToken: string;
  email: string | null;
};

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  throw new Error('NotImplemented: Google OAuth는 v0.2.0에서 활성됩니다');
}
