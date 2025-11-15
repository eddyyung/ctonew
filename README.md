# YouTube Data Service

A server-side module for interacting with YouTube Data API v3 with built-in caching, rate limiting, and data normalization.

## Features

- **Date Range Queries**: Fetch trending videos within specific date ranges
- **Keyword Search**: Search for videos by keywords with relevance ranking
- **Title Obfuscation**: Configurable title masking (low/medium/high levels)
- **LRU Caching**: In-memory caching to reduce API hits with configurable TTL
- **Rate Limiting**: Request throttling and quota management
- **Heat Score**: Computed metric for bubble sizing based on views and likes
- **Error Handling**: Actionable error messages for quota and network failures

## Installation
# YouTube Hot Content Analytics

A modern web application for analyzing and visualizing trending YouTube content with real-time data insights.

## Project Overview

This full-stack application provides analytics and visualization tools for YouTube hot content, built with a modern tech stack using Next.js 14, TypeScript, Tailwind CSS, and various data visualization and form handling libraries.

## 🔐 Authentication System

This application implements a secure API key authentication system for YouTube Data API access:

- **Secure Session Management**: Uses `iron-session` with encrypted, HttpOnly cookies
- **API Key Validation**: Real-time validation against YouTube Data API v3
- **No Database Storage**: API keys are stored only in secure sessions
- **Comprehensive Error Handling**: User-friendly error messages and validation
- **Security First**: No API key exposure in client responses or server logs

### Getting Started with Authentication

1. **Get Your API Key**: 
   - Visit [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials (API Key)

2. **Environment Setup**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your SESSION_PASSWORD
   ```

3. **Start the Application**:
   ```bash
   npm run dev
   ```

4. **Authenticate**: Visit `http://localhost:3000` and enter your API key

For detailed authentication documentation, see [docs/API_KEY_AUTHENTICATION.md](./docs/API_KEY_AUTHENTICATION.md).

## Tech Stack

### Frontend & Framework

- **Next.js 14** - React framework with App Router for server-side rendering and static generation
- **TypeScript** - Type-safe JavaScript for better development experience
- **React 19** - Latest React with concurrent features

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **tailwind-merge** - Merge Tailwind CSS classes without conflicts
- **class-variance-authority** - CSS-in-JS variant pattern library

### Data & API

- **Axios** - Promise-based HTTP client for API calls
- **Recharts** - Composable React components for data visualization

### Forms & Validation

- **react-hook-form** - Performant form management library
- **Zod** - TypeScript-first schema validation library

### Utilities

- **date-fns** - Modern date utility library
- **clsx** - Utility for constructing className strings

### Development Tools

- **TypeScript** - Static type checking
- **ESLint** - Code quality and style enforcement
- **Prettier** - Code formatter
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

## Project Structure

```
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout wrapper
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── public/                # Static assets
├── .env.example           # Environment variables template
├── .prettierrc             # Prettier configuration
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd project
```

2. Install dependencies:

```bash
npm install
```

## Configuration

```typescript
import { YouTubeDataService } from './services/youtube';

const service = new YouTubeDataService({
  apiKey: 'YOUR_YOUTUBE_API_KEY',
  cacheOptions: {
    max: 100, // Maximum cache entries
    ttl: 900000, // Cache TTL in milliseconds (15 minutes)
  },
  rateLimitOptions: {
    maxConcurrent: 5, // Max concurrent requests
    quotaLimit: 10000, // Daily quota limit
  },
});
```

## Usage

### Fetch Videos in Date Range

```typescript
const videos = await service.fetchVideosInDateRange({
  publishedAfter: '2024-01-01T00:00:00Z',
  publishedBefore: '2024-01-31T23:59:59Z',
  maxResults: 50,
  obfuscationLevel: 'medium',
});

console.log(videos);
// [
//   {
//     videoId: 'abc123',
//     url: 'https://www.youtube.com/watch?v=abc123',
//     title: 'Amazing Tutorial Video',
//     obfuscatedTitle: '[*] [***] [***]',
//     publishedAt: '2024-01-15T12:00:00Z',
//     viewCount: 1000000,
//     likeCount: 50000,
//     heatScore: 5.234
//   },
//   ...
// ]
```

### Keyword Search

```typescript
const results = await service.searchVideosByKeyword({
  query: 'javascript tutorial',
  maxResults: 10,
  obfuscationLevel: 'low',
});

console.log(results);
// Returns top 10 matching videos with metadata
```

### Cache Management

```typescript
// Get cache statistics
const stats = service.getCacheStats();
console.log(stats); // { size: 10, max: 100 }

// Clear cache
service.clearCache();
```

### Quota Monitoring

```typescript
const quota = service.getQuotaUsage();
console.log(quota);
// {
//   used: 500,
//   limit: 10000,
//   resetTime: '2024-12-01T00:00:00.000Z'
// }
```

## Response DTO

All service methods return normalized `VideoDTO` objects:

```typescript
interface VideoDTO {
  videoId: string; // YouTube video ID
  url: string; // Full YouTube URL
  title: string; // Original title
  obfuscatedTitle: string; // Masked title
  publishedAt: string; // ISO 8601 timestamp
  viewCount: number; // Total views
  likeCount: number; // Total likes
  heatScore: number; // Computed metric for visualization
}
```

## Heat Score Calculation

The heat score is computed using:

- 70% weight on normalized view count (log scale)
- 30% weight on normalized like count (log scale)

This provides a balanced metric for bubble sizing in visualizations.

## Error Handling

The service throws actionable errors for common scenarios:

```typescript
try {
  const videos = await service.fetchVideosInDateRange(options);
} catch (error) {
  if (error.message.includes('quota exceeded')) {
    // Handle quota limit
    console.error('API quota exceeded:', error.message);
  } else if (error.message.includes('Network failure')) {
    // Handle network issues
    console.error('Network error:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error.message);
  }
}
```

## Caching Behavior

- Requests with identical parameters within the TTL window return cached results
- Cache keys are generated from method and parameters
- Cache hits are logged to console for verification
- Cache automatically evicts least recently used entries when full

## Development

```bash
# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration values as needed.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Available Scripts

- **`npm run dev`** - Start the development server with hot reload
- **`npm run build`** - Build the application for production
- **`npm start`** - Start the production server
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run format`** - Format code with Prettier
- **`npm run format:check`** - Check if code is formatted correctly

## Code Quality

### Linting

The project uses ESLint with Next.js and TypeScript configurations. Linting is enforced through pre-commit hooks.

```bash
npm run lint
```

### Formatting

Code formatting is handled by Prettier. Format all files:

```bash
npm run format
```

Check if files are formatted:

```bash
npm run format:check
```

### Pre-commit Hooks

Husky is configured to run linting on staged files before commits. This ensures code quality is maintained across the repository.

## Environment Variables

The project supports environment variables for configuration. See `.env.example` for available variables.

### Key Variables

- **`NEXT_PUBLIC_API_BASE_URL`** - Base URL for API requests (exposed to browser)

Variables prefixed with `NEXT_PUBLIC_` are available in the browser. Other variables are server-side only.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ ESLint and Prettier for code quality
- ✅ Husky pre-commit hooks
- ✅ Form validation with react-hook-form and Zod
- ✅ Data visualization ready with Recharts
- ✅ API integration with Axios
- ✅ Date utilities with date-fns

## Development Guidelines

### Absolute Imports

The project uses absolute imports with the `@/` alias. Import from the project root:

```typescript
import { MyComponent } from '@/components/MyComponent';
import { helper } from '@/lib/helpers';
```

### Component Structure

Components should be placed in the `app/` directory and follow the Next.js App Router conventions.

### Styling

Use Tailwind CSS utility classes for styling. Avoid writing custom CSS when possible.

```tsx
<div className="flex items-center justify-center min-h-screen bg-blue-50 dark:bg-gray-900">
  {/* content */}
</div>
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

### Dependencies Issues

If you encounter issues with dependencies, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Failures

Ensure all TypeScript types are correct and ESLint passes:

```bash
npm run lint
npm run build
```

## Contributing

When contributing to this project:

1. Create a feature branch from `main`
2. Ensure code passes linting: `npm run lint`
3. Format code: `npm run format`
4. Create a pull request with a clear description

## License

[Add your license information here]

## Support

For issues or questions, please create an issue in the repository.
