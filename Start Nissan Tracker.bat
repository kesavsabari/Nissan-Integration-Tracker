@echo off
title Nissan Integration Tracker
echo.
echo  NISSAN Integration Tracker
echo  ---------------------------
echo  Starting server at http://localhost:5000
echo  Zero-Dependency Mode
echo  ---------------------------
echo  Press Ctrl+C in this window to stop
echo.
start "" "http://localhost:5000"
node server.js
pause
