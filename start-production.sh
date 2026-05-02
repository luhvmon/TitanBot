#!/bin/bash
set -e

echo "Starting TitanBot Discord Bot..."
node artifacts/discord-bot/src/app.js &
BOT_PID=$!

echo "Starting API Server..."
node --enable-source-maps artifacts/api-server/dist/index.mjs &
API_PID=$!

trap "kill $BOT_PID $API_PID 2>/dev/null; exit" SIGTERM SIGINT

wait $BOT_PID $API_PID
