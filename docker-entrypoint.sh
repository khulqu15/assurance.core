#!/bin/sh
set -e

echo "Starting runtime initialization..."

mkdir -p /data
mkdir -p /data/uploads

echo "Running migrations..."
npm run migration:run:prod

echo "Running seed..."
npm run seed:run:prod

echo "Starting NestJS..."
npm run start:prod