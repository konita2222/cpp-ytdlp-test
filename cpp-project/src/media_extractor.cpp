#include "media_extractor.hpp"
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

    // yt-dlp コマンドの存在確認
    if (!PlatformUtils::isCommandAvailable("yt-dlp")) {
        errorMsg = "yt-dlp が見つかりません。システムにインストールしてPATHを通してください。";
        return false;
    }

    // yt-dlp にて JSON メタデータのみを取得 (動画データ本体はダウンロードしない)
    // Bilibili や YouTube の多重リダイレクトや短縮リンク (b23.tv, youtu.be) にも対応
    std::string cmd = "yt-dlp --dump-single-json --no-warnings --no-playlist \"" + url + "\"";

    int exitCode = 0;
    std::string jsonOutput = PlatformUtils::executeCommand(cmd, &exitCode);

    if (exitCode != 0 || jsonOutput.empty()) {
        errorMsg = "yt-dlp で動画情報の取得に失敗しました (exit code: " + std::to_string(exitCode) + ")";
        return false;
    }

    try {
        nlohmann::json j = nlohmann::json::parse(jsonOutput);

        // タイトルの抽出
        if (j.contains("title") && !j["title"].is_null()) {
            outMeta.title = j["title"].get<std::string>();
        } else if (j.contains("fulltitle") && !j["fulltitle"].is_null()) {
            outMeta.title = j["fulltitle"].get<std::string>();
        } else {
            outMeta.title = "Unknown_Title";
        }

        // 投稿者名 (Uploader / Channel / Creator) の抽出
        // YouTube: uploader または channel
        // Bilibili: uploader, creator, または channel
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

        // 動画ID
        if (j.contains("id") && !j["id"].is_null()) {
            outMeta.id = j["id"].get<std::string>();
        }

        // 再生時間
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

    // Windows / Linux / Android 禁止文字リスト: \ / : * ? " < > |
    // および制御コード (ASCII 0〜31)
    const std::string forbiddenChars = "\\/:*?\"<>|";

    for (char& c : sanitized) {
        unsigned char uc = static_cast<unsigned char>(c);
        // 制御コードまたは禁止文字をアンダースコアまたはハイフンに置換
        if (uc < 32 || forbiddenChars.find(c) != std::string::npos) {
            c = '_';
        }
    }

    // 連続するアンダースコアや空白の整理
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

    // 先頭および末尾の空白、ピリオド、アンダースコアをトリム (Windowsでは末尾ピリオド禁止)
    size_t start = clean.find_first_not_of(" ._");
    size_t end = clean.find_last_not_of(" ._");

    if (start == std::string::npos) {
        return "Untitled";
    }

    clean = clean.substr(start, end - start + 1);

    // 長すぎるファイル名によるOSエラー (MAX_PATH / Android制限) を防ぐため上限150文字でカット
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

    // 要求仕様: 「動画のタイトルと、投稿者名を取得し、ファイル名をその2つをスペースとハイフンで繋いだ名前にして」
    // フォーマット: <タイトル> - <投稿者名>.<拡張子> (または <投稿者名> - <タイトル>)
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

} // namespace MediaExtractor
