#include <iostream>
#include <string>
#include <vector>
#include <iomanip>
#include "platform_utils.hpp"
#include "media_extractor.hpp"
#include "ffmpeg_runner.hpp"

void printBanner() {
    std::cout << "========================================================\n";
    std::cout << "  C++ Cross-Platform Media Downloader (yt-dlp & FFmpeg) \n";
    std::cout << "  対応: YouTube / Bilibili | OS: " << PlatformUtils::getPlatformName() << "\n";
    std::cout << "========================================================\n" << std::endl;
}

void printHelp(const char* progName) {
    std::cout << "【使用方法】\n";
    std::cout << "  " << progName << " <動画URL> [オプション]\n\n";
    std::cout << "【例】\n";
    std::cout << "  # YouTube 動画のダウンロード (ファイル名: タイトル - 投稿者名.mp4)\n";
    std::cout << "  " << progName << " \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"\n\n";
    std::cout << "  # Bilibili 動画のダウンロード\n";
    std::cout << "  " << progName << " \"https://www.bilibili.com/video/BV1xx411c7mD\"\n\n";
    std::cout << "【オプション】\n";
    std::cout << "  --info-only        動画を保存せず、タイトルと投稿者名のみ取得・表示\n";
    std::cout << "  --uploader-first   ファイル名の形式を「投稿者名 - タイトル.mp4」にする\n";
    std::cout << "  --audio-only       音声のみ (m4a) で抽出して保存\n";
    std::cout << "  --outdir <DIR>     動画の保存先フォルダを指定 (デフォルト: カレントディレクトリ)\n";
    std::cout << "  --help, -h         このヘルプを表示\n\n";
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
        std::cerr << "[エラー] 動画URLが指定されていません。\n";
        printHelp(argv[0]);
        return 1;
    }

    // 1. 依存ツールの確認
    std::cout << "[ステップ 1/3] 実行環境とツールのチェック..." << std::endl;
    auto deps = FFmpegRunner::checkDependencies();
    std::cout << "  - yt-dlp: " << (deps.hasYtDlp ? ("OK (" + deps.ytDlpVersion + ")") : "未検出 (ダウンロードに必須です)") << std::endl;
    std::cout << "  - FFmpeg: " << (deps.hasFFmpeg ? ("OK (" + deps.ffmpegVersion + ")") : "未検出 (推奨: 高画質マージに必要)") << std::endl;

    if (!deps.hasYtDlp) {
        std::cerr << "\n[エラー] yt-dlp が見つかりません。以下を実行してインストールしてください:\n";
        std::cerr << "  - Debian/Ubuntu: sudo apt install python3-pip && pip install -U yt-dlp\n";
        std::cerr << "  - Windows: winget install yt-dlp または choco install yt-dlp\n";
        std::cerr << "  - Android (Termux): pkg install python && pip install -U yt-dlp\n";
        return 1;
    }

    // 2. メタデータ (タイトル・投稿者名) の取得
    std::cout << "\n[ステップ 2/3] メタデータを取得中 (URL: " << url << ")..." << std::endl;
    MediaExtractor::VideoMetadata meta;
    std::string errorMsg;
    bool success = MediaExtractor::fetchMetadata(url, meta, errorMsg);

    if (!success) {
        std::cerr << "[エラー] メタデータの取得に失敗しました:\n  " << errorMsg << std::endl;
        return 1;
    }

    std::string ext = audioOnly ? "m4a" : "mp4";
    std::string formattedFilename = MediaExtractor::generateFormattedFilename(meta, ext, uploaderFirst);

    std::cout << "--------------------------------------------------------\n";
    std::cout << "  プラットフォーム : " << meta.platform << "\n";
    std::cout << "  動画タイトル     : " << meta.title << "\n";
    std::cout << "  投稿者名         : " << meta.uploader << "\n";
    if (!meta.durationString.empty()) {
        std::cout << "  再生時間         : " << meta.durationString << "\n";
    }
    std::cout << "  生成ファイル名   : " << formattedFilename << "\n";
    std::cout << "--------------------------------------------------------\n" << std::endl;

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
        std::cerr << "\n[エラー] ダウンロード処理に失敗しました:\n  " << errorMsg << std::endl;
        return 1;
    }

    std::cout << "\n[成功] すべての処理が正常に完了しました！" << std::endl;
    return 0;
}
