#pragma once

#include <string>

namespace MediaExtractor {

/**
 * @brief 取得した動画のメタデータ情報
 */
struct VideoMetadata {
    std::string title;           // 動画タイトル
    std::string uploader;        // 投稿者名 (チャンネル名 / 配信者名)
    std::string id;              // 動画ID
    std::string platform;        // "YouTube", "Bilibili", "Other"
    std::string originalUrl;     // 入力されたURL
    std::string durationString;  // 再生時間 (HH:MM:SS)
};

/**
 * @brief 指定されたURLがYouTubeまたはBilibiliであるか判別します。
 * @param url 動画URL
 * @return 検出されたプラットフォーム名 ("YouTube", "Bilibili", または "Unsupported")
 */
std::string detectPlatform(const std::string& url);

/**
 * @brief yt-dlp を呼び出して動画のタイトルと投稿者名を取得します。
 * @param url 動画URL (YouTubeまたはBilibili)
 * @param outMeta 取得されたメタデータ構造体
 * @param errorMsg エラー時のメッセージ
 * @return 成功した場合 true
 */
bool fetchMetadata(const std::string& url, VideoMetadata& outMeta, std::string& errorMsg);

/**
 * @brief ファイル名として使用できない危険文字（Windows/Linux/Android共通）をサニタイズします。
 * 禁止文字: < > : " / \ | ? * および制御文字 (0x00〜0x1F)
 * @param rawText 生のテキスト
 * @return 安全に変換された文字列
 */
std::string sanitizeFilename(const std::string& rawText);

/**
 * @brief タイトルと投稿者名を「スペースとハイフン ( - )」で繋いだ安全な出力ファイル名を生成します。
 * @param meta 動画メタデータ
 * @param extension 拡張子 (例: "mp4", "m4a")
 * @param uploaderFirst trueの場合は「投稿者名 - タイトル.mp4」、falseの場合は「タイトル - 投稿者名.mp4」
 * @return 整形済みの完全なファイル名
 */
std::string generateFormattedFilename(
    const VideoMetadata& meta,
    const std::string& extension = "mp4",
    bool uploaderFirst = false
);

} // namespace MediaExtractor
