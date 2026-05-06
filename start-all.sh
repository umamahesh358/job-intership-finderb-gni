#!/bin/bash
# Start backend
node src/server.js &
# Start frontend
cd client && npm run dev &
wait
