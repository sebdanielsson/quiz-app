# Quiz App

A modern, full-stack quiz application built with Next.js 16, featuring OIDC authentication, real-time leaderboards, and a comprehensive REST API with API key authentication.

## Features

- 🎯 **Quiz Management** — Create, edit, and delete quizzes with multiple-choice questions
- 🔐 **OIDC Authentication** — Secure sign-in via OpenID Connect (configurable provider)
- 👑 **Role-Based Access** — Admin permissions based on OIDC groups claim
- 🏆 **Leaderboards** — Per-quiz and global leaderboards with rankings
- ⏱️ **Timed Quizzes** — Optional time limits with timeout tracking
- 🔄 **Randomization** — Shuffle questions for each attempt
- 🔑 **API Keys** — Programmatic access with scoped permissions and rate limiting
- 📖 **OpenAPI Docs** — Interactive API documentation with Scalar
- 🌓 **Dark Mode** — System-aware theme switching

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Bun
- **Database**: SQLite or PostgreSQL with Drizzle ORM
- **Auth**: BetterAuth with OIDC + API Key plugins
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Validation**: Zod

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- An OIDC provider (e.g., Keycloak, Auth0, Okta, Pocket ID)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quiz-app

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OIDC Configuration
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret

# Admin Group (users in this OIDC group can manage quizzes and API keys)
OIDC_ADMIN_GROUP=admin
```

### Database Setup

The app supports both SQLite (default) and PostgreSQL. Set the `DB_DIALECT` environment variable to choose your database.

#### SQLite (Default)

```bash
# No additional setup needed, just push the schema
bun run db:push

# Or use migrations
bun run db:generate
bun run db:migrate
```

#### PostgreSQL

```bash
# Set environment variables
export DB_DIALECT=postgres
export DATABASE_URL=postgresql://user:password@localhost:5432/quiz_app

# Generate and run migrations
bun run db:generate
bun run db:migrate
```

### Development

```bash
# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Project Structure

```plaintext
quiz-app/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   └── sign-in/
│   ├── (dashboard)/      # Main app pages
│   │   ├── page.tsx      # Quiz list (home)
│   │   ├── leaderboard/  # Global leaderboard
│   │   ├── settings/     # Admin API key management
│   │   └── quiz/
│   │       ├── new/      # Create quiz
│   │       └── [id]/     # Quiz detail, edit, play, results
│   ├── actions/          # Server actions
│   ├── api/              # REST API endpoints
│   │   ├── auth/         # BetterAuth handler
│   │   ├── leaderboard/  # Global leaderboard
│   │   └── quizzes/      # Quiz CRUD + attempts + leaderboards
│   └── docs/             # OpenAPI documentation (Scalar)
├── components/
│   ├── auth/             # Auth components
│   ├── layout/           # Header, theme, pagination
│   ├── quiz/             # Quiz-related components
│   ├── settings/         # API key manager
│   └── ui/               # Reusable UI components
└── lib/
    ├── auth/             # Auth configuration & helpers
    ├── db/               # Database schema & queries
    ├── openapi.ts        # OpenAPI 3.1 specification
    └── validations/      # Zod schemas
```

## REST API

The Quiz App provides a comprehensive REST API for programmatic access. All endpoints require authentication via API key.

### Authentication

Include your API key in the `x-api-key` header:

```bash
curl -H "x-api-key: your_api_key_here" https://yourapp.com/api/quizzes
```

### API Key Management

Admins can create and manage API keys through the web UI at `/settings`. Each API key can have specific permission scopes:

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

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `bun run dev`          | Start development server            |
| `bun run build`        | Build for production                |
| `bun run start`        | Start production server             |
| `bun run tsc`          | TypeScript type checking            |
| `bun run lint`         | Run ESLint                          |
| `bun run format`       | Format code with Prettier           |
| `bun run format:check` | Check code formatting with Prettier |
| `bun run stylelint`    | Run Stylelint for CSS files         |
| `bun run db:push`      | Push schema changes to database     |
| `bun run db:generate`  | Generate migration files            |
| `bun run db:migrate`   | Run migrations                      |
| `bun run db:studio`    | Open Drizzle Studio                 |
| `bun test`             | Run tests                           |

## License

MIT
