@echo off
echo === Windows 向けビルドスクリプト (CMake + MSVC / MinGW) ===

where cmake >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [エラー] CMake が見つかりません。
    echo 公式サイト (https://cmake.org/download/) または winget install Kitware.CMake でインストールしてください。
    pause
    exit /b 1
)

echo [1/2] CMake プロジェクト生成中...
cmake -B build -DCMAKE_BUILD_TYPE=Release

if %ERRORLEVEL% NEQ 0 (
    echo [エラー] CMake の構成に失敗しました。
    pause
    exit /b 1
)

echo [2/2] コンパイル中...
cmake --build build --config Release

if %ERRORLEVEL% NEQ 0 (
    echo [エラー] ビルドに失敗しました。
    pause
    exit /b 1
)

echo.
echo === ビルド成功 ===
echo 実行ファイル: build\Release\media_fetcher.exe または build\media_fetcher.exe
echo テスト実行:
echo   .\build\Release\media_fetcher.exe --help
pause
