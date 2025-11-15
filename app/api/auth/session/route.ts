import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any).isAuthenticated) {
      return NextResponse.json({ 
        isAuthenticated: false,
        message: 'No active session found' 
      });
    }

    // Return session info without exposing the API key
    return NextResponse.json({
      isAuthenticated: true,
      message: 'Active session found'
    });

  } catch (error) {
    console.error('Error in session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}