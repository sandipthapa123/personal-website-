#!/bin/bash
###############################################################################
# server-setup.sh — Run on the cPanel server via SSH after uploading files
# Usage: bash scripts/server-setup.sh
###############################################################################
set -e

echo "=============================================="
echo "🔧 Setting up thapasandip.com.np on server"
echo "=============================================="
echo ""

# 1. Install production dependencies
echo "📦 Step 1/4: Installing production dependencies..."
npm install --omit=dev
echo "✅ Dependencies installed"
echo ""

# 2. Generate Prisma client for Linux
echo "🗄️  Step 2/4: Generating Prisma client for Linux..."
cd apps/backend
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# 3. Run database migrations
echo "🗄️  Step 3/4: Running database migrations..."
npx prisma migrate deploy
cd ../..
echo "✅ Database migrations applied"
echo ""

# 4. Restart Passenger apps
echo "🔄 Step 4/4: Signaling Passenger to restart apps..."
mkdir -p apps/backend/tmp && touch apps/backend/tmp/restart.txt
mkdir -p apps/frontend/tmp && touch apps/frontend/tmp/restart.txt
echo "✅ Restart signals sent"
echo ""

echo "=============================================="
echo "✅ SERVER SETUP COMPLETE!"
echo "=============================================="
echo ""
echo "🌐 Your apps should be live at:"
echo "   Frontend: https://thapasandip.com.np"
echo "   Backend:  https://api.thapasandip.com.np"
echo "   API Docs: https://api.thapasandip.com.np/api/docs"
echo ""
echo "📌 If apps don't restart automatically:"
echo "   Go to cPanel → Setup Node.js App → Click 'Restart' for each app"
echo ""
echo "⏰ Don't forget to set up keep-alive cron jobs in cPanel:"
echo "   */4 * * * * curl -s https://api.thapasandip.com.np/api/v1 > /dev/null 2>&1"
echo "   */4 * * * * curl -s https://thapasandip.com.np > /dev/null 2>&1"
