@echo off
cd /d "c:\Users\DELL.ST\.gemini\antigravity-ide\scratch\SplitM\splitm-v2"
call npm run build > build-out.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> build-out.txt
