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
  const [activeTab, setActiveTab] = useState<'code' | 'tester' | 'guide' | 'arch'>('tester');
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
    <div className="min-h-screen bg-[#09090b] text-cyan-50 font-sans flex flex-col antialiased selection:bg-fuchsia-500/40 selection:text-fuchsia-100 relative overflow-hidden">
      {/* Background Cyberpunk Grid/Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#09090b] to-[#09090b] z-0"></div>
      
      {/* Top Navbar */}
      <header className="bg-black/60 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-black border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] font-mono font-bold text-sm">
              C++
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-wider uppercase break-words">
                  C++ Media Downloader Studio
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 uppercase tracking-widest shadow-[0_0_8px_rgba(217,70,239,0.3)]">
                  yt-dlp & FFmpeg
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/70 font-mono tracking-wide break-words whitespace-pre-wrap">
                YouTube & Bilibili // AUTO NAMING // Windows / Debian / Termux
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => {
                setActiveTab('guide');
                document.getElementById('windows-guide')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Laptop className="w-4 h-4" />
              <span className="hidden sm:inline">WINDOWS版 (GUI) を使う</span>
              <span className="sm:hidden">WIN GUI</span>
            </button>
            <button
              id="header-zip-download-button"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <FolderArchive className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isZipping ? 'GENERATING...' : 'ソースコードを一括DL'}
              </span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Beginner Alert */}
        <div className="bg-cyan-950/40 border border-cyan-500/50 rounded-lg p-5 flex items-start gap-4 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-cyan-300 break-words">初心者の方へ：GitHub Pagesで自動公開に対応しました！</h2>
            <p className="text-xs text-cyan-100/80 leading-relaxed font-mono break-words whitespace-pre-wrap">
              このプロジェクトをGitHubにアップロード（Push）するだけで、裏側で自動的にビルドが走り、GitHub PagesとしてWebサイトが公開されます。複雑な設定やJSでの書き換えは一切不要です！
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-cyan-900/50 rounded overflow-x-auto text-xs font-mono uppercase tracking-wider backdrop-blur-sm scrollbar-hide">
          <button
            onClick={() => setActiveTab('tester')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
              activeTab === 'tester'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-cyan-500/70 border border-transparent hover:text-cyan-300 hover:bg-cyan-950/40'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>URL Tester</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-cyan-500/70 border border-transparent hover:text-cyan-300 hover:bg-cyan-950/40'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Source Code</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-cyan-500/70 border border-transparent hover:text-cyan-300 hover:bg-cyan-950/40'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Install Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'arch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-cyan-500/70 border border-transparent hover:text-cyan-300 hover:bg-cyan-950/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture</span>
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
              <div className="bg-black/60 border border-cyan-900/50 rounded p-5 space-y-3 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500 group-hover:shadow-[0_0_10px_rgba(217,70,239,0.8)] transition-all"></div>
                <h4 className="text-sm font-bold text-fuchsia-400 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>なぜスペースとハイフン ( - ) による自動命名なのか？</span>
                </h4>
                <p className="text-sm text-cyan-200/70 leading-relaxed font-mono">
                  YouTubeやBilibiliから動画を取得する際、通常は動画IDや英数字のみがファイル名になりがちです。
                  本プログラムは <code className="text-fuchsia-300 bg-fuchsia-900/30 px-1 py-0.5 rounded">yt-dlp --dump-single-json</code> から
                  タイトルと投稿者名を抽出し、
                  <code className="text-cyan-300 bg-cyan-900/30 px-1 py-0.5 rounded ml-1">タイトル - 投稿者名.mp4</code> として結合します。
                  さらに、ファイル名として使えない禁止文字を自動サニタイズするため、OSエラーが一切発生しません。
                </p>
              </div>

              <div className="bg-black/60 border border-cyan-900/50 rounded p-5 space-y-3 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all"></div>
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>初心者でも絶対にコンパイルできる仕組み</span>
                </h4>
                <p className="text-sm text-cyan-200/70 leading-relaxed font-mono">
                  C++初心者が最も挫折しやすい原因は「外部ライブラリの手動ダウンロードとパス設定」です。
                  本設計ではCMake標準の <code className="text-cyan-300 bg-cyan-900/30 px-1 py-0.5 rounded">FetchContent</code> を採用しているため、
                  初回ビルド時に JSONパーサーがGitHubから全自動で取得・構成されます。
                  ユーザーは <code className="text-yellow-300 bg-yellow-900/30 px-1 py-0.5 rounded mt-1 inline-block">cmake -B build && cmake --build build</code> を実行するだけで完成します。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-cyan-900/50 py-6 text-center text-xs text-cyan-500/60 font-mono tracking-widest relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="uppercase">C++ Cross-Platform Media Downloader</span>
            <span className="text-cyan-800">///</span>
            <span className="text-fuchsia-400 font-bold shadow-[0_0_5px_rgba(217,70,239,0.3)]">100% FREE & OPEN SOURCE</span>
          </div>
          <div>
            <span className="uppercase text-[10px]">YouTube & Bilibili // Windows / Debian Linux / Android (Termux)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
