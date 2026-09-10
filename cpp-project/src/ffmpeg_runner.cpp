#include "ffmpeg_runner.hpp"
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
            // 改行を取り除く
            while (!out.empty() && (out.back() == '\n' || out.back() == '\r')) {
                out.pop_back();
            }
            status.ytDlpVersion = out;
        }
    }

    if (status.hasFFmpeg) {
        int code = 0;
        std::string out = PlatformUtils::executeCommand("ffmpeg -version", &code);
        if (code == 0 && !out.empty()) {
            // 最初の行のみ抽出
            size_t newlinePos = out.find('\n');
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

    // 出力ディレクトリの整備
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
        // 音声抽出モード (ffmpeg を用いて m4a/mp3 に結合・変換)
        cmd = "yt-dlp -x --audio-format m4a --audio-quality 0 ";
        if (deps.hasFFmpeg) {
            cmd += "--prefer-ffmpeg ";
        }
        cmd += "-o \"" + fullOutPathStr + "\" \"" + url + "\"";
    } else {
        // 動画+音声 最高画質マージモード (ffmpeg を用いて mp4 にマージ)
        // YouTube や Bilibili では最高画質映像と高音質音声が分離されているため、
        // ffmpeg によるマージが必須です。
        cmd = "yt-dlp -f \"bestvideo+bestaudio/best\" --merge-output-format mp4 ";
        if (deps.hasFFmpeg) {
            cmd += "--prefer-ffmpeg ";
        }
        cmd += "-o \"" + fullOutPathStr + "\" \"" + url + "\"";
    }

    std::cout << "[実行コマンド] " << cmd << std::endl;

    // ユーザーに進行状況がリアルタイムで見えるよう system() で直接コンソールへ出力
    int ret = std::system(cmd.c_str());

    if (ret != 0) {
        errorMsg = "ダウンロードまたはFFmpegマージ処理が失敗しました (終了コード: " + std::to_string(ret) + ")";
        return false;
    }

    std::cout << "[完了] 正常に保存されました: " << fullOutPathStr << std::endl;
    return true;
}

} // namespace FFmpegRunner
