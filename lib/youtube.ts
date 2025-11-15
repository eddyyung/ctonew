import axios from 'axios';

export async function validateYouTubeApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Use a lightweight endpoint to validate the API key
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet',
        id: 'UCBR8-60-B28hp2BmDPdntcQ', // YouTube's official channel ID
        key: apiKey,
      },
      timeout: 10000, // 10 second timeout
    });

    // If we get a successful response, the API key is valid
    if (response.status === 200 && response.data.items && response.data.items.length > 0) {
      return { valid: true };
    }

    return { valid: false, error: 'Invalid API key: Unable to fetch channel data' };
  } catch (err: unknown) {
    // Log error without exposing the API key
    const error = err as {
      response?: { status?: number; data?: { error?: { message?: string } } };
      code?: string;
      message?: string;
    };
    console.error(
      'YouTube API validation error:',
      error.response?.data?.error?.message || error.message
    );

    if (error.response?.status === 400) {
      return { valid: false, error: 'Invalid API key format' };
    } else if (error.response?.status === 403) {
      return { valid: false, error: 'API key is invalid or has insufficient permissions' };
    } else if (error.code === 'ECONNABORTED') {
      return { valid: false, error: 'Request timeout. Please try again.' };
    } else {
      return { valid: false, error: 'Failed to validate API key. Please try again.' };
    }
  }
}
