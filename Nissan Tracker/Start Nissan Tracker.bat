@echo off
title Nissan Integration Tracker
echo.
echo  NISSAN Integration Tracker
echo  ---------------------------
echo  Starting server at http://localhost:5001
echo  Starting Auto-Sync Utility...
echo  Zero-Dependency Mode
echo  ---------------------------
echo  Press Ctrl+C in this window to stop
echo.
start "Nissan Sync" node sync.js
start "" "http://localhost:5001"
node server.js
pause
