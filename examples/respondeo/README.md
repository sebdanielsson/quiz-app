# Respondeo Example Template

This is the example template used by `create-respondeo-app` to bootstrap new Respondeo quiz applications.

## What's Included

This template includes:

- Complete Next.js 16 application with App Router
- PostgreSQL database with Drizzle ORM
- BetterAuth authentication with OIDC support
- RBAC (Role-Based Access Control) system
- Optional Redis/Valkey caching layer
- AI quiz generation (OpenAI, Anthropic, Google)
- Unsplash image search integration
- shadcn/ui components with Tailwind CSS 4
- Full TypeScript support
- Pre-configured development tools (ESLint, Oxfmt, Stylelint)

## Quick Start

### Using create-respondeo-app (Recommended)

```bash
bun create respondeo-app my-quiz-app
cd my-quiz-app
```

### Manual Setup

If you prefer to set up manually:

1. **Copy this template**

   ```bash
   cp -r examples/respondeo my-quiz-app
   cd my-quiz-app
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

4. **Run database migrations**

   ```bash
   bun run db:migrate
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

## Environment Configuration

### Required Variables

Configure these in `.env.local`:

- `DATABASE_URL` - PostgreSQL connection string
- `OIDC_PROVIDER_ID` - Authentication provider ID
- `NEXT_PUBLIC_OIDC_PROVIDER_ID` - Must match OIDC_PROVIDER_ID
- `OIDC_ISSUER` - OIDC provider URL
- `OIDC_CLIENT_ID` - OAuth client ID
- `OIDC_CLIENT_SECRET` - OAuth client secret

### Optional Variables

- `REDIS_URL` / `VALKEY_URL` - Cache layer for improved performance
- `UNSPLASH_ACCESS_KEY` - Image search functionality
- `AI_PROVIDER` - AI provider (openai/anthropic/google)
- `AI_MODEL` - Specific model selection
- `RBAC_PUBLIC_*` - Public access settings

See `.env.example` for the complete list with descriptions.

## Available Scripts

```bash
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run tsc          # TypeScript type checking
bun run format       # Format code with oxfmt
bun run stylelint    # Lint CSS files
bun test             # Run tests
bun run db:migrate   # Run database migrations
bun run db:push      # Push schema changes (dev only)
bun run db:generate  # Generate migration files
bun run db:studio    # Open Drizzle Studio
```

## Architecture

### Tech Stack

- **Runtime**: Bun >= 1.3.8
- **Framework**: Next.js 16 with App Router and Turbopack
- **Database**: PostgreSQL via Bun's native SQL driver
- **ORM**: Drizzle ORM
- **Auth**: BetterAuth with OIDC + API Key plugins
- **Cache**: Redis/Valkey (optional)
- **AI**: AI SDK (OpenAI, Anthropic, Google)
- **UI**: shadcn/ui (Base UI - Nova) + Tailwind CSS 4

### Key Features

- **RBAC System**: Role-based permissions with stateless design
- **Quiz Management**: Create, edit, delete quizzes with questions
- **Attempts & Scoring**: Track user attempts and display leaderboards
- **AI Generation**: Generate quizzes from topics using AI
- **API**: RESTful API with OpenAPI 3.1 documentation
- **Rate Limiting**: Per-user and global limits for AI features

## Documentation

Detailed documentation is available in the `/docs` folder:

- `authentication.md` - Authentication setup and configuration
- `rbac.md` - Role-based access control system
- `database.md` - Database schema and migrations
- `caching.md` - Redis/Valkey caching layer
- `ai-generation.md` - AI quiz generation setup
- `image-search.md` - Unsplash integration
- `deployment.md` - Production deployment guide

## Project Structure

```
├── app/                    # Next.js app routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
│   ├── quiz/             # Quiz-related components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── auth/             # BetterAuth setup
│   ├── db/               # Database and schema
│   ├── rbac/             # Permission system
│   ├── ai/               # AI provider setup
│   ├── cache/            # Redis/Valkey client
│   └── validations/      # Zod schemas
├── docs/                  # Documentation
└── public/               # Static assets
```

## Database Schema

Main tables:

- `user` - User accounts
- `quiz` - Quiz metadata
- `question` - Quiz questions
- `answer` - Answer options
- `quizAttempt` - User attempts
- `attemptAnswer` - Individual answers

All relationships use cascade deletes for clean data management.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker compose up -d
```

See `docs/deployment.md` for detailed instructions.

## Support

- [Main Repository](https://github.com/sebdanielsson/respondeo)
- [Documentation](https://github.com/sebdanielsson/respondeo/tree/main/apps/web/docs)
- [Issues](https://github.com/sebdanielsson/respondeo/issues)

## License

MIT
