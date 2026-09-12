@echo off
title Nextzz YouTube Downloader Setup

cd /d "%~dp0"

echo [Nextzz Software] Compiling C# Native GUI...
echo ==================================================

set CSC_PATH=
for /d %%d in (%WINDIR%\Microsoft.NET\Framework\v4.*) do (
    if exist "%%d\csc.exe" set "CSC_PATH=%%d\csc.exe"
)

if "%CSC_PATH%"=="" (
    echo [ERROR] C# Compiler (csc.exe) not found.
    pause
    exit /b
)

echo Using compiler: %CSC_PATH%
"%CSC_PATH%" /nologo /target:winexe /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:NextzzDownloader.exe Program.cs

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b
)

echo.
echo [SUCCESS] NextzzDownloader.exe created. Starting app...
start "" NextzzDownloader.exe
