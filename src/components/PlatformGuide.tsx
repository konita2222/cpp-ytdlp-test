import { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Cpu, Laptop, Smartphone, Github, ShieldAlert } from 'lucide-react';

interface GuideTab {
  id: 'debian' | 'windows' | 'android' | 'github';
  title: string;
  badge: string;
  icon: typeof Terminal;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    command?: string;
    note?: string;
  }[];
}

const GUIDES: GuideTab[] = [
  {
    id: 'debian',
    title: 'Linux (Debian / Ubuntu)',
    badge: '100% 無料 & 1行インストール',
    icon: Terminal,
    steps: [
      {
        stepNumber: 1,
        title: '依存ツールのインストール (apt & pip)',
        description: 'Debian/Ubuntuの標準パッケージマネージャでビルドツールとffmpegをインストールします。',
        command: 'sudo apt update && sudo apt install -y cmake build-essential ffmpeg python3-pip git\npip3 install --upgrade yt-dlp',
      },
      {
        stepNumber: 2,
        title: 'CMakeによるビルド構成の作成',
        description: 'CMakeLists.txtを読み込み、nlohmann/jsonなどの外部ライブラリを自動ダウンロード・構成します。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release',
      },
      {
        stepNumber: 3,
        title: 'コンパイル実行',
        description: 'マルチコアCPUをフル活用して並列コンパイルします。完了すると build/media_fetcher が生成されます。',
        command: 'cmake --build build --config Release -j$(nproc)',
      },
      {
        stepNumber: 4,
        title: '実行テスト (YouTube または Bilibili)',
        description: 'ダウンロードしたい動画のURLを渡して実行します。',
        command: './build/media_fetcher "https://www.youtube.com/watch?v=dQw4w9WgXcQ"',
        note: '※ scripts/build_linux.sh を実行すればステップ1〜3を全自動で行えます。',
      },
    ],
  },
  {
    id: 'windows',
    title: 'Windows 11 / 10',
    badge: 'winget でツール全自動導入',
    icon: Laptop,
    steps: [
      {
        stepNumber: 1,
        title: 'winget (Windows標準パッケージマネージャ) で一括インストール',
        description: 'PowerShellを「管理者として実行」し、以下のコマンドでCMake、yt-dlp、FFmpegを無料導入します。',
        command: 'winget install Kitware.CMake\nwinget install yt-dlp.yt-dlp\nwinget install Gyan.FFmpeg\nwinget install Microsoft.VisualStudio.2022.BuildTools',
        note: '※ すでに Visual Studio 2022 (Community等) がインストールされている場合はBuildToolsは不要です。',
      },
      {
        stepNumber: 2,
        title: 'CMake プロジェクトの生成',
        description: 'PowerShell または コマンドプロンプトでソースコードのフォルダに移動して実行します。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release',
      },
      {
        stepNumber: 3,
        title: 'コンパイル実行',
        description: 'C++コードがビルドされ、build\\Release\\media_fetcher.exe が生成されます。',
        command: 'cmake --build build --config Release',
      },
      {
        stepNumber: 4,
        title: '実行',
        description: 'URLを渡して実行します。',
        command: '.\\build\\Release\\media_fetcher.exe "https://www.bilibili.com/video/BV1xx411c7mD"',
        note: '※ scripts\\build_windows.bat をダブルクリックするだけでも自動ビルド可能です。',
      },
    ],
  },
  {
    id: 'android',
    title: 'Android (Termux)',
    badge: 'スマホ単体で完全無料ビルド',
    icon: Smartphone,
    steps: [
      {
        stepNumber: 1,
        title: 'F-Droid から Termux アプリをインストール',
        description: 'Google Play版は古いため、必ず F-Droid (https://f-droid.org/packages/com.termux/) からTermuxをインストールしてください。',
        note: '完全無料でroot権限も不要です。',
      },
      {
        stepNumber: 2,
        title: 'Termux内でコンパイラとツールのインストール',
        description: 'Termuxアプリを開き、C++コンパイラ(Clang)、CMake、FFmpeg、yt-dlpをインストールします。',
        command: 'pkg update -y\npkg install -y clang cmake make git ffmpeg python\npip install --upgrade yt-dlp',
      },
      {
        stepNumber: 3,
        title: '端末ストレージへのアクセス許可',
        description: 'ダウンロードした動画をスマホの「ダウンロード」フォルダに保存できるように権限を付与します。',
        command: 'termux-setup-storage',
      },
      {
        stepNumber: 4,
        title: 'ビルド & 実行',
        description: 'CMakeでコンパイルし、スマホのストレージに出力します。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --config Release -j$(nproc)\n./build/media_fetcher "https://www.youtube.com/watch?v=..." --outdir ~/storage/downloads',
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub Actions (PCインストール不要)',
    badge: 'クラウド完全自動ビルド',
    icon: Github,
    steps: [
      {
        stepNumber: 1,
        title: 'GitHub にリポジトリを作成してソースをアップロード',
        description: 'ダウンロードしたZIPを展開し、ご自身のGitHubアカウントにプッシュします。',
        command: 'git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git\ngit push -u origin main',
      },
      {
        stepNumber: 2,
        title: 'GitHub Actions が自動でビルド開始',
        description: '.github/workflows/build.yml により、GitHubのクラウドサーバー上で自動的にWindows(.exe)、Linux、Android向けに並列コンパイルされます。',
      },
      {
        stepNumber: 3,
        title: '生成されたバイナリを1クリックダウンロード',
        description: 'リポジトリの「Actions」タブを開き、ビルド完了後に「Artifacts」から完成済みの実行可能ファイルを直接ダウンロードできます。自分のPCにコンパイラを導入する必要すらありません！',
      },
    ],
  },
];

export function PlatformGuide() {
  const [activeTab, setActiveTab] = useState<'debian' | 'windows' | 'android' | 'github'>('debian');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentGuide = GUIDES.find((g) => g.id === activeTab) || GUIDES[0];

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>クロスプラットフォーム ビルドガイド（完全無料・オープンソース）</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            プログラミング初心者の方でも迷わずコンパイルできる、OS別コピペ実行ガイド
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
          CMake 統合構成
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GUIDES.map((g) => {
          const Icon = g.icon;
          const isSelected = activeTab === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-semibold text-xs text-slate-200 truncate">{g.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">{g.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {currentGuide.steps.map((step, idx) => (
          <div
            key={step.stepNumber}
            className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold">
                {step.stepNumber}
              </span>
              <h4 className="text-sm font-semibold text-slate-200">{step.title}</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pl-8.5">{step.description}</p>

            {step.command && (
              <div className="pl-8.5">
                <div className="relative bg-slate-900 border border-slate-800 rounded-md p-3 group">
                  <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed pr-8">
                    {step.command}
                  </pre>
                  <button
                    onClick={() => handleCopy(step.command!, idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 cursor-pointer"
                    title="コマンドをコピー"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {step.note && (
              <div className="pl-8.5 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                <span>💡 {step.note}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
