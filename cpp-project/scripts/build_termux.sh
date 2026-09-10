#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== Android (Termux) 向け完全無料ビルドスクリプト ==="

# パッケージ更新と必要ツールの自動インストール
echo "[1/3] 必要なパッケージを確認中..."
pkg update -y
pkg install -y clang cmake make git ffmpeg python

# yt-dlp のインストール/更新
pip install --upgrade yt-dlp

echo "[2/3] CMake 構成作成中..."
cmake -B build -DCMAKE_BUILD_TYPE=Release

echo "[3/3] コンパイル中..."
cmake --build build --config Release -j$(nproc)

echo "=== ビルド完了 ==="
echo "実行ファイル: ./build/media_fetcher"
echo "テスト実行: ./build/media_fetcher --help"
