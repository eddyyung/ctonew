import type { SessionOptions } from 'iron-session';

export interface SessionData {
  youtubeApiKey?: string;
  isAuthenticated: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'fallback-password-for-development',
  cookieName: 'youtube-analytics-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};