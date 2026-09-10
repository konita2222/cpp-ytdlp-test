#pragma once

#include <string>
#include <vector>

namespace PlatformUtils {

/**
 * @brief コンソールおよびターミナルのUTF-8入出力設定を初期化します。
 * Windowsの場合はSetConsoleOutputCP(CP_UTF8)を適用し文字化けを防ぎます。
 */
void initializeConsole();

/**
 * @brief 外部コマンドを実行し、その標準出力(stdout)を文字列として取得します。
 * @param command 実行するシェルコマンドライン
 * @param exitCode コマンドの終了ステータスを受け取るポインタ（任意）
 * @return 標準出力のテキスト
 */
std::string executeCommand(const std::string& command, int* exitCode = nullptr);

/**
 * @brief 指定した実行可能コマンドがシステムPATHまたは現在の環境で利用可能か確認します。
 * @param executableName コマンド名 (例: "yt-dlp", "ffmpeg")
 * @return 存在していれば true
 */
bool isCommandAvailable(const std::string& executableName);

/**
 * @brief OS名文字列を返します ("Windows", "Linux (Debian)", "Android")
 */
std::string getPlatformName();

} // namespace PlatformUtils
