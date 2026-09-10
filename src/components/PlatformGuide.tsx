import { useState } from 'react';
import { Terminal, Copy, Check, Cpu, Laptop, Smartphone, Github } from 'lucide-react';

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
    badge: '100% FREE // ONE-LINE INSTALL',
    icon: Terminal,
    steps: [
      {
        stepNumber: 1,
        title: 'システムの準備 (APT & PIP)',
        description: 'まずは必要な道具（C++コンパイラや動画処理ツール）をまとめてインストールします。黒い画面（ターミナル）を開いて、以下のコマンドを貼り付けてEnterを押してください。',
        command: 'sudo apt update && sudo apt install -y cmake build-essential ffmpeg python3-pip git\npip3 install --upgrade yt-dlp',
      },
      {
        stepNumber: 2,
        title: '設計図の作成 (CMake)',
        description: '次に、プログラムを組み立てるための設計図（buildフォルダ）を作ります。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release',
      },
      {
        stepNumber: 3,
        title: 'コンパイル (組み立て)',
        description: '設計図をもとに、実際にプログラムを組み立てます。完了すると build フォルダの中に media_fetcher という実行ファイルが完成します。',
        command: 'cmake --build build --config Release -j$(nproc)',
      },
      {
        stepNumber: 4,
        title: '使ってみよう！',
        description: '完成したプログラムに、ダウンロードしたい動画のURLを渡して実行するだけです。',
        command: './build/media_fetcher "https://www.youtube.com/watch?v=dQw4w9WgXcQ"',
        note: '※ ダウンロードしたプロジェクトの中にある scripts/build_linux.sh を実行すると、ステップ1〜3を全自動でやってくれます！',
      },
    ],
  },
  {
    id: 'windows',
    title: 'Windows 11 / 10',
    badge: 'GUI パネル対応 // WINGET',
    icon: Laptop,
    steps: [
      {
        stepNumber: 1,
        title: '必要なツールのインストール (winget)',
        description: 'Windowsのスタートメニューから「PowerShell」と検索し、「管理者として実行」で開きます。その後、以下のコマンドを1行ずつ貼り付けて実行してください。',
        command: 'winget install Kitware.CMake\nwinget install yt-dlp.yt-dlp\nwinget install Gyan.FFmpeg\nwinget install Microsoft.VisualStudio.2022.BuildTools',
        note: '※ すでにVisual Studio (C++開発環境) を入れている場合は一番下の行は不要です。',
      },
      {
        stepNumber: 2,
        title: '設計図の作成 (CMake)',
        description: 'PowerShell または コマンドプロンプトで、ZIPを解凍したフォルダに移動(cd)して、以下を実行します。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release',
      },
      {
        stepNumber: 3,
        title: 'コンパイル (組み立て)',
        description: 'プログラムが組み立てられ、build\\Release\\media_fetcher.exe が完成します。',
        command: 'cmake --build build --config Release',
      },
      {
        stepNumber: 4,
        title: 'GUIで快適にダウンロード！',
        description: '【新機能】黒い画面（コマンド）を使わずに、専用のウィンドウ（GUI）でダウンロードできるようになりました！\n※同じフォルダにyt-dlp.exeとffmpeg.exeを配置してください。',
        command: 'start_windows_gui.bat',
        note: '※ ZIPの中に入っている「start_windows_gui.bat」をダブルクリックするだけで、自動的にC#がコンパイルされ専用のダウンロード画面が開きます！',
      },
    ],
  },
  {
    id: 'android',
    title: 'Android (Termux)',
    badge: 'MOBILE // NO ROOT REQUIRED',
    icon: Smartphone,
    steps: [
      {
        stepNumber: 1,
        title: 'Termux アプリを入れる',
        description: 'Androidスマホだけでプログラムを作って動かせます。まず、F-Droidというサイトから「Termux」アプリをダウンロードしてインストールします。',
        note: '※ Google Play版は古くて動かないので、必ずF-Droidから入れてください。完全無料で、危険な設定(root化)も不要です。',
      },
      {
        stepNumber: 2,
        title: 'Termux内でツールを入れる',
        description: 'Termuxアプリを開いて、以下のコマンドを貼り付けてEnterを押します。必要な道具がスマホに入ります。',
        command: 'pkg update -y\npkg install -y clang cmake make git ffmpeg python\npip install --upgrade yt-dlp',
      },
      {
        stepNumber: 3,
        title: 'スマホの保存フォルダを使えるようにする',
        description: 'ダウンロードした動画をスマホの「ダウンロード」フォルダに保存できるように、アクセス権限をオンにします。',
        command: 'termux-setup-storage',
      },
      {
        stepNumber: 4,
        title: '組み立て & 実行！',
        description: 'スマホの中でコンパイルし、そのまま動画をダウンロードします。',
        command: 'cmake -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --config Release -j$(nproc)\n./build/media_fetcher "https://www.youtube.com/watch?v=..." --outdir ~/storage/downloads',
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub Actions (PC不要)',
    badge: 'CLOUD // 100% AUTOMATED',
    icon: Github,
    steps: [
      {
        stepNumber: 1,
        title: '自分のGitHubにアップロードする',
        description: 'プログラミング環境を作るのが面倒な場合は、GitHubのクラウドサーバーに全部おまかせできます！プロジェクトをZIPでダウンロードし、自分のGitHubにアップロード(Push)してください。',
        command: 'git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git\ngit push -u origin main',
      },
      {
        stepNumber: 2,
        title: 'GitHubが勝手に組み立ててくれる',
        description: 'アップロードすると、.github/workflows/build.yml の設定が自動的に動き出し、クラウド上の強力なサーバーが Windows用、Linux用、Android用の3種類のプログラムを並行して組み立ててくれます。',
      },
      {
        stepNumber: 3,
        title: '完成品をダウンロード！',
        description: 'あなたのリポジトリの「Actions」タブを開くと、組み立てが終わった完成品(Artifacts)が置いてあります。それをクリックしてダウンロードするだけ。自分のPCには一切何もインストールしなくてOKです！',
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
    <div id="windows-guide" className="bg-black/60 border border-cyan-900/50 rounded-lg p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-900/50">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
            <Cpu className="w-5 h-5 text-fuchsia-500" />
            <span>HOW TO BUILD (初心者向けインストール手順)</span>
          </h3>
          <p className="text-xs text-cyan-200/70 mt-1 font-mono">
            プログラミングが初めてでも大丈夫！OSを選ぶだけで、コピペで終わる手順が分かります。
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 font-mono uppercase tracking-widest shadow-[0_0_8px_rgba(217,70,239,0.2)]">
          C++ / CMake
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {GUIDES.map((g) => {
          const Icon = g.icon;
          const isSelected = activeTab === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={`p-3 rounded border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'bg-black/40 border-cyan-900/50 text-cyan-500/70 hover:text-cyan-400 hover:border-cyan-700/50'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400"></div>}
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-yellow-400' : 'text-cyan-700'}`} />
                <span className="font-bold text-xs uppercase tracking-wider">{g.title}</span>
              </div>
              <span className={`text-[10px] font-mono truncate ${isSelected ? 'text-fuchsia-400' : 'text-cyan-700'}`}>{g.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {currentGuide.steps.map((step, idx) => (
          <div
            key={step.stepNumber}
            className="bg-black/40 border border-cyan-900/30 rounded p-4 space-y-3 relative overflow-hidden hover:border-cyan-500/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded bg-yellow-400 text-black font-mono text-xs font-bold shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                {step.stepNumber}
              </span>
              <h4 className="text-sm font-bold text-cyan-300 tracking-wide">{step.title}</h4>
            </div>

            <p className="text-sm text-cyan-100/80 leading-relaxed pl-9">{step.description}</p>

            {step.command && (
              <div className="pl-9">
                <div className="relative bg-[#09090b] border border-cyan-900/50 rounded p-3 group shadow-inner">
                  <pre className="font-mono text-[11px] text-fuchsia-300 overflow-x-auto whitespace-pre leading-relaxed pr-8">
                    {step.command}
                  </pre>
                  <button
                    onClick={() => handleCopy(step.command!, idx)}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-cyan-950 text-cyan-400 rounded text-xs transition-colors border border-cyan-900 cursor-pointer hover:shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    title="コマンドをコピー"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {step.note && (
              <div className="pl-9 text-xs text-yellow-400/90 flex items-start gap-1.5 font-mono">
                <span className="mt-0.5">⚠️</span>
                <span className="leading-relaxed">{step.note}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
