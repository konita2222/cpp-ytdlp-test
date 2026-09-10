import { CheckCircle2, ArrowRight, Layers, Cpu, FileText, Music, Sparkles } from 'lucide-react';

export function ArchitectureFlow() {
  const steps = [
    {
      num: '01',
      title: 'URL入力 & プラットフォーム判定',
      desc: 'YouTube / Bilibili を自動認識。短縮リンク(b23.tv, youtu.be)も内部で透過的に解決。',
      tech: 'C++ std::string / std::regex',
      color: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    },
    {
      num: '02',
      title: 'yt-dlp メタデータ抽出',
      desc: '動画本体をダウンロードせず、--dump-single-json で高速に「title」と「uploader」のみ抽出。',
      tech: 'yt-dlp + nlohmann::json',
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    },
    {
      num: '03',
      title: 'ファイル名サニタイズ & 結合',
      desc: '禁止文字 (\\/:*?"<>|) を除去し、「タイトル - 投稿者名.mp4」を安全に生成。',
      tech: 'C++ 文字列クリーニング',
      color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    },
    {
      num: '04',
      title: 'FFmpeg 最高画質マージ',
      desc: '最高画質映像ストリームと最高音質オーディオストリームをロスレス結合して保存。',
      tech: 'FFmpeg --prefer-ffmpeg',
      color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>アーキテクチャ & パイプライン設計</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            C++から yt-dlp と FFmpeg を制御する全体のデータフロー
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => (
          <div
            key={s.num}
            className={`border rounded-lg p-4 space-y-3 flex flex-col justify-between relative ${s.color}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold opacity-80">STEP {s.num}</span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600 absolute -right-2.5 top-6 z-10 bg-slate-900 rounded-full" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mt-2">{s.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                {s.tech}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-platform & Open Source Philosophy callout */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>完全無料 & オープンソース</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            商用SDKや有料ツールは一切不使用。GCC/MSVC/Clang、CMake、yt-dlp、FFmpeg、nlohmann/jsonすべてFOSSです。
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>依存ライブラリの自動解決</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            CMake の FetchContent 機能を採用。手動でjsonライブラリをダウンロード・配置する必要がありません。
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>文字化け・ファイル名破損防止</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            WindowsコンソールでのUTF-8コードページ設定と各OSファイルシステムに配慮したサニタイズ処理を実装。
          </p>
        </div>
      </div>
    </div>
  );
}
