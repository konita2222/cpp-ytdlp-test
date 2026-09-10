# C++ Cross-Platform Media Downloader (yt-dlp + FFmpeg)

YouTube および Bilibili の動画URLから「動画タイトル」と「投稿者名」を取得し、
`タイトル - 投稿者名.mp4` という命名規則で自動保存する、完全無料・オープンソースのC++製ダウンローダーです。

Windows、Linux (Debian / Ubuntu)、Android (Termux) のマルチプラットフォーム対応で、CMakeにより統一されたビルド環境を提供します。

---

## 🌟 主な特徴

1. **自動タイトル・投稿者名抽出 & 命名**
   - 動画のメタデータを取得し、`タイトル - 投稿者名.mp4` に自動整形して保存します。
   - オプション指定で `投稿者名 - タイトル.mp4` に並び替えることも可能です。
2. **YouTube & Bilibili 両対応**
   - YouTube (`youtube.com`, `youtu.be`, Shorts)
   - Bilibili (`bilibili.com/video/BV...`, `b23.tv`)
3. **安全なファイル名サニタイズ**
   - Windows や Android、Linux でファイル名に使えない禁止文字 (`\ / : * ? " < > |`) や制御文字を自動置換。
4. **クロスプラットフォーム & CMake統一設計**
   - Windows (MSVC / MinGW)
   - Linux (Debian / Ubuntu / etc.)
   - Android (Termux 上での直接ビルド、または Android NDK クロスコンパイル)
5. **完全無料・外部ライブラリ自動取得**
   - JSONパースライブラリ (`nlohmann/json`) は CMake の `FetchContent` 機能により、ビルド時に自動ダウンロードされます。手動での面倒なライブラリ導入は一切不要です。
6. **GitHub Actions 自動ビルド対応**
   - GitHub にプッシュするだけで、クラウド上で自動的に Windows 用 `.exe`、Linux 用バイナリ、Android 用バイナリがコンパイルされ、いつでもダウンロードできます。

---

## 📋 必要な前提ソフトウェア（すべて無料・オープンソース）

本プログラムを実行するには、システムに **yt-dlp** と **FFmpeg** が必要です。

| ツール | 用途 | 入手元 |
|---|---|---|
| **CMake** (3.20以上) | ビルド構成の自動生成 | [cmake.org](https://cmake.org/) または各OSのパッケージマネージャ |
| **C++ コンパイラ** (C++17対応) | C++のコンパイル | MSVC (Visual Studio Build Tools), GCC, Clang |
| **yt-dlp** | メタデータ取得およびストリーム取得 | [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) |
| **FFmpeg** | 映像と音声の最高画質マージ | [ffmpeg.org](https://ffmpeg.org/) |

---

## 🚀 各OSでのビルド & 実行手順（初心者向けステップ）

### 1. Linux (Debian / Ubuntu)

ターミナルを開き、以下のコマンドを順番に実行します。

```bash
# 1. 必要なツールをすべてインストール (完全無料)
sudo apt update
sudo apt install -y cmake build-essential ffmpeg python3-pip git
pip3 install --upgrade yt-dlp

# 2. リポジトリのビルド
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(nproc)

# 3. 実行
./build/media_fetcher "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

---

### 2. Windows 11 / 10

Windows では、Visual Studio Community（無料）または Build Tools、および Git / Python を使います。

```powershell
# 1. winget (Windows標準パッケージマネージャ) で一括インストール
winget install Kitware.CMake
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
winget install Microsoft.VisualStudio.2022.BuildTools

# 2. PowerShell または コマンドプロンプトでビルド
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release

# 3. 実行
.\build\Release\media_fetcher.exe "https://www.bilibili.com/video/BV1xx411c7mD"
```
※ `scripts\build_windows.bat` をダブルクリックするだけでも自動ビルド可能です。

---

### 3. Android (Termux)

Android スマートフォンやタブレットでは、Google Play版ではなく **F-Droid** からインストールした **Termux** アプリを使用します。

```bash
# 1. Termux 内で必要なパッケージを導入
pkg update -y
pkg install -y clang cmake make git ffmpeg python
pip install --upgrade yt-dlp

# 2. ストレージアクセスの許可 (ダウンロードフォルダに保存するため)
termux-setup-storage

# 3. ビルド
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(nproc)

# 4. ダウンロードフォルダへ保存
./build/media_fetcher "https://www.youtube.com/watch?v=..." --outdir ~/storage/downloads
```
※ `scripts/build_termux.sh` を実行しても一括でセットアップとビルドが完了します。

---

### 4. GitHub Actions での自動ビルド（PCに開発環境がない場合）

自分の GitHub アカウントにこのリポジトリを push すると、`.github/workflows/build.yml` が自動起動します。
1. GitHub リポジトリの **Actions** タブを開きます。
2. 実行完了したワークフローをクリックします。
3. **Artifacts** から、コンパイル済みの実行ファイル (`.exe` や Linux バイナリ) を直接ダウンロードできます。ローカルPCにコンパイラをインストールする必要すらありません！

---

## 💻 コマンドラインオプション

```
【使用方法】
  media_fetcher <動画URL> [オプション]

【オプション】
  --info-only        動画本体をダウンロードせず、タイトルと投稿者名のみ表示
  --uploader-first   ファイル名を「投稿者名 - タイトル.mp4」にする
  --audio-only       映像を省き音声のみ (m4a) で抽出して保存
  --outdir <DIR>     動画の保存先フォルダを指定 (デフォルト: カレントディレクトリ)
  --help, -h         ヘルプを表示
```

---

## 🛠️ なぜ yt-dlp と FFmpeg の両方が必要なのか？

YouTube や Bilibili では、高画質（1080p, 4K等）の動画は**「映像のみのストリーム」と「音声のみのストリーム」が完全に分離して配信**されています。
- `yt-dlp` が最高画質の映像と最高音質の音声をそれぞれ読み込みます。
- `ffmpeg` がそれら2つのストリームを劣化なし（ロスレス）で1つの `.mp4` ファイルへマージ（合体）します。
本プログラムはこれらをC++から安全・確実に制御し、指定通りの美しいファイル名に仕上げます。
