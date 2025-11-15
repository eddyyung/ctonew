import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from './session';

export async function withAuth(handler: (req: NextRequest, apiKey: string) => Promise<Response>) {
  return async function (req: NextRequest) {
    try {
      const cookieStore = await cookies();
      const session = await getIronSession(cookieStore, sessionOptions);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(session as any).isAuthenticated || !(session as any).youtubeApiKey) {
        return new Response(JSON.stringify({ error: 'Unauthorized - API key required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
  return async function(req: NextRequest) {
    try {
      const cookieStore = await cookies();
      const session = await getIronSession(cookieStore, sessionOptions);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(session as any).isAuthenticated || !(session as any).youtubeApiKey) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - API key required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return handler(req, (session as any).youtubeApiKey);
    } catch {
      return new Response(JSON.stringify({ error: 'Session error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
      return new Response(
        JSON.stringify({ error: 'Session error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
