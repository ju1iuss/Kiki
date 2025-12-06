# Tasy - Instant Replace

> Create Instagram ready Stories - within seconds.

## Overview

Tasy - Instant Replace is a powerful tool that helps you create Instagram-ready Stories instantly. The platform includes a Chrome extension for adapting content from Facebook Ads Library and Pinterest, transforming them into personalized Instagram Stories within seconds.

## Features

### 🚀 Core Platform Features

- **Instant Instagram Stories**: Create Instagram-ready Stories within seconds
- **AI-Powered Content Creation**: Transform content using advanced AI models
- **Chrome Extension**: Extract and adapt content from Facebook Ads Library and Pinterest
- **Brand Customization**: Upload logos, set accent colors, and customize visuals
- **Quick Export**: Generate multiple Story variations instantly

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe (Embedded Checkout)
- **AI**: Gemini 2, nanobanana-pro
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase account and project
- Stripe account (for payments)
- API keys for Gemini and FAL (for Chrome extension)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tasy/tasy-instant-replace.git
cd tasy-instant-replace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your environment variables
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Chrome Extension Setup

See the [Chrome Extension README](./chrome-extension/README.md) for detailed setup instructions.

## Project Structure

```
tasy-instant-replace/
├── chrome-extension/      # Chrome extension for ad adaptation
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utilities and helpers
├── supabase/             # Supabase functions and migrations
└── public/               # Static assets
```

## Environment Variables

Required environment variables are documented in [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## Documentation

- [Chrome Extension Setup](./chrome-extension/README.md)
- [Stripe Integration Guide](./STRIPE_SETUP_GUIDE.md)
- [Subscription System](./SUBSCRIPTION_SYSTEM.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Contributing

This is a private project. For questions or issues, please contact the Tasy team.

## License

UNLICENSED - Proprietary software

## Links

- **Web App**: [https://app.tasy.ai](https://app.tasy.ai)
- **Main Site**: [https://tasy.ai](https://tasy.ai)
- **Support**: Contact through the app dashboard

---

Built with ❤️ by Tasy
