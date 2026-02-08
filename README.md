# Respondeo

A modern, full-stack quiz application built with Next.js 16, featuring OIDC authentication, real-time leaderboards, and a comprehensive REST API with API key authentication.

## 📚 Documentation

**Complete documentation is available at:** [`/docs`](./docs/index.mdx) or online at https://quiz-app-docs.example.com

Quick links:

- [Getting Started](./docs/getting-started/installation.mdx)
- [Configuration](./docs/getting-started/configuration.mdx)
- [API Reference](./docs/api-reference/overview.mdx)
- [RBAC Guide](./docs/guides/rbac.mdx)
- [Troubleshooting](./docs/troubleshooting.mdx)

## Features

- 🎯 **Quiz Management** — Create, edit, and delete quizzes with multiple-choice questions
- ✨ **AI Generated Content** — Use AI to help generate questions and answers
- 🔎 **Image Browser** — Browse and select images via Unsplash API integration
- 🔐 **OIDC Authentication** — Secure sign-in via OpenID Connect (configurable provider)
- 👑 **Role-Based Access** — Admin permissions based on OIDC groups claim
- 🏆 **Leaderboards** — Per-quiz and global leaderboards with rankings
- ⏱️ **Timed Quizzes** — Optional time limits with timeout tracking
- 🔄 **Randomization** — Shuffle questions for each attempt
- 🔑 **API Keys** — Programmatic access with scoped permissions and rate limiting
- 📖 **OpenAPI Docs** — Interactive API documentation with Scalar
- 🌓 **Dark Mode** — System-aware theme switching

## Tech Stack

- **Monorepo**: Bun workspaces + Turborepo 2.4+
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Bun
- **Database**: PostgreSQL with Drizzle ORM (via `bun:sql`)
- **Cache**: Valkey/Redis (optional, via Bun native client)
- **Auth**: BetterAuth with OIDC + API Key plugins
- **UI**: shadcn/ui (Base UI - Nova), Lucide Icons
- **Validation**: Zod
- **AI**: AI SDK with multi-provider support
- **Images**: Unsplash API integration

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.8
- PostgreSQL database
- An OIDC provider (e.g., Keycloak, Auth0, Okta, Pocket ID)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd quiz-app
bun install

# Start database
docker compose up -d

# Configure environment
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your settings

# Run migrations
bun run db:migrate

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

See [Installation Guide](./docs/getting-started/installation.mdx) for detailed setup instructions.

## Configuration

Minimum required environment variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
BETTER_AUTH_SECRET=your-32-character-secret
BETTER_AUTH_URL=http://localhost:3000

# OIDC Provider
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_app
```

See [Configuration Guide](./docs/getting-started/configuration.mdx) for all available options.

## Development

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run tsc          # Type checking
bun run lint         # Run ESLint
bun run format       # Format code
bun run db:migrate   # Run database migrations
bun run db:studio    # Open Drizzle Studio
bun test             # Run tests
```

See [Scripts Reference](./docs/development/scripts.mdx) for all available commands.

## Project Structure

```plaintext
quiz-app/
├── apps/
│   ├── web/              # Main Next.js application
│   └── docs/             # Fumadocs documentation site
├── docs/                 # Documentation source (MDX files)
├── package.json          # Workspace root
└── turbo.json            # Turborepo configuration
```

See [Architecture Guide](./docs/development/architecture.mdx) for detailed system architecture.

## API

Respondeo provides a comprehensive REST API. Get started:

1. [Create an API key](./docs/features/api-keys.mdx) at `/settings` (admin only)
2. Include it in the `x-api-key` header
3. Explore endpoints in the [API Reference](./docs/api-reference/overview.mdx)

Interactive API documentation available at `/docs` when running the app.

## Deployment

The app can be deployed to:

- **Vercel** — Easiest, with Vercel Postgres
- **Docker** — Use included `compose.yaml`
- **VPS** — Any server with Bun and PostgreSQL
- **Railway, Fly.io** — Docker-based platforms

See [Deployment Guide](./docs/guides/deployment.mdx) for detailed instructions.

## Documentation

This repository includes a Fumadocs-powered documentation site in `apps/docs/`.

**To run the docs locally:**

```bash
bun run dev --filter=docs
```

Visit http://localhost:3001

All documentation source files are in the `/docs` directory at the repository root.

## License

MIT

## Support

- **Documentation**: [Complete docs](./docs/index.mdx)
- **GitHub Issues**: [Report bugs](https://github.com/sebdanielsson/quiz-app/issues)
- **Discussions**: [Ask questions](https://github.com/sebdanielsson/quiz-app/discussions)
- **Troubleshooting**: [Common issues](./docs/troubleshooting.mdx)

| Scope            | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `quizzes:read`   | List and view quizzes, view leaderboards                 |
| `quizzes:write`  | Create, update, and delete quizzes (requires admin role) |
| `attempts:read`  | View quiz attempts                                       |
| `attempts:write` | Submit quiz attempts                                     |

### Rate Limiting

API keys are rate-limited to **100 requests per minute** by default. When rate-limited, the API returns a `429 Too Many Requests` response.

### API Documentation

Interactive API documentation is available at [`/docs`](/docs) powered by [Scalar](https://scalar.com/). The documentation includes:

- 📋 **Full endpoint reference** with request/response schemas
- 🧪 **"Try it" functionality** to test endpoints directly in the browser
- 📦 **Code snippets** in multiple languages (JavaScript, Python, cURL, etc.)
- 🔐 **Authentication setup** for API key configuration

---

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

| Status Code | Description                                  |
| ----------- | -------------------------------------------- |
| `400`       | Bad Request — Invalid input data             |
| `401`       | Unauthorized — Missing or invalid API key    |
| `403`       | Forbidden — Insufficient permissions         |
| `404`       | Not Found — Resource doesn't exist           |
| `429`       | Too Many Requests — Rate limit exceeded      |
| `500`       | Internal Server Error — Something went wrong |

---

## Scripts

| Command                      | Description                         |
| ---------------------------- | ----------------------------------- |
| `bun --bun run dev`          | Start development server            |
| `bun --bun run build`        | Build for production                |
| `bun --bun run start`        | Start production server             |
| `bun --bun run tsc`          | TypeScript type checking            |
| `bun --bun run lint`         | Run ESLint                          |
| `bun --bun run format`       | Format code with Prettier           |
| `bun --bun run format:check` | Check code formatting with Prettier |
| `bun --bun run stylelint`    | Run Stylelint for CSS files         |
| `bun --bun run db:push`      | Push schema changes to database     |
| `bun --bun run db:generate`  | Generate migration files            |
| `bun --bun run db:migrate`   | Run migrations                      |
| `bun --bun run db:studio`    | Open Drizzle Studio                 |
| `bun test`                   | Run tests                           |

## License

MIT
