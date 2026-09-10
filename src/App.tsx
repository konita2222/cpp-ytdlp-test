import { useState } from 'react';
import {
  CodeViewer
} from './components/CodeViewer';
import {
  UrlTester
} from './components/UrlTester';
import {
  PlatformGuide
} from './components/PlatformGuide';
import {
  ArchitectureFlow
} from './components/ArchitectureFlow';
import {
  AiSearchAssistant
} from './components/AiSearchAssistant';
import {
  FolderArchive,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  Github,
  Video,
  ExternalLink,
  Laptop,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import JSZip from 'jszip';
import { CPP_PROJECT_FILES } from './data/cppProjectFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'code' | 'tester' | 'guide' | 'arch' | 'ai'>('tester');
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      for (const file of CPP_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'media-fetcher-cpp-cmake.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-mono font-bold text-sm">
              C++
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
                  C++ Media Downloader Studio
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  yt-dlp & FFmpeg
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                YouTube & Bilibili 対応 | 「タイトル - 投稿者名」自動命名 | Windows / Debian / Android (Termux)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="header-zip-download-button"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isZipping ? '生成中...' : 'C++プロジェクトZIP保存'}
              </span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('tester')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tester'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>URL解析 & 命名テスト</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>C++ & CMake ソースコード</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>OS別ビルド手順 (Debian/Win/Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'arch'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>設計 & アーキテクチャ解説</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 検索アシスタント</span>
          </button>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'tester' && (
          <div className="space-y-6">
            <UrlTester />
            <ArchitectureFlow />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <PlatformGuide />
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="space-y-6">
            <ArchitectureFlow />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>なぜスペースとハイフン ( - ) による自動命名なのか？</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  YouTubeやBilibiliから動画を取得する際、通常は動画IDや英数字のみがファイル名になりがちです。
                  本プログラムは <code className="text-indigo-300 font-mono">yt-dlp --dump-single-json</code> から
                  タイトル（<code className="text-indigo-300 font-mono">title</code>）と投稿者名（<code className="text-indigo-300 font-mono">uploader</code>）を抽出し、
                  <code className="text-emerald-300 font-mono">タイトル - 投稿者名.mp4</code> として結合します。
                  さらに、ファイル名として使えない禁止文字（<code className="text-amber-300 font-mono">/ \ : * ? " &lt; &gt; |</code>）を自動サニタイズするため、OSエラーが一切発生しません。
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>初心者でも絶対にコンパイルできる仕組み (CMake FetchContent)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  C++初心者が最も挫折しやすい原因は「外部ライブラリの手動ダウンロードとパス設定」です。
                  本設計ではCMake標準の <code className="text-indigo-300 font-mono">FetchContent</code> を採用しているため、
                  初回ビルド時に JSONパーサー（<code className="text-indigo-300 font-mono">nlohmann/json</code>）がGitHubから全自動で取得・構成されます。
                  ユーザーは <code className="text-slate-200 font-mono">cmake -B build && cmake --build build</code> を実行するだけで完成します。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <AiSearchAssistant />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>C++ Cross-Platform Media Downloader</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">100% Free & Open Source</span>
          </div>
          <div>
            <span>YouTube & Bilibili 対応 | Windows / Debian Linux / Android (Termux)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
