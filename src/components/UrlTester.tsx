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
    <div className="bg-black/60 border border-cyan-900/50 rounded-lg p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-900/50">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
            <Video className="w-5 h-5 text-fuchsia-500" />
            <span>URL メタデータ解析 & ファイル名シミュレーター</span>
          </h3>
          <p className="text-xs text-cyan-200/70 mt-1 font-mono">
            YouTube / Bilibili のURLから「タイトル」と「投稿者名」を取得し、スペースとハイフン ( - ) で安全に結合
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-mono uppercase tracking-widest shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            YouTube 対応
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono uppercase tracking-widest shadow-[0_0_8px_rgba(14,165,233,0.2)]">
            Bilibili 対応
          </span>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div>
        <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2 shadow-fuchsia-500">
          クイックサンプル（クリックして即座にテスト）
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.url}
              onClick={() => handleSelectPreset(p)}
              className={`text-left p-3 rounded border text-xs transition-all cursor-pointer relative overflow-hidden group ${
                currentPreset.url === p.url
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'bg-black/40 border-cyan-900/50 text-cyan-500/70 hover:border-cyan-700/50 hover:bg-cyan-900/20'
              }`}
            >
              {currentPreset.url === p.url && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>}
              <div className="flex items-center justify-between font-bold tracking-wide">
                <span className={p.platform === 'YouTube' ? 'text-red-400' : 'text-sky-400'}>
                  [{p.platform}] {p.label}
                </span>
              </div>
              <div className="text-[11px] text-cyan-600 font-mono truncate mt-1">{p.url}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest">
          動画URLを入力 (YouTube / Bilibili)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
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
            className="flex-1 bg-[#09090b] border border-cyan-800 rounded px-4 py-3 text-xs font-mono text-cyan-100 placeholder-cyan-800/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors shadow-inner"
          />
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSimulating ? 'ANALYZING...' : '抽出テスト実行'}</span>
          </button>
        </div>
      </div>

      {/* Extraction & Formatting Result Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Metadata breakdown */}
        <div className="bg-black/60 border border-cyan-900/30 rounded-lg p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-cyan-900/50">
            <span className="font-bold text-cyan-300 uppercase tracking-widest">取得メタデータ</span>
            <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/30 shadow-[0_0_8px_rgba(217,70,239,0.2)]">
              yt-dlp JSON
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-cyan-700 block text-[10px] uppercase tracking-widest mb-0.5">取得タイトル:</span>
              <span className="text-cyan-100 font-medium break-all">{currentPreset.rawTitle}</span>
            </div>
            <div>
              <span className="text-cyan-700 block text-[10px] uppercase tracking-widest mb-0.5">取得投稿者名 (Uploader):</span>
              <span className="text-fuchsia-300 font-bold">{currentPreset.uploader}</span>
            </div>
            <div>
              <span className="text-cyan-700 block text-[10px] uppercase tracking-widest mb-0.5">判別プラットフォーム:</span>
              <span className="text-yellow-400 font-bold">{currentPreset.platform}</span>
            </div>
          </div>
        </div>

        {/* Right: C++ Sanitization & Filename Result */}
        <div className="bg-black/60 border border-cyan-900/30 rounded-lg p-4 space-y-3 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/5 blur-2xl rounded-full"></div>
          <div>
            <div className="flex items-center justify-between text-xs pb-3 border-b border-cyan-900/50">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
                <span>C++ 自動生成ファイル名</span>
              </span>
              <span className="text-[10px] text-cyan-600 font-mono">Windows/Linux/Android</span>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-4 my-4 text-[11px] font-mono uppercase tracking-wide">
              <label className="flex items-center gap-2 text-cyan-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uploaderFirst}
                  onChange={(e) => setUploaderFirst(e.target.checked)}
                  className="rounded border-cyan-700 bg-black text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-black"
                />
                <span className="hover:text-fuchsia-400 transition-colors">「投稿者名 - タイトル」形式</span>
              </label>

              <label className="flex items-center gap-2 text-cyan-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={audioOnly}
                  onChange={(e) => setAudioOnly(e.target.checked)}
                  className="rounded border-cyan-700 bg-black text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-black"
                />
                <span className="hover:text-fuchsia-400 transition-colors">音声のみ (.m4a)</span>
              </label>
            </div>

            {/* Final sanitized filename box */}
            <div className="bg-[#09090b] border border-fuchsia-500/40 rounded p-3 relative shadow-inner">
              <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>
              <div className="text-[10px] text-fuchsia-400 font-mono uppercase tracking-widest pl-2">保存されるファイル名:</div>
              <div className="text-xs font-mono font-bold text-yellow-300 mt-1.5 break-all pl-2">
                {finalFilename}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-cyan-600 flex items-center gap-1 font-mono mt-2">
            <span>禁止文字 (`\/:*?"&lt;&gt;|`) は自動でアンダースコアに安全置換</span>
          </div>
        </div>
      </div>

      {/* Terminal execution simulation */}
      <div className="bg-[#09090b] border border-cyan-900/50 rounded overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="px-4 py-2 bg-black/80 border-b border-cyan-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] inline-block" />
            <span className="font-mono font-bold text-cyan-400 ml-3 uppercase tracking-widest text-[10px]">C++ CLI 実行シミュレーション</span>
          </div>

          <button
            onClick={handleCopyCmd}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 rounded text-[10px] uppercase tracking-widest font-bold font-mono transition-colors border border-cyan-800 cursor-pointer hover:border-cyan-500"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-yellow-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCmd ? 'COPIED' : 'COPY CMD'}</span>
          </button>
        </div>

        <div className="p-5 font-mono text-xs text-cyan-300 space-y-1.5 overflow-x-auto max-h-[250px]">
          <div className="text-yellow-400 font-bold">$ {generatedCommand}</div>
          {terminalLogs.length > 0 ? (
            terminalLogs.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith('[成功]')
                    ? 'text-fuchsia-400 font-bold'
                    : line.startsWith('[ステップ')
                    ? 'text-cyan-400'
                    : line.startsWith('[ffmpeg]')
                    ? 'text-purple-400'
                    : line.startsWith('  生成ファイル名')
                    ? 'text-yellow-300 font-bold'
                    : 'text-cyan-600'
                }
              >
                {line}
              </div>
            ))
          ) : (
            <div className="text-cyan-800 italic">
              上の「抽出テスト実行」ボタンをクリックすると、C++プログラムの実行ログをシミュレートできます。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
