# Free Hosting Options for Mayaash ID Card System

## Quick Comparison

| Platform | Best For | Free Tier | Database | Difficulty |
|----------|----------|-----------|----------|------------|
| **Vercel** | Next.js apps | ✅ 100GB bandwidth | Need Postgres | ⭐ Easy |
| **Netlify** | Static/API | ✅ 100GB bandwidth | Need Postgres | ⭐ Easy |
| **Railway** | Full-stack | Trial credit | Built-in | ⭐⭐ Medium |
| **Render** | Web services | ✅ Free (spins down) | Built-in | ⭐⭐ Medium |
| **Fly.io** | Containerized | ✅ 3 apps free | External | ⭐⭐⭐ Hard |

---

## 1. VERCEL (Recommended) ⭐

### Why Vercel?
- Built by Next.js creators
- Best performance for Next.js
- Automatic deployments
- Global CDN
- Free tier is generous

### Free Tier Features
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ 6,000 execution minutes/month
- ✅ Automatic HTTPS
- ✅ Edge functions
- ✅ Preview deployments

### Limitations
- ❌ SQLite database resets on every deploy
- ❌ No built-in database (need external Postgres)

### Setup Time: 10 minutes

### Steps

#### 1. Push to GitHub
```bash
cd /home/z/my-project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/repo.git
git push -u origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click "Deploy"

#### 3. Add Environment Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

```
# M-Pesa Credentials
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=174379
MPESA_ENVIRONMENT=sandbox

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://...
```

#### 4. Database (Recommended: Migrate to PostgreSQL)
Since SQLite doesn't work well on Vercel, use:

**Option A: Vercel Postgres**
- Free tier: 256MB
- Direct integration with Vercel
- Easy setup

**Option B: Neon (Free)**
- 0.5GB free PostgreSQL
- Serverless
- Great for small apps

**Option C: Supabase (Free)**
- 500MB free PostgreSQL
- Built-in authentication (if needed)
- Real-time features

#### 5. Migrate Database
```bash
# Install PostgreSQL client
npm install pg

# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Push schema
npx prisma db push

# Generate client
npx prisma generate
```

### URL After Deployment
`https://your-project-name.vercel.app`

---

## 2. NETLIFY ⭐

### Why Netlify?
- Great for Next.js
- Easy to set up
- Generous free tier
- Good CI/CD

### Free Tier Features
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Serverless functions
- ✅ Automatic HTTPS

### Limitations
- ❌ SQLite resets on deploy
- ❌ No built-in database

### Setup Time: 10 minutes

### Steps

#### 1. Push to GitHub (same as Vercel)

#### 2. Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Add new site → Import from Git
3. Select repository
4. Build command: `npm run build`
5. Publish directory: `.next`

#### 3. Add Environment Variables
Go to: Site Settings → Environment Variables

Same variables as Vercel.

### URL After Deployment
`https://your-project-name.netlify.app`

---

## 3. RAILWAY

### Why Railway?
- Full-stack hosting
- Built-in PostgreSQL
- Easy database management
- Great developer experience

### Free Tier
- $5/month credit (trial)
- After trial: Pay-as-you-go

### Setup Time: 15 minutes

### Steps

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login
```bash
railway login
```

#### 3. Initialize Project
```bash
cd /home/z/my-project
railway init
```

#### 4. Add PostgreSQL
```bash
railway add postgresql
```

#### 5. Deploy
```bash
railway up
```

### URL After Deployment
`https://your-project.up.railway.app`

---

## 4. RENDER

### Why Render?
- Free web services
- Built-in PostgreSQL
- Easy deployment

### Free Tier
- ✅ Web service: Free (spins down after 15min inactivity)
- ✅ PostgreSQL: 90 days free trial

### Setup Time: 15 minutes

### Steps

#### 1. Push to GitHub

#### 2. Deploy to Render
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Build: `npm run build`
5. Start: `npm start`

#### 3. Add PostgreSQL
1. New → PostgreSQL
2. Connect to your app

### URL After Deployment
`https://your-project.onrender.com`

### Limitation
- App spins down after 15 minutes of inactivity
- First request after sleep takes longer to respond

---

## 5. FLY.IO

### Why Fly.io?
- Runs close to users worldwide
- Free tier for small apps
- Supports Docker containers

### Free Tier
- ✅ 3 apps × 256MB RAM
- ✅ 3GB volume storage

### Setup Time: 30 minutes

### Steps

#### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Login
```bash
flyctl auth signup
flyctl auth login
```

#### 3. Launch App
```bash
cd /home/z/my-project
flyctl launch
```

#### 4. Deploy
```bash
flyctl deploy
```

### URL After Deployment
`https://your-project.fly.dev`

---

## DATABASE OPTIONS

### Why Not SQLite for Production?

SQLite is file-based and doesn't work well with:
- ❌ Multiple deployments (Vercel, Netlify)
- ❌ Auto-scaling
- ❌ Distributed systems

### Free PostgreSQL Options

#### 1. **Vercel Postgres** (Recommended for Vercel)
- Free: 256MB
- Direct integration
- Automatic backups

#### 2. **Neon** (Best for Serverless)
- Free: 0.5GB
- Branching
- Serverless

#### 3. **Supabase**
- Free: 500MB
- Built-in auth
- Real-time features

#### 4. **Railway Postgres**
- Trial included
- Easy setup
- Great for Railway apps

#### 5. **Render Postgres**
- 90 days free
- Integrated with Render

### Migration Steps

```bash
# 1. Update schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 2. Install PostgreSQL driver
npm install pg

# 3. Set DATABASE_URL in environment
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# 4. Push schema to new database
npx prisma db push

# 5. Generate client
npx prisma generate
```

---

## M-PESA CALLBACK SETUP

### For Production

Your callback URL must be publicly accessible:

```
https://your-domain.com/api/mpesa/callback
```

### Update M-Pesa Dashboard

1. Go to Safaricom Developer Portal
2. Select your app
3. Update Validation URL: `https://your-domain.com/api/mpesa/callback`
4. Update Confirmation URL: `https://your-domain.com/api/mpesa/callback`

### For Local Testing

Use ngrok to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Update callback URL to:
https://random-id.ngrok-free.app/api/mpesa/callback
```

---

## RECOMMENDATION

### For Your Mayaash ID Card System

**Best Option: Vercel + Neon Postgres**

Why?
- ✅ Vercel is optimized for Next.js
- ✅ Neon provides free PostgreSQL
- ✅ Easy to set up
- ✅ Great performance
- ✅ Automatic deployments

**Alternative: Railway**

Why?
- ✅ Built-in PostgreSQL
- ✅ Full-stack hosting
- ✅ No need for external database
- ⚠️ Free tier is limited

---

## COST COMPARISON (Annual)

| Platform | Free Tier | Paid (if needed) |
|----------|-----------|------------------|
| Vercel | $0 | $20/month Pro |
| Netlify | $0 | $19/month Pro |
| Railway | $5/month (trial) | $5/month+ |
| Render | $0 (spins down) | $7/month+ |
| Fly.io | $0 (3 apps) | $5-50/month |

---

## SECURITY CHECKLIST

Before deploying to production:

- [ ] Change default admin password
- [ ] Use HTTPS (all platforms provide this)
- [ ] Set up environment variables (don't commit .env)
- [ ] Update M-Pesa callback URL
- [ ] Test payment flow with sandbox
- [ ] Migrate to PostgreSQL
- [ ] Remove test data (optional)
- [ ] Set up custom domain (optional)
- [ ] Add rate limiting (optional)
- [ ] Monitor logs and errors

---

## MONITORING & DEBUGGING

### Vercel
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- Logs: Project → Deployments → Functions
- Analytics: Project → Analytics

### Netlify
- Dashboard: [app.netlify.com](https://app.netlify.com)
- Logs: Site → Functions → Functions log

### Railway
- Dashboard: [railway.app](https://railway.app)
- Logs: Project → Logs
- Metrics: Project → Metrics

---

## FINAL NOTES

1. **Start with Vercel** - easiest for Next.js
2. **Migrate to PostgreSQL** - required for production
3. **Use free tiers first** - upgrade when needed
4. **Test thoroughly** - especially payment flow
5. **Monitor performance** - upgrade if needed

For detailed Vercel deployment guide, see: `VERCEL_DEPLOYMENT.md`
