import { useState } from 'react';
import { Play, Sparkles, Check, Copy, ArrowRight, ShieldCheck, Video, RefreshCw } from 'lucide-react';

interface Preset {
  platform: 'YouTube' | 'Bilibili';
  label: string;
  url: string;
  rawTitle: string;
  uploader: string;
}

const PRESETS: Preset[] = [
  {
    platform: 'YouTube',
    label: 'YouTube 公式MV (特殊文字・コロン含む)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rawTitle: 'Rick Astley - Never Gonna Give You Up (Official Music Video) [Remastered: 4K]',
    uploader: 'Rick Astley',
  },
  {
    platform: 'YouTube',
    label: 'YouTube 技術チュートリアル',
    url: 'https://www.youtube.com/watch?v=1uR4tLpQ_c0',
    rawTitle: 'Modern C++ / CMake: Best Practices & Cross-Compilation Guide',
    uploader: 'TheCherno_Dev',
  },
  {
    platform: 'Bilibili',
    label: 'Bilibili BV動画 (中国語タイトル・記号)',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    rawTitle: '【4K60FPS】超绝画质！现代C++与FFmpeg音视频开发实战讲解',
    uploader: '极客程序员_Official',
  },
  {
    platform: 'Bilibili',
    label: 'Bilibili 短縮リンク (b23.tv)',
    url: 'https://b23.tv/BV1uT4y1P7EK',
    rawTitle: '「bilibili」2026年最新跨平台音视频工具全套开源',
    uploader: '开源技术分享君',
  },
];

// C++ sanitization replica
function sanitize(raw: string): string {
  if (!raw) return 'Unnamed';
  // Forbidden on Windows & Android: \ / : * ? " < > |
  const forbidden = /[\\/:*?"<>|\x00-\x1F]/g;
  let clean = raw.replace(forbidden, '_');
  // Collapse whitespace/underscores
  clean = clean.replace(/[\s_]+/g, ' ').trim();
  // Trim edge dots and spaces
  clean = clean.replace(/^[ ._]+|[ ._]+$/g, '');
  return clean || 'Untitled';
}

export function UrlTester() {
  const [inputUrl, setInputUrl] = useState(PRESETS[0].url);
  const [currentPreset, setCurrentPreset] = useState<Preset>(PRESETS[0]);
  const [uploaderFirst, setUploaderFirst] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const cleanTitle = sanitize(currentPreset.rawTitle);
  const cleanUploader = sanitize(currentPreset.uploader);
  const ext = audioOnly ? 'm4a' : 'mp4';
  const finalFilename = uploaderFirst
    ? `${cleanUploader} - ${cleanTitle}.${ext}`
    : `${cleanTitle} - ${cleanUploader}.${ext}`;

  const generatedCommand = `./media_fetcher "${inputUrl}"${uploaderFirst ? ' --uploader-first' : ''}${
    audioOnly ? ' --audio-only' : ''
  }`;

  const handleSelectPreset = (p: Preset) => {
    setCurrentPreset(p);
    setInputUrl(p.url);
    setTerminalLogs([]);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTerminalLogs([
      '========================================================',
      '  C++ Cross-Platform Media Downloader (yt-dlp & FFmpeg) ',
      `  対応: YouTube / Bilibili | OS: Linux (Debian / Ubuntu) `,
      '========================================================',
      '',
      '[ステップ 1/3] 実行環境とツールのチェック...',
      '  - yt-dlp: OK (2025.02.19)',
      '  - FFmpeg: OK (ffmpeg version 7.1-static)',
      '',
      `[ステップ 2/3] メタデータを取得中 (URL: ${inputUrl})...`,
      `  プラットフォーム : ${currentPreset.platform}`,
      `  動画タイトル     : ${currentPreset.rawTitle}`,
      `  投稿者名         : ${currentPreset.uploader}`,
      `  生成ファイル名   : ${finalFilename}`,
      '',
      `[ステップ 3/3] yt-dlp と FFmpeg によるストリーム結合を開始...`,
      `[yt-dlp] [${currentPreset.platform.toLowerCase()}] Extracting URL information`,
      `[yt-dlp] Downloading 1080p video stream (video.mp4)... 100%`,
      `[yt-dlp] Downloading highest audio stream (audio.m4a)... 100%`,
      `[ffmpeg] Merging video and audio streams into: "${finalFilename}"`,
      '',
      `[成功] 正常に保存されました: ./${finalFilename}`,
    ]);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  const handleCopyCmd = async () => {
    await navigator.clipboard.writeText(generatedCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            <span>URL メタデータ解析 & ファイル名シミュレーター</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            YouTube / Bilibili のURLから「タイトル」と「投稿者名」を取得し、スペースとハイフン ( - ) で安全に結合
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
            YouTube 対応
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
            Bilibili 対応
          </span>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div>
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
          クイックサンプル（クリックして即座にテスト）
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.url}
              onClick={() => handleSelectPreset(p)}
              className={`text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                currentPreset.url === p.url
                  ? 'bg-indigo-950/50 border-indigo-500 text-indigo-100 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between font-medium">
                <span className={p.platform === 'YouTube' ? 'text-red-400' : 'text-sky-400'}>
                  [{p.platform}] {p.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate mt-1">{p.url}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          動画URLを入力 (YouTube / Bilibili)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setCurrentPreset((prev) => ({
                ...prev,
                url: e.target.value,
                platform:
                  e.target.value.includes('bilibili') || e.target.value.includes('b23.tv')
                    ? 'Bilibili'
                    : 'YouTube',
              }));
            }}
            placeholder="https://www.youtube.com/watch?v=... または https://www.bilibili.com/video/BV..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? '解析中...' : '抽出テスト実行'}</span>
          </button>
        </div>
      </div>

      {/* Extraction & Formatting Result Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Metadata breakdown */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
            <span className="font-semibold text-slate-200">取得メタデータ</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              yt-dlp JSON
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">取得タイトル:</span>
              <span className="text-slate-200 font-medium break-all">{currentPreset.rawTitle}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">取得投稿者名 (Uploader):</span>
              <span className="text-indigo-300 font-medium">{currentPreset.uploader}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">判別プラットフォーム:</span>
              <span className="text-amber-300 font-mono">{currentPreset.platform}</span>
            </div>
          </div>
        </div>

        {/* Right: C++ Sanitization & Filename Result */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>C++ 自動生成ファイル名</span>
              </span>
              <span className="text-[11px] text-slate-400">Windows/Linux/Android安全規格</span>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-3 my-3 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uploaderFirst}
                  onChange={(e) => setUploaderFirst(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>「投稿者名 - タイトル」形式</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={audioOnly}
                  onChange={(e) => setAudioOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>音声のみ (.m4a)</span>
              </label>
            </div>

            {/* Final sanitized filename box */}
            <div className="bg-slate-900 border border-indigo-500/40 rounded-md p-2.5">
              <div className="text-[10px] text-indigo-400 font-mono uppercase">保存されるファイル名:</div>
              <div className="text-xs font-mono font-semibold text-emerald-300 mt-1 break-all">
                {finalFilename}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>禁止文字 (`\/:*?"&lt;&gt;|`) は自動でアンダースコアに安全置換</span>
          </div>
        </div>
      </div>

      {/* Terminal execution simulation */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="font-mono text-slate-400 ml-2">C++ CLI 実行シミュレーション</span>
          </div>

          <button
            onClick={handleCopyCmd}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCmd ? 'コピー済み' : 'コマンドをコピー'}</span>
          </button>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto max-h-[220px]">
          <div className="text-emerald-400 font-bold">$ {generatedCommand}</div>
          {terminalLogs.length > 0 ? (
            terminalLogs.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith('[成功]')
                    ? 'text-emerald-400 font-semibold'
                    : line.startsWith('[ステップ')
                    ? 'text-cyan-300'
                    : line.startsWith('[ffmpeg]')
                    ? 'text-purple-300'
                    : line.startsWith('  生成ファイル名')
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-400'
                }
              >
                {line}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">
              上の「抽出テスト実行」ボタンをクリックすると、C++プログラムの実行ログをシミュレートできます。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
