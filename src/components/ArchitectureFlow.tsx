import { CheckCircle2, ArrowRight, Layers, Cpu, FileText, Music, Sparkles } from 'lucide-react';

export function ArchitectureFlow() {
  const steps = [
    {
      num: '01',
      title: 'URL入力 & プラットフォーム判定',
      desc: 'YouTube / Bilibili を自動認識。短縮リンク(b23.tv, youtu.be)も内部で透過的に解決。',
      tech: 'C++ std::string / std::regex',
      color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
    },
    {
      num: '02',
      title: 'yt-dlp メタデータ抽出',
      desc: '動画本体をダウンロードせず、--dump-single-json で高速に「title」と「uploader」のみ抽出。',
      tech: 'yt-dlp + nlohmann::json',
      color: 'border-fuchsia-500/50 bg-fuchsia-950/30 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.2)]',
    },
    {
      num: '03',
      title: 'ファイル名サニタイズ & 結合',
      desc: '禁止文字 (\\/:*?"<>|) を除去し、「タイトル - 投稿者名.mp4」を安全に生成。',
      tech: 'C++ 文字列クリーニング',
      color: 'border-yellow-500/50 bg-yellow-950/30 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]',
    },
    {
      num: '04',
      title: 'FFmpeg 最高画質マージ',
      desc: '最高画質映像ストリームと最高音質オーディオストリームをロスレス結合して保存。',
      tech: 'FFmpeg --prefer-ffmpeg',
      color: 'border-purple-500/50 bg-purple-950/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    },
  ];

  return (
    <div className="bg-black/60 border border-cyan-900/50 rounded-lg p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50">
        <div>
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-5 h-5 text-fuchsia-500" />
            <span>アーキテクチャ & パイプライン設計</span>
          </h3>
          <p className="text-xs text-cyan-200/70 mt-1 font-mono">
            C++から yt-dlp と FFmpeg を制御する全体のデータフロー
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className={`border rounded-lg p-4 space-y-3 flex flex-col justify-between relative ${s.color} transition-all hover:scale-[1.02]`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold tracking-widest uppercase">STEP {s.num}</span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-4 h-4 text-cyan-700 absolute -right-2.5 top-6 z-10 bg-black rounded-full" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-100 mt-2">{s.title}</h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>

            <div className="pt-3 border-t border-current/30 mt-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-1 rounded bg-black/50 border border-current/30">
                {s.tech}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-platform & Open Source Philosophy callout */}
      <div className="bg-[#09090b] border border-cyan-900/50 rounded p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs shadow-inner">
        <div className="space-y-1.5 relative">
          <div className="font-bold text-yellow-400 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" />
            <span>完全無料 & オープンソース</span>
          </div>
          <p className="text-cyan-100/70 text-[11px] leading-relaxed font-mono pl-6">
            商用SDKや有料ツールは一切不使用。GCC/MSVC/Clang、CMake、yt-dlp、FFmpeg、nlohmann/jsonすべてFOSSです。
          </p>
        </div>

        <div className="space-y-1.5 relative md:border-l border-cyan-900/50 md:pl-5">
          <div className="font-bold text-fuchsia-400 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" />
            <span>依存ライブラリの自動解決</span>
          </div>
          <p className="text-cyan-100/70 text-[11px] leading-relaxed font-mono pl-6">
            CMake の FetchContent 機能を採用。手動でjsonライブラリをダウンロード・配置する必要がありません。
          </p>
        </div>

        <div className="space-y-1.5 relative md:border-l border-cyan-900/50 md:pl-5">
          <div className="font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" />
            <span>文字化け・ファイル名破損防止</span>
          </div>
          <p className="text-cyan-100/70 text-[11px] leading-relaxed font-mono pl-6">
            WindowsコンソールでのUTF-8コードページ設定と各OSファイルシステムに配慮したサニタイズ処理を実装。
          </p>
        </div>
      </div>
    </div>
  );
}
