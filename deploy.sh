#!/bin/bash

# NutriTrack Vercel Deployment Script
# This script helps you deploy both frontend and backend to Vercel

echo "🚀 NutriTrack Vercel Deployment Helper"
echo "======================================"
echo ""

# Check if user has Vercel CLI installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Install it with: npm install -g vercel"
    echo ""
    echo "Or use the Vercel web interface at: https://vercel.com"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# Deployment options
echo "Select deployment option:"
echo "1) Deploy Backend only"
echo "2) Deploy Frontend only"
echo "3) Deploy Both (Backend first, then Frontend)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Backend..."
        echo "Make sure you have set environment variables in Vercel Dashboard:"
        echo "  - MONGODB_URI"
        echo "  - NODE_ENV"
        echo "  - GEMINI_API_KEY"
        echo ""
        cd backend
        vercel --prod
        cd ..
        echo "✅ Backend deployment initiated!"
        ;;
    2)
        echo ""
        echo "🎨 Deploying Frontend..."
        echo "Make sure you have set environment variables in Vercel Dashboard:"
        echo "  - VITE_GEMINI_API_KEY"
        echo "  - VITE_BACKEND_URL"
        echo "  - VITE_MONGODB_URI"
        echo ""
        vercel --prod
        echo "✅ Frontend deployment initiated!"
        ;;
    3)
        echo ""
        echo "📦 Step 1: Deploying Backend..."
        cd backend
        vercel --prod
        cd ..
        echo "✅ Backend deployment initiated!"
        echo ""
        echo "⏳ Waiting 30 seconds for backend to deploy..."
        sleep 30
        echo ""
        echo "🎨 Step 2: Deploying Frontend..."
        vercel --prod
        echo "✅ Frontend deployment initiated!"
        ;;
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📝 Next steps:"
echo "1. Check deployment status in Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Update CORS in backend/server.js with your frontend URL"
echo "3. Test your deployed application"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
