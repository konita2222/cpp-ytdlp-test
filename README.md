# Nextzz YouTube Downloader

Nextzz Software が提供する軽量なYouTubeダウンローダーです。
Windows (C#) および Linux (PyQt) に対応しています。

## ⚠️ 必要なソフトウェア
本ツールを実行するには、以下の外部ツールがシステムに存在するか、実行ファイルと同じフォルダに配置されている必要があります。
*   **yt-dlp**: 動画ダウンロードエンジン本体
*   **FFmpeg**: 音声抽出や動画・音声の結合に必要

## 🖥️ Windows版の使い方 (GUI)
C# のネイティブGUIで動作します。外部の重いフレームワークは不要です。

1. `windows` フォルダを開きます。
2. インターネットから `yt-dlp.exe` と `ffmpeg.exe` をダウンロードし、`windows` フォルダ内に配置します。
3. `start_windows_gui.bat` をダブルクリックします。
4. Windowsに標準搭載されているコンパイラ (csc.exe) が自動で `Program.cs` をコンパイルし、アプリが起動します。
5. URLと画質・音質を指定し、ダウンロードを開始してください。

## 🐧 Linux版の使い方 (Debian / Ubuntu)
Python + PyQt6 を使用した軽量なGUIで動作します。

1. `linux` フォルダを開き、ターミナルを起動します。
2. 以下のコマンドでビルドスクリプトを実行します。
   ```bash
   chmod +x build_deb.sh
   ./build_deb.sh
   ```
3. 生成された `.deb` ファイルをインストールします。依存関係 (`yt-dlp`, `ffmpeg`, `python3-pyqt6`) も自動で解決・インストールされます。
   ```bash
   sudo apt install -y ./nextzz-downloader_1.0.0_all.deb
   ```
4. アプリケーションメニューから「Nextzz YouTube Downloader」を起動するか、ターミナルで `nextzz-downloader` と入力して起動します。

## 🎨 デザインテーマ
*   **Main**: Blue (`#2563EB`)
*   **Base**: Purple (`#120B24`)
*   **Sub**: Green (`#10B981`)
