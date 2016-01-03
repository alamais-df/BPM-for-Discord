@echo off

echo Downloading Node...

bitsadmin.exe /transfer "BPMInstaller" http://nodejs.org/dist/v4.2.4/win-x86/node.exe "%cd%\node.exe"

echo Node downloaded, installing addon...

node.exe index.js

echo Install complete, removing node binary...

del node.exe

echo Done!

