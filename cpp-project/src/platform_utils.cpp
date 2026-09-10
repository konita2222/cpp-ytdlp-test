#include "platform_utils.hpp"
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
    // Windows コンソールで UTF-8 (コードページ 65001) を有効化
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);

    // ANSI エスケープシーケンス (カラー出力) の有効化
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

    // コマンドを実行しパイプを開く
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

} // namespace PlatformUtils
