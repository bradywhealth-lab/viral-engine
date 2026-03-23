# Viral Content Miner

Viral Content Miner is a Next.js creator operations dashboard for mining trends, generating content ideas, managing a content queue, running sports card resale searches, building giveaway campaigns, and reviewing lightweight analytics.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
FIRECRAWL_API_KEY=fc-...
NEXT_PUBLIC_APP_NAME=Viral Content Miner
```

3. Generate Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

5. Build and lint before shipping:

```bash
npm run build
npm run lint
```

## Deploying To Vercel

1. Import the repository into Vercel.
2. Add the same environment variables from `.env.local`.
3. Ensure the project uses the included `vercel.json` build command:

```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

4. Deploy. Vercel will generate the Prisma client during the build and then run the production Next.js build.
