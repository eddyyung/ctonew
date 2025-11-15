# API Key Authentication Implementation

This document describes the API key authentication system implemented for the YouTube Analytics application.

## Overview

The system allows users to submit a YouTube Data API key, validate it, and manage it securely for subsequent requests. The implementation uses encrypted, HttpOnly cookies with `iron-session` to keep the API key per-session without persisting it in the database.

## Architecture

### Backend Components

#### 1. Session Management (`lib/session.ts`)

- Uses `iron-session` for secure session storage
- Encrypted, HttpOnly cookies for security
- Session data includes `youtubeApiKey` and `isAuthenticated` flags
- Environment-based security configuration

#### 2. YouTube API Validation (`lib/youtube.ts`)

- Validates API keys against YouTube Data API v3
- Uses `youtube.channels.list` endpoint with YouTube's official channel
- Comprehensive error handling for different API error scenarios
- Safeguards against API key exposure in logs

#### 3. API Routes

##### `/api/auth/verify-key` (POST)

- Accepts API key for validation
- Validates against YouTube API
- Stores valid keys in encrypted session
- Returns descriptive error messages for invalid keys

##### `/api/auth/session` (GET)

- Checks current authentication state
- Returns whether user has a valid API key stored
- Does not expose the actual API key

##### `/api/auth/logout` (POST)

- Clears the stored API key from session
- Logs out the user effectively

#### 4. Server-side Helpers (`lib/session-server.ts`)

- `getSession()` - Retrieves current session
- `getYouTubeApiKey()` - Gets stored API key for server-side use
- `isAuthenticated()` - Checks authentication status

#### 5. Authentication Middleware (`lib/auth.ts`)

- `withAuth()` - Higher-order function for protecting API routes
- Ensures API key exists before processing requests
- Provides the API key to protected route handlers

### Frontend Components

#### 1. API Key Form (`components/ApiKeyForm.tsx`)

- Uses `react-hook-form` with `zod` validation
- Client-side validation before server submission
- Loading states and error handling
- Password input field for security

#### 2. Authentication Status (`components/AuthStatus.tsx`)

- Displays current authentication state
- Shows success message when authenticated
- Provides logout functionality
- Real-time status checking

#### 3. Toast Notifications (`components/Toast.tsx`)

- Success and error message display
- Auto-dismiss after 5 seconds
- Manual close option
- Consistent styling for both message types

#### 4. Main Page (`app/page.tsx`)

- Orchestrates all authentication components
- State management for authentication flow
- Responsive design with Tailwind CSS
- Conditional rendering based on auth status

## Security Features

### 1. Session Security

- **Encrypted Storage**: API keys stored in encrypted cookies
- **HttpOnly Cookies**: Prevents client-side JavaScript access
- **Secure Flag**: Enabled in production environments
- **SameSite Protection**: Prevents CSRF attacks

### 2. API Key Protection

- **No Database Storage**: Keys only exist in memory (session)
- **No Client Exposure**: API keys never returned to frontend
- **Log Redaction**: Keys are never logged in server logs
- **Server-side Only**: All API calls use server-stored keys

### 3. Input Validation

- **Client-side**: Real-time validation with `zod` schemas
- **Server-side**: Comprehensive validation before storage
- **API Validation**: Verification against YouTube's API
- **Error Sanitization**: User-friendly error messages

## Environment Configuration

### Required Environment Variables

```bash
# Session encryption password (generate with: openssl rand -base64 32)
SESSION_PASSWORD=your-secure-session-password-here
```

### Development Setup

1. Copy `.env.local.example` to `.env.local`
2. Set a secure `SESSION_PASSWORD`
3. Start development server: `npm run dev`

## API Usage Examples

### Validating an API Key

```bash
curl -X POST http://localhost:3000/api/auth/verify-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"your-youtube-api-key"}'
```

### Checking Authentication Status

```bash
curl -X GET http://localhost:3000/api/auth/session
```

### Logging Out

```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## Error Handling

### Validation Errors

- **Invalid Format**: API key doesn't match expected pattern
- **Invalid Key**: Key fails YouTube API validation
- **Insufficient Permissions**: Key lacks required scopes
- **Network Issues**: Timeout or connectivity problems

### Session Errors

- **Unauthorized**: No valid API key in session
- **Session Expired**: Session data corrupted or expired
- **Server Error**: Internal server issues

## Acceptance Criteria Met

✅ **API Key Submission**: Users can submit YouTube Data API keys through a secure form
✅ **Validation**: Keys are validated against YouTube API before storage
✅ **Secure Storage**: Valid keys are stored in encrypted, HttpOnly sessions
✅ **Error Handling**: User-friendly error messages for invalid keys
✅ **Session Management**: Check authentication state and logout functionality
✅ **Security**: No API key exposure in client responses or logs
✅ **Server-side Access**: Subsequent API calls can access stored keys securely

## Future Enhancements

1. **Rate Limiting**: Implement API rate limiting per session
2. **Key Scopes**: Validate specific API key permissions
3. **Multiple Providers**: Support for other video platform APIs
4. **Key Rotation**: Support for API key rotation without logout
5. **Analytics**: Track API usage patterns per session

## Dependencies

- `iron-session`: Secure session management
- `react-hook-form`: Form handling and validation
- `zod`: Schema validation
- `@hookform/resolvers`: Form validation integration
- `axios`: HTTP client for API requests

## Testing

The implementation includes comprehensive error handling and validation. Test with:

- Valid YouTube Data API v3 keys
- Invalid or expired keys
- Malformed input
- Network failures
- Session expiration scenarios
- Session expiration scenarios
