# Nextzz YouTube Downloader

Nextzz Software が提供するYouTubeダウンローダーです。
用途に合わせて3つのバージョンが用意されています。

## ⚠️ 共通の必要ソフトウェア
どのバージョンを使う場合でも、以下のツールが実行環境にインストールされているか、同じフォルダに配置されている必要があります。
*   **yt-dlp**: ダウンロードエンジン
*   **FFmpeg**: 音声抽出・結合ツール

---

## 1. 🌐 Electron版 (Windows / Linux / macOS)
モダンなUIを備えたクロスプラットフォーム対応版です。

**使い方:**
1. `electron` フォルダをターミナル(コマンドプロンプト)で開きます。
2. Node.js がインストールされている環境で、以下を実行します。
   ```bash
   npm install
   npm start
   ```

---

## 2. 🖥️ Windows Native版 (C# GUI)
Electronなどの重いフレームワークを入れたくないWindowsユーザー向けの超軽量版です。

**使い方:**
1. `windows` フォルダを開きます。
2. フォルダ内に `yt-dlp.exe` と `ffmpeg.exe` を配置します。
3. `start_windows_gui.bat` をダブルクリックします。
4. Windows内蔵のコンパイラが自動でビルドし、アプリが起動します。

---

## 3. 🐧 Linux Native版 (Debian / Ubuntu)
PythonとPyQt6を使用したLinux向け軽量GUIです。

**使い方:**
1. `linux` フォルダをターミナルで開きます。
2. 以下のコマンドを実行してビルド＆インストールします。
   ```bash
   chmod +x build_deb.sh
   ./build_deb.sh
   sudo apt install -y ./nextzz-downloader_1.0.0_all.deb
   ```
3. `nextzz-downloader` コマンドで起動します。
