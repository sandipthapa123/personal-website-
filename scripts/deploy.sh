#!/bin/bash
###############################################################################
# deploy.sh — Build everything locally for production deployment
# Run from project root: bash scripts/deploy.sh
###############################################################################
set -e

echo "=============================================="
echo "🚀 Building thapasandip.com.np for production"
echo "=============================================="
echo ""

# 1. Build shared packages first (backend & frontend depend on these)
echo "📦 Step 1/5: Building shared packages..."
npm run build:packages
echo "✅ Shared packages built"
echo ""

# 2. Generate Prisma client with binary targets for both local + Linux
echo "🗄️  Step 2/5: Generating Prisma client..."
cd apps/backend
npx prisma generate
cd ../..
echo "✅ Prisma client generated"
echo ""

# 3. Build NestJS backend
echo "🔧 Step 3/5: Building backend..."
npm --workspace=apps/backend run build
echo "✅ Backend built → apps/backend/dist/"
echo ""

# 4. Build Next.js frontend (standalone mode)
echo "🎨 Step 4/5: Building frontend (standalone)..."
npm --workspace=apps/frontend run build
echo "✅ Frontend built → apps/frontend/.next/standalone/"
echo ""

# 5. Copy static assets into standalone output
echo "📂 Step 5/5: Assembling standalone assets..."
if [ -d "apps/frontend/.next/standalone" ]; then
  # Copy static files
  if [ -d "apps/frontend/.next/static" ]; then
    mkdir -p apps/frontend/.next/standalone/apps/frontend/.next/static
    cp -r apps/frontend/.next/static/* apps/frontend/.next/standalone/apps/frontend/.next/static/
    echo "  ✅ Static assets copied"
  fi
  
  # Copy public directory
  if [ -d "apps/frontend/public" ]; then
    mkdir -p apps/frontend/.next/standalone/apps/frontend/public
    cp -r apps/frontend/public/* apps/frontend/.next/standalone/apps/frontend/public/
    echo "  ✅ Public assets copied"
  fi
else
  echo "  ⚠️  No standalone output found. Make sure 'output: standalone' is in next.config.mjs"
fi
echo ""

echo "=============================================="
echo "✅ BUILD COMPLETE!"
echo "=============================================="
echo ""
echo "📦 Files to upload to your cPanel server:"
echo ""
echo "  PROJECT ROOT:"
echo "    ├── packages/           (shared packages)"
echo "    ├── package.json"
echo "    ├── package-lock.json"
echo "    └── tsconfig.base.json"
echo ""
echo "  BACKEND (api.thapasandip.com.np):"
echo "    ├── apps/backend/dist/        (compiled code)"
echo "    ├── apps/backend/prisma/      (schema + migrations)"
echo "    ├── apps/backend/app.js       (Passenger startup)"
echo "    ├── apps/backend/package.json"
echo "    └── apps/backend/.env.production → rename to .env on server"
echo ""
echo "  FRONTEND (thapasandip.com.np):"
echo "    ├── apps/frontend/.next/      (built output)"
echo "    ├── apps/frontend/app.js      (Passenger startup)"
echo "    ├── apps/frontend/package.json"
echo "    └── apps/frontend/.env.production → rename to .env.local on server"
echo ""
echo "💡 After uploading, run: bash scripts/server-setup.sh on the server"
