import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './session';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getYouTubeApiKey(): Promise<string | null> {
  const session = await getSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session as any)?.youtubeApiKey || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session as any)?.isAuthenticated || false;
}
}
