# Deploy Viral Content Miner

## Prerequisites

- Node.js 18+
- Vercel account
- GitHub repository

## Environment Variables

Set these in Vercel dashboard or `.env.local` for local development:

```
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

Optional:
```
INSTAGRAM_ACCESS_TOKEN=
TIKTOK_CLIENT_KEY=
YOUTUBE_API_KEY=
```

## Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Deploy via GitHub

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

## Database Setup

The app uses Prisma with SQLite by default. For production, consider PostgreSQL:

1. Add a Vercel Postgres database
2. Update `DATABASE_URL` environment variable
3. Run `npx prisma migrate deploy`

## Verify Deployment

Visit `/api/health` to check deployment status.

## Troubleshooting

- Build fails: Check environment variables are set
- API errors: Verify API keys are valid
- Database issues: Run `npx prisma migrate deploy`
