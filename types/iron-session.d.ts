import 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    youtubeApiKey?: string;
    isAuthenticated: boolean;
  }
}