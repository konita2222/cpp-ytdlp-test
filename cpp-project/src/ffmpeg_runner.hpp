#pragma once

#include <string>
#include <filesystem>

namespace FFmpegRunner {

/**
 * @brief FFmpeg および yt-dlp の実行環境ステータス
 */
struct DependencyStatus {
    bool hasYtDlp = false;
    bool hasFFmpeg = false;
    std::string ytDlpVersion;
    std::string ffmpegVersion;
};

/**
 * @brief システム内に yt-dlp と ffmpeg が存在するか検査します。
 */
DependencyStatus checkDependencies();

/**
 * @brief yt-dlp と FFmpeg を連携させて動画を最高画質+最高音質でダウンロードし、指定のファイル名で保存します。
 * @param url 動画URL (YouTube / Bilibili)
 * @param outputDirectory 保存先ディレクトリ
 * @param formattedFilename 出力ファイル名 (例: "タイトル - 投稿者名.mp4")
 * @param audioOnly trueの場合は音声ファイル(m4a/mp3)として保存
 * @param errorMsg エラーメッセージ格納先
 * @return 成功時 true
 */
bool downloadVideoWithFFmpeg(
    const std::string& url,
    const std::string& outputDirectory,
    const std::string& formattedFilename,
    bool audioOnly,
    std::string& errorMsg
);

} // namespace FFmpegRunner
