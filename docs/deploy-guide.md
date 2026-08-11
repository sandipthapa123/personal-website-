# Deployment Guide — thapasandip.com.np

Complete guide to deploying the CMS platform on cPanel hosting at himalayan.host.

## Architecture

| Component | URL | Technology |
|-----------|-----|------------|
| Frontend | `https://thapasandip.com.np` | Next.js 14 (Standalone SSR) |
| Backend | `https://api.thapasandip.com.np` | NestJS (Express) |
| Database | `localhost:5432` | PostgreSQL (cPanel) |
| Web Server | — | Apache/LiteSpeed + Phusion Passenger |

---

## Prerequisites

- cPanel hosting with Node.js Selector (Node.js 20.x)
- SSH access to the server
- PostgreSQL available in cPanel
- Domain DNS already configured

---

## Step 1: Create PostgreSQL Database

1. Log into **cPanel** → **Databases** → **PostgreSQL Database Wizard**
2. **Create Database**: Enter name (e.g., `cms_db`) — cPanel will prefix it with your username (e.g., `thapas_cms_db`)
3. **Create User**: Enter username and strong password
4. **Assign Privileges**: Check **ALL PRIVILEGES**
5. Note down: database name, username, password (all with cPanel prefix)

## Step 2: Create Subdomain

1. **cPanel** → **Domains** → **Subdomains**
2. Create: `api.thapasandip.com.np`
3. Document root: `api.thapasandip.com.np` (or default)

## Step 3: Set Up Node.js Apps in cPanel

### Backend App (api.thapasandip.com.np)

1. **cPanel** → **Software** → **Setup Node.js App** → **Create Application**
2. Settings:
   - **Node.js version**: 20.x
   - **Application mode**: Production
   - **Application root**: Path to your project (e.g., `thapasandip.com.np` or wherever you uploaded)
   - **Application URL**: `api.thapasandip.com.np`
   - **Application startup file**: `apps/backend/app.js`
3. **Environment variables** (add these in the cPanel UI):
   - `NODE_ENV` = `production`
   - `PORT` = `4000`
   - `DATABASE_URL` = `postgresql://user:pass@localhost:5432/dbname?schema=public`
   - `JWT_SECRET` = (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `JWT_REFRESH_SECRET` = (generate another)
   - `CORS_ORIGINS` = `https://thapasandip.com.np,https://api.thapasandip.com.np`
   - (Plus all MAIL_* variables from .env.production)

### Frontend App (thapasandip.com.np)

1. **cPanel** → **Software** → **Setup Node.js App** → **Create Application**
2. Settings:
   - **Node.js version**: 20.x
   - **Application mode**: Production
   - **Application root**: Same project root
   - **Application URL**: `thapasandip.com.np`
   - **Application startup file**: `apps/frontend/app.js`
3. **Environment variables**:
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_API_URL` = `https://api.thapasandip.com.np/api/v1`

## Step 4: Upload Code

### Option A: Git (Recommended)
```bash
# SSH into server
ssh username@himalayan.host

# Navigate to project directory
cd ~/thapasandip.com.np

# Clone or pull
git clone https://github.com/sandipthapa123/personal-website- .
# OR: git pull origin main
```

### Option B: SFTP
Upload the entire project directory via FileZilla or similar SFTP client.

## Step 5: Build Locally

On your **local machine** (Windows):
```powershell
# Navigate to project
cd d:\thapasandip.com.np

# Run the build script (use Git Bash or WSL)
bash scripts/deploy.sh
```

Then upload the built files to the server.

## Step 6: Server Setup

On the **server via SSH**:
```bash
cd ~/thapasandip.com.np

# Make scripts executable
chmod +x scripts/*.sh

# Run server setup
bash scripts/server-setup.sh
```

## Step 7: Restart Apps

1. Go to **cPanel** → **Setup Node.js App**
2. Click **Restart** on both apps
3. Wait 10-15 seconds

## Step 8: Set Up Keep-Alive Cron Jobs

Passenger kills idle Node.js processes after 5 minutes. Prevent cold starts:

1. **cPanel** → **Advanced** → **Cron Jobs**
2. Add two jobs (every 4 minutes):
   ```
   */4 * * * * curl -s https://api.thapasandip.com.np/api/v1 > /dev/null 2>&1
   */4 * * * * curl -s https://thapasandip.com.np > /dev/null 2>&1
   ```

---

## Verify Deployment

```bash
# Check backend
curl -I https://api.thapasandip.com.np/api/v1

# Check frontend
curl -I https://thapasandip.com.np

# Check Swagger docs
curl -I https://api.thapasandip.com.np/api/docs
```

---

## Troubleshooting

### App shows 503 error
- Check cPanel → Setup Node.js App → is the app running?
- Check error logs: cPanel → Metrics → Errors

### Prisma connection error
- Verify `DATABASE_URL` in environment variables
- Ensure PostgreSQL user has ALL PRIVILEGES
- Check that database name includes cPanel prefix

### Frontend shows blank page
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend CORS_ORIGINS includes `https://thapasandip.com.np`

### Cold start delays (1-4 seconds)
- Ensure cron jobs are running (cPanel → Cron Jobs)
- Consider upgrading to VPS for persistent processes

### Restart an app without cPanel UI
```bash
# Backend
touch ~/thapasandip.com.np/apps/backend/tmp/restart.txt

# Frontend
touch ~/thapasandip.com.np/apps/frontend/tmp/restart.txt
```

---

## Re-deploying Updates

```bash
# On local machine
git add . && git commit -m "update" && git push

# On server via SSH
cd ~/thapasandip.com.np
git pull origin main
bash scripts/server-setup.sh

# Or restart via cPanel UI
```
