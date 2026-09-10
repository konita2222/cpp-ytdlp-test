export interface ProjectFile {
  path: string;
  filename: string;
  category: 'cmake' | 'cpp' | 'header' | 'workflow' | 'script' | 'docs';
  description: string;
  content: string;
}

export const CPP_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'CMakeLists.txt',
    filename: 'CMakeLists.txt',
    category: 'cmake',
    description: 'クロスプラットフォーム統一ビルド構成 (nlohmann/json自動取得, Windows/Debian/Android対応)',
    content: `cmake_minimum_required(VERSION 3.20)
project(MediaFetcher VERSION 1.0.0 LANGUAGES CXX)

# C++17 標準を強制 (std::filesystem と文字列処理のため)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# リリースビルドの最適化設定
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Choose the type of build." FORCE)
endif()

# 依存ライブラリの自動取得: nlohmann/json (FetchContent を使用して完全自動化)
include(FetchContent)
FetchContent_Declare(
    nlohmann_json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(nlohmann_json)

# ソースファイル定義
set(SOURCES
    src/main.cpp
    src/media_extractor.cpp
    src/ffmpeg_runner.cpp
    src/platform_utils.cpp
)

set(HEADERS
    src/media_extractor.hpp
    src/ffmpeg_runner.hpp
    src/platform_utils.hpp
)

# 実行ファイルターゲット作成
add_executable(media_fetcher \${SOURCES} \${HEADERS})

# インクルードディレクトリ
target_include_directories(media_fetcher PRIVATE src)

# nlohmann_json ライブラリをリンク
target_link_libraries(media_fetcher PRIVATE nlohmann_json::nlohmann_json)

# プラットフォーム固有のコンパイル・リンク設定
if(WIN32)
    target_compile_definitions(media_fetcher PRIVATE OS_WINDOWS NOMINMAX UNICODE _UNICODE)
    target_link_libraries(media_fetcher PRIVATE ws2_32 shell32)
    if(MSVC)
        target_compile_options(media_fetcher PRIVATE /utf-8 /W4)
    else()
        target_compile_options(media_fetcher PRIVATE -Wall -Wextra)
    endif()
elseif(ANDROID)
    target_compile_definitions(media_fetcher PRIVATE OS_ANDROID)
    target_link_libraries(media_fetcher PRIVATE log)
    target_compile_options(media_fetcher PRIVATE -Wall -Wextra)
elseif(UNIX)
    # Linux (Debian/Ubuntu 等)
    target_compile_definitions(media_fetcher PRIVATE OS_LINUX)
    target_link_libraries(media_fetcher PRIVATE pthread dl)
    target_compile_options(media_fetcher PRIVATE -Wall -Wextra)
endif()

# インストール設定
install(TARGETS media_fetcher DESTINATION bin)`
  },
  {
    path: 'src/main.cpp',
    filename: 'main.cpp',
    category: 'cpp',
    description: 'メインCLIエントリポイント (引数解析、yt-dlp・FFmpegパイプライン実行)',
    content: `#include <iostream>
#include <string>
#include <vector>
#include <iomanip>
#include "platform_utils.hpp"
#include "media_extractor.hpp"
#include "ffmpeg_runner.hpp"

void printBanner() {
    std::cout << "========================================================\\n";
    std::cout << "  C++ Cross-Platform Media Downloader (yt-dlp & FFmpeg) \\n";
    std::cout << "  対応: YouTube / Bilibili | OS: " << PlatformUtils::getPlatformName() << "\\n";
    std::cout << "========================================================\\n" << std::endl;
}

void printHelp(const char* progName) {
    std::cout << "【使用方法】\\n";
    std::cout << "  " << progName << " <動画URL> [オプション]\\n\\n";
    std::cout << "【例】\\n";
    std::cout << "  # YouTube 動画のダウンロード (ファイル名: タイトル - 投稿者名.mp4)\\n";
    std::cout << "  " << progName << " \\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\\"\\n\\n";
    std::cout << "  # Bilibili 動画のダウンロード\\n";
    std::cout << "  " << progName << " \\"https://www.bilibili.com/video/BV1xx411c7mD\\"\\n\\n";
    std::cout << "【オプション】\\n";
    std::cout << "  --info-only        動画を保存せず、タイトルと投稿者名のみ取得・表示\\n";
    std::cout << "  --uploader-first   ファイル名の形式を「投稿者名 - タイトル.mp4」にする\\n";
    std::cout << "  --audio-only       音声のみ (m4a) で抽出して保存\\n";
    std::cout << "  --outdir <DIR>     動画の保存先フォルダを指定 (デフォルト: カレントディレクトリ)\\n";
    std::cout << "  --help, -h         このヘルプを表示\\n\\n";
}

int main(int argc, char* argv[]) {
    PlatformUtils::initializeConsole();
    printBanner();

    if (argc < 2) {
        printHelp(argv[0]);
        return 1;
    }

    std::string url = "";
    bool infoOnly = false;
    bool uploaderFirst = false;
    bool audioOnly = false;
    std::string outDir = ".";

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--help" || arg == "-h") {
            printHelp(argv[0]);
            return 0;
        } else if (arg == "--info-only") {
            infoOnly = true;
        } else if (arg == "--uploader-first") {
            uploaderFirst = true;
        } else if (arg == "--audio-only") {
            audioOnly = true;
        } else if (arg == "--outdir" && i + 1 < argc) {
            outDir = argv[++i];
        } else if (arg.rfind("-", 0) != 0 && url.empty()) {
            url = arg;
        }
    }

    if (url.empty()) {
        std::cerr << "[エラー] 動画URLが指定されていません。\\n";
        printHelp(argv[0]);
        return 1;
    }

    // 1. 依存ツールの確認
    std::cout << "[ステップ 1/3] 実行環境とツールのチェック..." << std::endl;
    auto deps = FFmpegRunner::checkDependencies();
    std::cout << "  - yt-dlp: " << (deps.hasYtDlp ? ("OK (" + deps.ytDlpVersion + ")") : "未検出 (ダウンロードに必須です)") << std::endl;
    std::cout << "  - FFmpeg: " << (deps.hasFFmpeg ? ("OK (" + deps.ffmpegVersion + ")") : "未検出 (推奨: 高画質マージに必要)") << std::endl;

    if (!deps.hasYtDlp) {
        std::cerr << "\\n[エラー] yt-dlp が見つかりません。以下を実行してインストールしてください:\\n";
        std::cerr << "  - Debian/Ubuntu: sudo apt install python3-pip && pip install -U yt-dlp\\n";
        std::cerr << "  - Windows: winget install yt-dlp または choco install yt-dlp\\n";
        std::cerr << "  - Android (Termux): pkg install python && pip install -U yt-dlp\\n";
        return 1;
    }

    // 2. メタデータ (タイトル・投稿者名) の取得
    std::cout << "\\n[ステップ 2/3] メタデータを取得中 (URL: " << url << ")..." << std::endl;
    MediaExtractor::VideoMetadata meta;
    std::string errorMsg;
    bool success = MediaExtractor::fetchMetadata(url, meta, errorMsg);

    if (!success) {
        std::cerr << "[エラー] メタデータの取得に失敗しました:\\n  " << errorMsg << std::endl;
        return 1;
    }

    std::string ext = audioOnly ? "m4a" : "mp4";
    std::string formattedFilename = MediaExtractor::generateFormattedFilename(meta, ext, uploaderFirst);

    std::cout << "--------------------------------------------------------\\n";
    std::cout << "  プラットフォーム : " << meta.platform << "\\n";
    std::cout << "  動画タイトル     : " << meta.title << "\\n";
    std::cout << "  投稿者名         : " << meta.uploader << "\\n";
    if (!meta.durationString.empty()) {
        std::cout << "  再生時間         : " << meta.durationString << "\\n";
    }
    std::cout << "  生成ファイル名   : " << formattedFilename << "\\n";
    std::cout << "--------------------------------------------------------\\n" << std::endl;

    if (infoOnly) {
        std::cout << "[完了] --info-only が指定されたため、ダウンロードを行わずに終了します。" << std::endl;
        return 0;
    }

    // 3. ダウンロード & FFmpeg マージ実行
    std::cout << "[ステップ 3/3] 動画のダウンロードとマージを開始します..." << std::endl;
    bool dlSuccess = FFmpegRunner::downloadVideoWithFFmpeg(
        url,
        outDir,
        formattedFilename,
        audioOnly,
        errorMsg
    );

    if (!dlSuccess) {
        std::cerr << "\\n[エラー] ダウンロード処理に失敗しました:\\n  " << errorMsg << std::endl;
        return 1;
    }

    std::cout << "\\n[成功] すべての処理が正常に完了しました！" << std::endl;
    return 0;
}`
  },
  {
    path: 'src/media_extractor.hpp',
    filename: 'media_extractor.hpp',
    category: 'header',
    description: 'メタデータ抽出・サニタイズ定義ヘッダー',
    content: `#pragma once

#include <string>

namespace MediaExtractor {

struct VideoMetadata {
    std::string title;           // 動画タイトル
    std::string uploader;        // 投稿者名 (チャンネル名 / 配信者名)
    std::string id;              // 動画ID
    std::string platform;        // "YouTube", "Bilibili", "Other"
    std::string originalUrl;     // 入力されたURL
    std::string durationString;  // 再生時間 (HH:MM:SS)
};

std::string detectPlatform(const std::string& url);
bool fetchMetadata(const std::string& url, VideoMetadata& outMeta, std::string& errorMsg);
std::string sanitizeFilename(const std::string& rawText);
std::string generateFormattedFilename(
    const VideoMetadata& meta,
    const std::string& extension = "mp4",
    bool uploaderFirst = false
);

} // namespace MediaExtractor`
  },
  {
    path: 'src/media_extractor.cpp',
    filename: 'media_extractor.cpp',
    category: 'cpp',
    description: 'yt-dlp JSONメタデータ取得とファイル名サニタイズ実装',
    content: `#include "media_extractor.hpp"
#include "platform_utils.hpp"
#include <nlohmann/json.hpp>
#include <iostream>
#include <regex>
#include <sstream>
#include <algorithm>

namespace MediaExtractor {

std::string detectPlatform(const std::string& url) {
    if (url.find("youtube.com") != std::string::npos ||
        url.find("youtu.be") != std::string::npos) {
        return "YouTube";
    }
    if (url.find("bilibili.com") != std::string::npos ||
        url.find("b23.tv") != std::string::npos) {
        return "Bilibili";
    }
    return "Unsupported";
}

bool fetchMetadata(const std::string& url, VideoMetadata& outMeta, std::string& errorMsg) {
    outMeta.originalUrl = url;
    outMeta.platform = detectPlatform(url);

    if (outMeta.platform == "Unsupported") {
        errorMsg = "対応していないURL形式です。YouTubeまたはBilibiliのURLを指定してください。";
        return false;
    }

    if (!PlatformUtils::isCommandAvailable("yt-dlp")) {
        errorMsg = "yt-dlp が見つかりません。システムにインストールしてPATHを通してください。";
        return false;
    }

    std::string cmd = "yt-dlp --dump-single-json --no-warnings --no-playlist \\"" + url + "\\"";

    int exitCode = 0;
    std::string jsonOutput = PlatformUtils::executeCommand(cmd, &exitCode);

    if (exitCode != 0 || jsonOutput.empty()) {
        errorMsg = "yt-dlp で動画情報の取得に失敗しました (exit code: " + std::to_string(exitCode) + ")";
        return false;
    }

    try {
        nlohmann::json j = nlohmann::json::parse(jsonOutput);

        if (j.contains("title") && !j["title"].is_null()) {
            outMeta.title = j["title"].get<std::string>();
        } else if (j.contains("fulltitle") && !j["fulltitle"].is_null()) {
            outMeta.title = j["fulltitle"].get<std::string>();
        } else {
            outMeta.title = "Unknown_Title";
        }

        if (j.contains("uploader") && !j["uploader"].is_null() && !j["uploader"].get<std::string>().empty()) {
            outMeta.uploader = j["uploader"].get<std::string>();
        } else if (j.contains("channel") && !j["channel"].is_null() && !j["channel"].get<std::string>().empty()) {
            outMeta.uploader = j["channel"].get<std::string>();
        } else if (j.contains("creator") && !j["creator"].is_null() && !j["creator"].get<std::string>().empty()) {
            outMeta.uploader = j["creator"].get<std::string>();
        } else if (j.contains("uploader_id") && !j["uploader_id"].is_null()) {
            outMeta.uploader = j["uploader_id"].get<std::string>();
        } else {
            outMeta.uploader = "Unknown_Uploader";
        }

        if (j.contains("id") && !j["id"].is_null()) {
            outMeta.id = j["id"].get<std::string>();
        }

        if (j.contains("duration_string") && !j["duration_string"].is_null()) {
            outMeta.durationString = j["duration_string"].get<std::string>();
        }

        return true;
    } catch (const std::exception& e) {
        errorMsg = std::string("JSONの解析中にエラーが発生しました: ") + e.what();
        return false;
    }
}

std::string sanitizeFilename(const std::string& rawText) {
    if (rawText.empty()) {
        return "Unnamed";
    }

    std::string sanitized = rawText;
    const std::string forbiddenChars = "\\\\/:*?\\"<>|";

    for (char& c : sanitized) {
        unsigned char uc = static_cast<unsigned char>(c);
        if (uc < 32 || forbiddenChars.find(c) != std::string::npos) {
            c = '_';
        }
    }

    std::string clean;
    bool lastWasSpaceOrUnderscore = false;
    for (char c : sanitized) {
        if (c == ' ' || c == '_') {
            if (!lastWasSpaceOrUnderscore) {
                clean += c;
                lastWasSpaceOrUnderscore = true;
            }
        } else {
            clean += c;
            lastWasSpaceOrUnderscore = false;
        }
    }

    size_t start = clean.find_first_not_of(" ._");
    size_t end = clean.find_last_not_of(" ._");

    if (start == std::string::npos) {
        return "Untitled";
    }

    clean = clean.substr(start, end - start + 1);

    if (clean.length() > 150) {
        clean = clean.substr(0, 150);
    }

    return clean;
}

std::string generateFormattedFilename(
    const VideoMetadata& meta,
    const std::string& extension,
    bool uploaderFirst
) {
    std::string cleanTitle = sanitizeFilename(meta.title);
    std::string cleanUploader = sanitizeFilename(meta.uploader);

    std::string filename;
    if (uploaderFirst) {
        filename = cleanUploader + " - " + cleanTitle;
    } else {
        filename = cleanTitle + " - " + cleanUploader;
    }

    if (!extension.empty()) {
        filename += "." + extension;
    }

    return filename;
}

} // namespace MediaExtractor`
  },
  {
    path: 'src/ffmpeg_runner.hpp',
    filename: 'ffmpeg_runner.hpp',
    category: 'header',
    description: 'FFmpeg & yt-dlp 連携処理ヘッダー',
    content: `#pragma once

#include <string>
#include <filesystem>

namespace FFmpegRunner {

struct DependencyStatus {
    bool hasYtDlp = false;
    bool hasFFmpeg = false;
    std::string ytDlpVersion;
    std::string ffmpegVersion;
};

DependencyStatus checkDependencies();

bool downloadVideoWithFFmpeg(
    const std::string& url,
    const std::string& outputDirectory,
    const std::string& formattedFilename,
    bool audioOnly,
    std::string& errorMsg
);

} // namespace FFmpegRunner`
  },
  {
    path: 'src/ffmpeg_runner.cpp',
    filename: 'ffmpeg_runner.cpp',
    category: 'cpp',
    description: 'FFmpegとyt-dlpの自動検出・最高画質マージダウンロード実装',
    content: `#include "ffmpeg_runner.hpp"
#include "platform_utils.hpp"
#include <iostream>
#include <cstdlib>

namespace FFmpegRunner {

DependencyStatus checkDependencies() {
    DependencyStatus status;
    status.hasYtDlp = PlatformUtils::isCommandAvailable("yt-dlp");
    status.hasFFmpeg = PlatformUtils::isCommandAvailable("ffmpeg");

    if (status.hasYtDlp) {
        int code = 0;
        std::string out = PlatformUtils::executeCommand("yt-dlp --version", &code);
        if (code == 0 && !out.empty()) {
            while (!out.empty() && (out.back() == '\\n' || out.back() == '\\r')) {
                out.pop_back();
            }
            status.ytDlpVersion = out;
        }
    }

    if (status.hasFFmpeg) {
        int code = 0;
        std::string out = PlatformUtils::executeCommand("ffmpeg -version", &code);
        if (code == 0 && !out.empty()) {
            size_t newlinePos = out.find('\\n');
            if (newlinePos != std::string::npos) {
                out = out.substr(0, newlinePos);
            }
            status.ffmpegVersion = out;
        }
    }

    return status;
}

bool downloadVideoWithFFmpeg(
    const std::string& url,
    const std::string& outputDirectory,
    const std::string& formattedFilename,
    bool audioOnly,
    std::string& errorMsg
) {
    auto deps = checkDependencies();
    if (!deps.hasYtDlp) {
        errorMsg = "yt-dlp が見つかりません。";
        return false;
    }

    std::filesystem::path outDir(outputDirectory.empty() ? "." : outputDirectory);
    if (!std::filesystem::exists(outDir)) {
        std::error_code ec;
        std::filesystem::create_directories(outDir, ec);
        if (ec) {
            errorMsg = "保存先フォルダを作成できませんでした: " + ec.message();
            return false;
        }
    }

    std::filesystem::path fullOutputPath = outDir / formattedFilename;
    std::string fullOutPathStr = fullOutputPath.string();

    std::cout << "[ダウンロード開始] URL: " << url << std::endl;
    std::cout << "[保存先ファイル名] " << fullOutPathStr << std::endl;

    std::string cmd;
    if (audioOnly) {
        cmd = "yt-dlp -x --audio-format m4a --audio-quality 0 ";
        if (deps.hasFFmpeg) {
            cmd += "--prefer-ffmpeg ";
        }
        cmd += "-o \\"" + fullOutPathStr + "\\" \\"" + url + "\\"";
    } else {
        cmd = "yt-dlp -f \\"bestvideo+bestaudio/best\\" --merge-output-format mp4 ";
        if (deps.hasFFmpeg) {
            cmd += "--prefer-ffmpeg ";
        }
        cmd += "-o \\"" + fullOutPathStr + "\\" \\"" + url + "\\"";
    }

    std::cout << "[実行コマンド] " << cmd << std::endl;
    int ret = std::system(cmd.c_str());

    if (ret != 0) {
        errorMsg = "ダウンロードまたはFFmpegマージ処理が失敗しました (終了コード: " + std::to_string(ret) + ")";
        return false;
    }

    std::cout << "[完了] 正常に保存されました: " << fullOutPathStr << std::endl;
    return true;
}

} // namespace FFmpegRunner`
  },
  {
    path: 'src/platform_utils.hpp',
    filename: 'platform_utils.hpp',
    category: 'header',
    description: 'クロスプラットフォームOS判別・コマンド実行ヘッダー',
    content: `#pragma once

#include <string>
#include <vector>

namespace PlatformUtils {

void initializeConsole();
std::string executeCommand(const std::string& command, int* exitCode = nullptr);
bool isCommandAvailable(const std::string& executableName);
std::string getPlatformName();

} // namespace PlatformUtils`
  },
  {
    path: 'src/platform_utils.cpp',
    filename: 'platform_utils.cpp',
    category: 'cpp',
    description: 'Windows UTF-8設定、Linux/Android popen安全プロセス実行実装',
    content: `#include "platform_utils.hpp"
#include <iostream>
#include <array>
#include <memory>
#include <cstdlib>

#if defined(_WIN32) || defined(OS_WINDOWS)
    #include <windows.h>
    #define POPEN_FUNC _popen
    #define PCLOSE_FUNC _pclose
#else
    #include <unistd.h>
    #define POPEN_FUNC popen
    #define PCLOSE_FUNC pclose
#endif

namespace PlatformUtils {

void initializeConsole() {
#if defined(_WIN32) || defined(OS_WINDOWS)
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);

    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hOut != INVALID_HANDLE_VALUE) {
        DWORD dwMode = 0;
        if (GetConsoleMode(hOut, &dwMode)) {
            dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
            SetConsoleMode(hOut, dwMode);
        }
    }
#endif
}

std::string executeCommand(const std::string& command, int* exitCode) {
    std::string result;
    std::array<char, 512> buffer;

    FILE* pipe = POPEN_FUNC(command.c_str(), "r");
    if (!pipe) {
        if (exitCode) *exitCode = -1;
        return "";
    }

    while (fgets(buffer.data(), static_cast<int>(buffer.size()), pipe) != nullptr) {
        result += buffer.data();
    }

    int status = PCLOSE_FUNC(pipe);
    if (exitCode) {
#if defined(_WIN32) || defined(OS_WINDOWS)
        *exitCode = status;
#else
        if (WIFEXITED(status)) {
            *exitCode = WEXITSTATUS(status);
        } else {
            *exitCode = status;
        }
#endif
    }

    return result;
}

bool isCommandAvailable(const std::string& executableName) {
    int code = 0;
#if defined(_WIN32) || defined(OS_WINDOWS)
    std::string checkCmd = "where " + executableName + " >nul 2>&1";
#else
    std::string checkCmd = "command -v " + executableName + " >/dev/null 2>&1";
#endif
    executeCommand(checkCmd, &code);
    return (code == 0);
}

std::string getPlatformName() {
#if defined(OS_ANDROID) || defined(__ANDROID__)
    return "Android (Termux / NDK)";
#elif defined(_WIN32) || defined(OS_WINDOWS)
    return "Windows (x86_64)";
#elif defined(__linux__) || defined(OS_LINUX)
    return "Linux (Debian / Ubuntu)";
#else
    return "Unix-like";
#endif
}

} // namespace PlatformUtils`
  },
  {
    path: '.github/workflows/build.yml',
    filename: 'build.yml',
    category: 'workflow',
    description: 'GitHub Actions 自動ビルドCI/CD (Windows / Linux / Android NDK)',
    content: `name: Build Cross-Platform Binaries

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          sudo apt-get update
          sudo apt-get install -y cmake build-essential ffmpeg python3-pip
          pip3 install --upgrade yt-dlp
      - run: cmake -B build -DCMAKE_BUILD_TYPE=Release
      - run: cmake --build build --config Release -j$(nproc)
      - uses: actions/upload-artifact@v4
        with:
          name: media_fetcher-linux-x86_64
          path: build/media_fetcher

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ilammy/msvc-dev-cmd@v1
      - run: cmake -B build -DCMAKE_BUILD_TYPE=Release
      - run: cmake --build build --config Release
      - uses: actions/upload-artifact@v4
        with:
          name: media_fetcher-windows-x64
          path: build/Release/media_fetcher.exe

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: nttld/setup-ndk@v1
        with:
          ndk-version: r26b
          add-to-path: true
      - run: |
          cmake -B build-android \\
            -DCMAKE_SYSTEM_NAME=Android \\
            -DCMAKE_SYSTEM_VERSION=24 \\
            -DCMAKE_ANDROID_ARCH_ABI=arm64-v8a \\
            -DCMAKE_ANDROID_NDK=$ANDROID_NDK_ROOT \\
            -DCMAKE_BUILD_TYPE=Release
      - run: cmake --build build-android --config Release -j$(nproc)
      - uses: actions/upload-artifact@v4
        with:
          name: media_fetcher-android-arm64
          path: build-android/media_fetcher`
  },
  {
    path: 'scripts/build_linux.sh',
    filename: 'build_linux.sh',
    category: 'script',
    description: 'Linux (Debian/Ubuntu) 向けワンクリックビルドシェル',
    content: `#!/bin/bash
set -e
echo "=== Linux (Debian/Ubuntu) 向けビルドスクリプト ==="
sudo apt update && sudo apt install -y cmake build-essential ffmpeg python3-pip git
pip3 install --upgrade yt-dlp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(nproc)
echo "完了: ./build/media_fetcher"`
  },
  {
    path: 'scripts/build_windows.bat',
    filename: 'build_windows.bat',
    category: 'script',
    description: 'Windows 向けダブルクリックビルドバッチ',
    content: `@echo off
echo === Windows 向けビルドスクリプト (CMake + MSVC) ===
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
echo.
echo 実行ファイル: build\\Release\\media_fetcher.exe
pause`
  },
  {
    path: 'scripts/build_termux.sh',
    filename: 'build_termux.sh',
    category: 'script',
    description: 'Android (Termux) 向け完全無料ビルドスクリプト',
    content: `#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "=== Android (Termux) 向けビルドスクリプト ==="
pkg update -y
pkg install -y clang cmake make git ffmpeg python
pip install --upgrade yt-dlp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(nproc)
echo "完了: ./build/media_fetcher"`
  },
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'docs',
    description: '初心者向け完全導入解説マニュアル',
    content: `# C++ Cross-Platform Media Downloader (yt-dlp + FFmpeg)

YouTube および Bilibili の動画URLから「動画タイトル」と「投稿者名」を取得し、
「タイトル - 投稿者名.mp4」として自動保存するC++製ダウンローダーです。

## 主な特徴
- YouTube & Bilibili 両対応
- Windows / Debian Linux / Android (Termux) クロスプラットフォーム
- CMakeによる統一ビルド (nlohmann/json 自動取得)
- GitHub Actions によるクラウド自動コンパイル対応`
  },
  {
    path: 'windows_gui.cs',
    filename: 'windows_gui.cs',
    category: 'cpp',
    description: 'Windows専用: C# WinFormsによる単一EXEのGUIダウンローダー',
    content: `using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace YtDlpWrapper
{
    public class MainForm : Form
    {
        private TextBox txtUrl;
        private Button btnDownload;
        private TextBox txtLog;
        private Label lblStatus;

        public MainForm()
        {
            this.Text = "Cyberpunk Video Downloader (GUI)";
            this.Size = new Size(800, 600);
            this.BackColor = Color.FromArgb(9, 9, 11);
            this.ForeColor = Color.FromArgb(34, 211, 238);
            this.Font = new Font("Consolas", 10F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            this.StartPosition = FormStartPosition.CenterScreen;

            Label lblTitle = new Label() { Text = "VIDEO URL:", Location = new Point(20, 25), AutoSize = true, ForeColor = Color.FromArgb(217, 70, 239) };
            this.Controls.Add(lblTitle);

            txtUrl = new TextBox() { Location = new Point(120, 20), Width = 500, BackColor = Color.FromArgb(20, 20, 25), ForeColor = Color.White, BorderStyle = BorderStyle.FixedSingle };
            this.Controls.Add(txtUrl);

            btnDownload = new Button() { Text = "DOWNLOAD", Location = new Point(630, 18), Width = 130, Height = 30, BackColor = Color.FromArgb(250, 204, 21), ForeColor = Color.Black, FlatStyle = FlatStyle.Flat };
            btnDownload.FlatAppearance.BorderSize = 0;
            btnDownload.Cursor = Cursors.Hand;
            btnDownload.Click += BtnDownload_Click;
            this.Controls.Add(btnDownload);

            txtLog = new TextBox() { Location = new Point(20, 70), Width = 740, Height = 430, Multiline = true, ScrollBars = ScrollBars.Vertical, ReadOnly = true, BackColor = Color.FromArgb(15, 15, 20), ForeColor = Color.FromArgb(168, 85, 247), BorderStyle = BorderStyle.FixedSingle };
            this.Controls.Add(txtLog);

            lblStatus = new Label() { Text = "準備完了。同じフォルダに yt-dlp.exe と ffmpeg.exe を置いてください。", Location = new Point(20, 520), AutoSize = true, ForeColor = Color.Gray };
            this.Controls.Add(lblStatus);
        }

        private void BtnDownload_Click(object sender, EventArgs e)
        {
            string url = txtUrl.Text.Trim();
            if (string.IsNullOrEmpty(url)) { MessageBox.Show("URLを入力してください。"); return; }

            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string ytdlpPath = Path.Combine(basePath, "yt-dlp.exe");
            string ffmpegPath = Path.Combine(basePath, "ffmpeg.exe");

            if (!File.Exists(ytdlpPath))
            {
                Log("エラー: yt-dlp.exe が同じフォルダに見つかりません。");
                return;
            }
            if (!File.Exists(ffmpegPath))
            {
                Log("警告: ffmpeg.exe が見つかりません。最高画質での結合に失敗する可能性があります。");
            }

            Log("=========================================");
            Log("ダウンロード開始: " + url);
            btnDownload.Enabled = false;

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = ytdlpPath;
            psi.Arguments = $"-f \\"bv*+ba/b\\" --merge-output-format mp4 --ffmpeg-location \\"{basePath.TrimEnd('\\\\')}\\" -o \\"%(title)s - %(uploader)s.%(ext)s\\" \\"{url}\\"";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.StandardOutputEncoding = System.Text.Encoding.UTF8;
            psi.StandardErrorEncoding = System.Text.Encoding.UTF8;

            Process proc = new Process();
            proc.StartInfo = psi;
            proc.OutputDataReceived += (s, ev) => { if (ev.Data != null) Invoke(new Action(() => Log(ev.Data))); };
            proc.ErrorDataReceived += (s, ev) => { if (ev.Data != null) Invoke(new Action(() => Log(ev.Data))); };
            proc.EnableRaisingEvents = true;
            proc.Exited += (s, ev) => { Invoke(new Action(() => { Log("完了しました。"); btnDownload.Enabled = true; })); };

            proc.Start();
            proc.BeginOutputReadLine();
            proc.BeginErrorReadLine();
        }

        private void Log(string msg)
        {
            txtLog.AppendText(msg + Environment.NewLine);
            txtLog.SelectionStart = txtLog.Text.Length;
            txtLog.ScrollToCaret();
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.Run(new MainForm());
        }
    }
}
`
  },
  {
    path: 'start_windows_gui.bat',
    filename: 'start_windows_gui.bat',
    category: 'script',
    description: 'Windows専用: GUIプログラムの自動コンパイル＆起動バッチ',
    content: `@echo off
chcp 65001 >nul
echo ------------------------------------------
echo CYBERPUNK DOWNLOADER GUI BUILDER
echo ------------------------------------------

set CSC_PATH=%WINDIR%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe
if not exist "%CSC_PATH%" (
    echo [ERROR] C# コンパイラが見つかりません。
    pause
    exit /b
)

if not exist "CyberDownloaderGUI.exe" (
    echo GUIプログラムをコンパイル中...
    "%CSC_PATH%" /nologo /target:winexe /out:CyberDownloaderGUI.exe windows_gui.cs
    if errorlevel 1 (
        echo コンパイルに失敗しました。
        pause
        exit /b
    )
    echo コンパイル成功！
)

echo GUIを起動しています...
start CyberDownloaderGUI.exe
`
  }
];
