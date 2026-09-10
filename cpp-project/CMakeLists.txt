cmake_minimum_required(VERSION 3.20)
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
# プログラミング初心者でもライブラリの個別ダウンロードやパス設定が不要です
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
add_executable(media_fetcher ${SOURCES} ${HEADERS})

# インクルードディレクトリ
target_include_directories(media_fetcher PRIVATE src)

# nlohmann_json ライブラリをリンク
target_link_libraries(media_fetcher PRIVATE nlohmann_json::nlohmann_json)

# プラットフォーム固有のコンパイル・リンク設定
if(WIN32)
    target_compile_definitions(media_fetcher PRIVATE OS_WINDOWS NOMINMAX UNICODE _UNICODE)
    # Windows API ソケットやシェル機能
    target_link_libraries(media_fetcher PRIVATE ws2_32 shell32)
    if(MSVC)
        # MSVC UTF-8 ソース・実行ファイル文字セット強制
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

# インストール設定 (make install や cmake --install で bin/ に配置)
install(TARGETS media_fetcher DESTINATION bin)
