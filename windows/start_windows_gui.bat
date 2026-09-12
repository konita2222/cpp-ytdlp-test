@echo off
chcp 65001 >nul
title Nextzz YouTube Downloader Setup

cd /d "%~dp0"

echo [Nextzz Software] C# Native GUI コンパイル中...
echo ==================================================

set CSC_PATH=
for /d %%d in (%WINDIR%\Microsoft.NET\Framework\v4.*) do (
    if exist "%%d\csc.exe" set "CSC_PATH=%%d\csc.exe"
)

if "%CSC_PATH%"=="" (
    echo [エラー] C#コンパイラ (csc.exe) が見つかりません。
    pause
    exit /b
)

"%CSC_PATH%" /nologo /target:winexe /out:NextzzDownloader.exe Program.cs
if %ERRORLEVEL% NEQ 0 (
    echo [エラー] コンパイルに失敗しました。
    pause
    exit /b
)

echo.
echo [完了] NextzzDownloader.exe を作成しました。起動します...
start "" NextzzDownloader.exe
