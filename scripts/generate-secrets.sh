#!/bin/bash

# Script to generate strong secrets for production deployment
# Run this script and copy the output to your production .env file

echo "================================================"
echo "🔐 Production Secrets Generator"
echo "================================================"
echo ""
echo "⚠️  IMPORTANT: Keep these secrets secure!"
echo "   - Never commit them to git"
echo "   - Store them in your deployment platform's secret manager"
echo "   - Use different secrets for each environment"
echo ""
echo "================================================"
echo ""

echo "# Copy these values to your production .env file:"
echo ""

echo "# JWT Secret (for token signing)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo ""

echo "# Session Secret (for session encryption)"
echo "SESSION_SECRET=$(openssl rand -base64 48)"
echo ""

echo "# CSRF Secret (for CSRF token generation)"
echo "CSRF_SECRET=$(openssl rand -base64 48)"
echo ""

echo "================================================"
echo "✅ Secrets generated successfully!"
echo ""
echo "Next steps:"
echo "1. Copy the secrets above to your production environment"
echo "2. Set NODE_ENV=production"
echo "3. Configure your production DATABASE_URL"
echo "4. Review all other environment variables"
echo "================================================"
