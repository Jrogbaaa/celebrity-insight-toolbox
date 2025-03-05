
# Look After You - Social Media Analytics & Content Hub

## Project Overview

Look After You is a comprehensive social media management platform that helps content creators and social media managers analyze their performance across platforms, generate content, and get AI-powered recommendations for growth.

## Key Features

### Analytics Hub
- Import and view social media analytics reports
- Cross-platform analytics from Instagram, TikTok, and other platforms
- Demographics breakdown of your audience
- Posting insights and optimal timing recommendations
- Sponsorship opportunity analysis
- Instagram profile scraping tool

### Creative Studio
- AI-powered content generation using:
  - Text generation via DeepSeek/Gemini models
  - Image generation via Gemini API (standard and creative modes)
- Content analysis for optimal engagement
- Post recommendations based on analysis
- Hashtag and caption suggestions

### AI Social Expert
- Chat with an AI assistant that understands your social media data
- Get personalized recommendations based on your analytics
- Ask questions about your audience, content performance, and growth strategies

## Technical Architecture

This project is built with:

- Vite & React for the frontend
- TypeScript for type safety
- Tailwind CSS & shadcn-ui for UI components
- Supabase for backend services:
  - Edge functions for API integrations
  - Database for storing reports and user data
- Tanstack React Query for data fetching

## Feature Dependencies

- **Image Generation**: Requires Gemini API key properly configured in Supabase
- **Content Analysis**: Uses analyze-content edge function
- **Instagram Scraping**: Uses instagram-scrape edge function
- **Chat Functionality**: Uses deepseek-chat edge function

## Development

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Troubleshooting

If you encounter issues after adding new features:

1. Check that all required Supabase edge functions are properly configured
2. Verify API keys are correctly set in Supabase secrets
3. Look for console errors that might indicate specific component failures
4. Ensure imports and dependencies are properly updated when modifying components

## Changelog

### v1.0.0 (August 2023)
- Initial release with basic analytics dashboard
- User authentication system
- Report upload functionality

### v1.1.0 (October 2023)
- Added demographics display
- Improved report analysis
- Added AI action items

### v1.2.0 (December 2023)
- Added creative content studio
- AI chat assistant integration
- Multi-platform support

### v2.0.0 (March 2024)
- Complete UI redesign
- Added Instagram API integration
- Improved content analysis features
- Enhanced AI recommendations

### v2.1.0 (May 2024)
- Added Instagram profile scraping tool
- API tools section in Analytics Hub
- Enhanced user interface
- Improved mobile responsiveness

### v2.2.0 (July 2024)
- Integrated Gemini API for image generation
- Added standard and creative image generation modes
- Improved Creative Studio UI and workflow
- Enhanced error handling in AI features

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

