# Deploy to Vercel (Free)

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your code pushed to GitHub

## Steps

### 1. Push to GitHub
```bash
cd /home/z/my-project
git init
git add .
git commit -m "Initial commit: Mayaash ID Card System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mayaash-id-card-system.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects Next.js settings
6. Click "Deploy"

### 3. Environment Variables

Add these in Vercel dashboard (Settings > Environment Variables):

#### Database (if using SQLite)
- No additional variables needed (SQLite is file-based)

#### M-Pesa Credentials (Required for payments)
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=174379
MPESA_ENVIRONMENT=sandbox
```

Get these from:
- https://developer.safaricom.co.ke/Account/APIUserCredentials.aspx

#### Admin Credentials (from database)
- Already in your SQLite database

### 4. After Deployment

Your app will be available at:
- `https://your-project-name.vercel.app`

## Important Notes

### M-Pesa Callback URL
Vercel will provide your domain. Update your M-Pesa callback URL:
- Production: `https://your-domain.vercel.app/api/mpesa/callback`
- Sandbox: `https://your-domain.vercel.app/api/mpesa/callback`

### Database Persistence
⚠️ **Important**: SQLite file-based databases reset on Vercel deployments!
For production, consider:
1. **Vercel Postgres** (Free tier available)
2. **Neon** (Free PostgreSQL)
3. **Supabase** (Free PostgreSQL)

### Migrate to PostgreSQL (Recommended)

1. Create a PostgreSQL database (Vercel Postgres or Neon)
2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Update `.env`:
```
DATABASE_URL=postgresql://...
```

4. Run migrations:
```bash
npx prisma migrate dev --name init
```

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure all API routes return JSON (not HTML)

### Database Issues
- Migrate from SQLite to PostgreSQL for production
- Use Vercel Postgres or Neon (both have free tiers)

### M-Pesa Callbacks
- Ensure callback URL is publicly accessible
- Test with sandbox environment first
- Use ngrok for local testing:
```bash
npm install -g ngrok
ngrok http 3000
```

## Free Limits (Vercel)

- ✅ 100GB bandwidth/month
- ✅ 6,000 execution minutes/month
- ✅ Unlimited projects
- ✅ Automatic SSL
- ✅ Global CDN

## Next Steps

1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables
4. Test all features
5. Migrate to PostgreSQL (recommended)
6. Set up custom domain (optional)
