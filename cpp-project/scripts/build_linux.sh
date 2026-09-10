#!/bin/bash
set -e

echo "=== Linux (Debian/Ubuntu) 向けビルドスクリプト ==="

# 必要なパッケージの確認
echo "[1/3] 依存関係 (cmake, g++, ffmpeg, yt-dlp) のチェック..."
if ! command -v cmake &> /dev/null || ! command -v g++ &> /dev/null; then
    echo "ビルドツールが見つかりません。以下を実行してください:"
    echo "  sudo apt update && sudo apt install -y cmake build-essential ffmpeg python3-pip"
    echo "  pip install yt-dlp"
    exit 1
fi

# ビルド実行
echo "[2/3] CMake ビルド構成作成中..."
cmake -B build -DCMAKE_BUILD_TYPE=Release

echo "[3/3] コンパイル中..."
cmake --build build --config Release -j$(nproc)

echo "=== ビルド完了 ==="
echo "実行ファイル: ./build/media_fetcher"
echo "テスト実行: ./build/media_fetcher --help"
