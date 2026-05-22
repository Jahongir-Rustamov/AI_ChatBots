#!/usr/bin/env bash
# Render start script for backend

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm run start:prod
