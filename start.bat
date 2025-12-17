@echo off
echo ====================================
echo    Starting CMMS Application
echo ====================================
echo.

REM Start backend in new window
echo Starting Backend Server...
start "CMMS Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

REM Start frontend in new window
echo Starting Frontend Server...
start "CMMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo    Servers Starting...
echo ====================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3000
echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak > nul

REM Open browser
start http://localhost:3000

echo.
echo ====================================
echo    CMMS Application Running!
echo ====================================
echo.
echo Close the backend and frontend windows to stop the servers
echo.
pause
