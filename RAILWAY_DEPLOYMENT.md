# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI** (optional): Install with `npm install -g @railway/cli`
3. **GitHub Repository**: Push this code to a GitHub repository

## Required Environment Variables

Set these in your Railway project settings:

### Database
- `DATABASE_URL` - MySQL/TiDB connection string from Railway

### Authentication (Manus OAuth)
- `JWT_SECRET` - Random secret for session signing (generate with `openssl rand -base64 32`)
- `OAUTH_SERVER_URL` - Manus OAuth backend URL
- `VITE_APP_ID` - Your Manus OAuth application ID
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `OWNER_OPEN_ID` - Your Manus user ID
- `OWNER_NAME` - Your name

### AI & Services
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude Sonnet 4.5
- `BUILT_IN_FORGE_API_URL` - Manus built-in APIs URL
- `BUILT_IN_FORGE_API_KEY` - Manus built-in APIs key

### App Configuration
- `VITE_APP_TITLE` - "AI Business OS" (or your preferred name)
- `VITE_APP_LOGO` - URL to your logo image
- `PORT` - 3000 (Railway sets this automatically)
- `NODE_ENV` - production

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Railway Project**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MySQL Database**:
   - In your Railway project, click "+ New"
   - Select "Database" → "Add MySQL"
   - Railway will automatically set `DATABASE_URL`

4. **Set Environment Variables**:
   - Go to your service → "Variables"
   - Add all required environment variables listed above
   - **Important**: Copy `DATABASE_URL` from the MySQL service

5. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for deployment to complete (~5-10 minutes)

6. **Run Database Migrations**:
   - In Railway dashboard, go to your service
   - Open "Deployments" tab
   - Click on the latest deployment
   - In the "Deploy Logs", verify migrations ran successfully
   - If not, you may need to run manually via Railway CLI:
     ```bash
     railway run pnpm db:push
     ```

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add MySQL**:
   ```bash
   railway add mysql
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set ANTHROPIC_API_KEY=<your-key>
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   # ... set all other variables
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

## Post-Deployment

### 1. Verify Deployment

Visit your Railway-provided URL (e.g., `https://your-app.up.railway.app`)

You should see the Observatory dashboard.

### 2. Test the System

1. **Sign in** using Manus OAuth
2. **Create a directive** - Click "+ New Directive"
3. **Verify worker is running** - Check Railway logs for:
   ```
   [Worker] Starting 24/7 autonomous worker
   [Worker] Loop interval: 5 minutes
   ```

### 3. Monitor Logs

In Railway dashboard:
- Go to your service → "Deployments" → Latest deployment
- Click "View Logs" to see real-time logs
- Look for:
  - `[Seed] Initial data seeded successfully`
  - `[Worker] Starting 24/7 autonomous worker`
  - `[Orchestrator] Running strategic loop`

## Cost Optimization

### Railway Costs
- **Hobby Plan**: $5/month for 500 hours
- **Pro Plan**: $20/month for unlimited hours
- MySQL database: ~$5-10/month

### Claude API Costs
- **Claude Sonnet 4.5**: ~$3 per million input tokens, ~$15 per million output tokens
- **Estimated**: $5-20/day depending on usage
- **Budget Controls**: System has HITL approval for expenses >$150/day

## Troubleshooting

### Build Fails

**Error**: `pnpm: command not found`
- **Solution**: Railway should auto-detect pnpm from `package.json`. If not, add to `nixpacks.toml`:
  ```toml
  [phases.setup]
  nixPkgs = ["nodejs_20", "pnpm"]
  ```

### Database Connection Fails

**Error**: `Failed to connect to database`
- **Solution**: Verify `DATABASE_URL` is set correctly
- Check MySQL service is running in Railway
- Format: `mysql://user:password@host:port/database`

### Worker Not Running

**Error**: No worker logs
- **Solution**: Check Railway logs for errors
- Verify `ANTHROPIC_API_KEY` is set
- Restart the service

### Seed Data Errors

**Error**: `Duplicate entry` errors
- **Solution**: This is normal on restart - seed data already exists
- The system handles this gracefully

## Scaling

### Horizontal Scaling
Railway doesn't support horizontal scaling for this app (single instance with background worker).

### Vertical Scaling
- Increase memory/CPU in Railway settings if needed
- Monitor performance in Railway dashboard

## Security

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate secrets regularly** - Especially `JWT_SECRET`
3. **Monitor API costs** - Set up billing alerts in Anthropic dashboard
4. **Review HITL requests** - Check approval queue daily

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Anthropic Docs**: https://docs.anthropic.com

## Next Steps

1. **Custom Domain**: Add your domain in Railway settings
2. **Monitoring**: Set up Sentry or LogRocket for error tracking
3. **Analytics**: Add Plausible or PostHog for usage analytics
4. **Backups**: Railway handles database backups automatically

