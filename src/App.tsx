import { useState } from 'react';
import { Download, Monitor, Terminal, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import { CPP_PROJECT_FILES } from './data/cppProjectFiles';

type Platform = 'windows' | 'linux' | 'android';
type Edition = 'gui' | 'cli';

export default function App() {
  const [platform, setPlatform] = useState<Platform>('windows');
  const [edition, setEdition] = useState<Edition>('gui');
  const [isZipping, setIsZipping] = useState(false);

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    if (p !== 'windows') {
      setEdition('cli');
    }
  };

  const handleDownload = async () => {
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
      a.download = 'media-downloader.zip';
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

  const scrollToDownload = () => {
    document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-cyan-50 font-sans selection:bg-cyan-500/30 relative pb-32">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-[#030303] to-[#030303] z-0"></div>

      {/* Floating Action Button */}
      <button
        onClick={scrollToDownload}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-black text-lg shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
      >
        <Download className="w-6 h-6" />
        <span>今すぐダウンロード</span>
      </button>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-20 mx-auto max-w-4xl space-y-32">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 w-full flex flex-col items-center mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Zap className="w-4 h-4 fill-cyan-400" />
            <span>100% Free & No Ads</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-cyan-300 tracking-tight leading-tight">
            URLを貼るだけ。<br />最高画質ダウンローダー
          </h1>
          <p className="text-cyan-100/70 text-lg md:text-xl max-w-2xl leading-relaxed">
            YouTubeやBilibiliの動画をワンクリックで保存。煩わしい設定は一切不要で、「タイトル - 投稿者名」できれいに自動整理されます。
          </p>
        </section>

        {/* How to use / Features */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-8 rounded-3xl bg-black/40 border border-cyan-900/30 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-cyan-900/40 flex items-center justify-center mx-auto mb-6 text-cyan-400 font-black text-2xl border border-cyan-500/20">1</div>
            <h3 className="text-lg font-bold text-white mb-3">URLをコピー</h3>
            <p className="text-sm text-cyan-200/60 leading-relaxed">保存したい動画のURLをブラウザやアプリからコピーします。</p>
          </div>
          <div className="p-8 rounded-3xl bg-black/40 border border-cyan-900/30 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-cyan-900/40 flex items-center justify-center mx-auto mb-6 text-cyan-400 font-black text-2xl border border-cyan-500/20">2</div>
            <h3 className="text-lg font-bold text-white mb-3">アプリに入力</h3>
            <p className="text-sm text-cyan-200/60 leading-relaxed">専用の画面を開き、コピーしたURLをそのまま貼り付けます。</p>
          </div>
          <div className="p-8 rounded-3xl bg-black/40 border border-cyan-900/30 backdrop-blur-md">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6 text-cyan-300 font-black text-2xl border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">3</div>
            <h3 className="text-lg font-bold text-white mb-3">自動で保存完了</h3>
            <p className="text-sm text-cyan-200/60 leading-relaxed">画質や音質が自動で最高設定になり、PCやスマホに保存されます。</p>
          </div>
        </section>

        {/* Download Section */}
        <section id="download-section" className="w-full max-w-2xl flex flex-col items-center p-8 md:p-12 rounded-[2rem] bg-black/60 border border-cyan-900/50 shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

          <h2 className="text-3xl font-black text-white mb-10 text-center tracking-tight">ダウンロード</h2>

          {/* Platform Selector */}
          <div className="w-full space-y-4 mb-8">
            <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest text-center">1. お使いの端末を選択</label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#030303] border border-cyan-900/40 rounded-2xl">
              <button onClick={() => handlePlatformChange('windows')} className={`flex flex-col items-center gap-3 py-4 rounded-xl transition-all ${platform === 'windows' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent'}`}><Monitor className="w-6 h-6" /> <span className="text-sm font-bold">Windows</span></button>
              <button onClick={() => handlePlatformChange('linux')} className={`flex flex-col items-center gap-3 py-4 rounded-xl transition-all ${platform === 'linux' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent'}`}><Terminal className="w-6 h-6" /> <span className="text-sm font-bold">Linux</span></button>
              <button onClick={() => handlePlatformChange('android')} className={`flex flex-col items-center gap-3 py-4 rounded-xl transition-all ${platform === 'android' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent'}`}><Smartphone className="w-6 h-6" /> <span className="text-sm font-bold">Android</span></button>
            </div>
          </div>

          {/* Edition Selector */}
          <div className="w-full space-y-4 mb-10">
            <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest text-center">2. 画面のタイプを選択</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#030303] border border-cyan-900/40 rounded-2xl">
              <button onClick={() => setEdition('gui')} disabled={platform !== 'windows'} className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed ${edition === 'gui' && platform === 'windows' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent'}`}>
                <span className="text-sm font-bold">GUI (ウィンドウ操作)</span>
              </button>
              <button onClick={() => setEdition('cli')} className={`flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${edition === 'cli' ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent'}`}>
                <span className="text-sm font-bold">CLI (黒い画面)</span>
              </button>
            </div>
          </div>

          {/* Instruction Panel */}
          <div className="w-full bg-[#030303] rounded-2xl border border-cyan-900/30 p-6 mb-8 text-left">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              インストール手順
            </h4>
            {platform === 'windows' && edition === 'gui' && (
              <ol className="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ページ下のボタンからZIPをダウンロードし「すべて展開」します。</li>
                <li>ネットから <code className="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">yt-dlp.exe</code> と <code className="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">ffmpeg.exe</code> をダウンロードし、展開したフォルダに入れます。</li>
                <li><code className="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">start_windows_gui.bat</code> をダブルクリックすると画面が開きます。</li>
              </ol>
            )}
            {platform === 'windows' && edition === 'cli' && (
              <ol className="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ページ下のボタンからZIPをダウンロードし「すべて展開」します。</li>
                <li>フォルダ内の <code className="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">scripts/build_windows.bat</code> をダブルクリックします。</li>
                <li>自動で準備が完了し、コマンドラインから利用可能になります。</li>
              </ol>
            )}
            {platform === 'linux' && (
              <ol className="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ZIPをダウンロードし、展開します。</li>
                <li>ターミナルで展開したフォルダを開きます。</li>
                <li><code className="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">bash scripts/build_linux.sh</code> を実行すると全自動で完了します。</li>
              </ol>
            )}
            {platform === 'android' && (
              <ol className="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>F-Droidから「Termux」アプリをインストールします。</li>
                <li>ZIPをスマホにダウンロードして展開します。</li>
                <li>Termux内でCMakeを使ってビルドします。</li>
              </ol>
            )}
          </div>

          {/* Download Action Button */}
          <button
            onClick={handleDownload}
            disabled={isZipping}
            className="w-full flex items-center justify-center gap-3 py-5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-6 h-6" />
            {isZipping ? '準備中...' : 'ファイルをダウンロードする'}
          </button>

        </section>
      </main>
    </div>
  );
}
