import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    
    // Destroy the session by clearing the data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).youtubeApiKey = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).isAuthenticated = false;
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Session cleared successfully',
    });
  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
    return NextResponse.json({ 
      success: true,
      message: 'Session cleared successfully' 
    });

  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
