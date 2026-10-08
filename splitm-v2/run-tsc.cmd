@echo off
cd /d "c:\Users\DELL.ST\.gemini\antigravity-ide\scratch\SplitM\splitm-v2"
node node_modules\typescript\bin\tsc --noEmit > tsc-out.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> tsc-out.txt
