@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\jrwig\Documents\drill web app\sport-streak-academy"

REM Set git to not use an editor
set GIT_EDITOR=true
set GIT_SEQUENCE_EDITOR=true

REM Try to abort merge
git merge --abort 2>nul

REM Reset git
git reset --hard HEAD 2>nul

REM Fetch latest
git fetch origin 2>nul

REM Pull with rebase
git pull --rebase origin main

REM Push
git push origin main

echo Done!
pause
