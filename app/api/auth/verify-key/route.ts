import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { validateYouTubeApiKey } from '@/lib/youtube';
import { z } from 'zod';

const verifyKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey } = verifyKeySchema.parse(body);

    // Validate the API key with YouTube
    const validation = await validateYouTubeApiKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid API key' }, { status: 400 });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 400 }
      );
    }

    // Store the API key in the session
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).youtubeApiKey = apiKey;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (session as any).isAuthenticated = true;
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'API key validated and stored successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error('Error in verify-key route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
    return NextResponse.json({ 
      success: true, 
      message: 'API key validated and stored successfully' 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error in verify-key route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
