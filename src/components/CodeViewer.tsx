import { useState } from 'react';
import { CPP_PROJECT_FILES, ProjectFile } from '../data/cppProjectFiles';
import { Copy, Check, Download, FileCode, FolderArchive, Terminal, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

export function CodeViewer() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(CPP_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files into zip structure
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
      console.error('ZIP generation failed', err);
    } finally {
      setIsZipping(false);
    }
  };

  const categories = [
    { key: 'all', label: 'すべてのファイル' },
    { key: 'cmake', label: 'CMake / ビルド' },
    { key: 'cpp', label: 'C++ 実装 (.cpp)' },
    { key: 'header', label: 'ヘッダー (.hpp)' },
    { key: 'script', label: 'ビルドスクリプト' },
    { key: 'workflow', label: 'GitHub Actions' },
  ];

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = CPP_PROJECT_FILES.filter(
    (f) => activeCategory === 'all' || f.category === activeCategory
  );

  return (
    <div className="bg-[#09090b] border border-cyan-900/50 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col">
      {/* Header Bar */}
      <div className="bg-black/80 px-5 py-4 border-b border-cyan-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/40 border border-cyan-400 rounded text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-cyan-300 font-bold text-base tracking-widest uppercase flex items-center gap-2">
              <span>C++ プロジェクト ソースコード</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 font-mono tracking-widest shadow-[0_0_8px_rgba(217,70,239,0.2)]">
                CMake 3.20+ / C++17
              </span>
            </h3>
            <p className="text-[11px] text-cyan-500/70 mt-0.5 font-mono uppercase tracking-widest">
              Windows / Debian / Android (Termux) 共通ビルド設計
            </p>
          </div>
        </div>

        {/* Global Action: Download Entire ZIP */}
        <button
          id="btn-download-project-zip"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black rounded text-xs font-bold transition-colors shadow-[0_0_15px_rgba(250,204,21,0.4)] cursor-pointer disabled:opacity-50 uppercase tracking-widest"
        >
          <FolderArchive className="w-4 h-4" />
          <span>{isZipping ? 'GENERATING ZIP...' : 'プロジェクト全体をZIPダウンロード'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-black/60 px-5 py-2.5 border-b border-cyan-900/50 flex items-center gap-2 overflow-x-auto text-[10px] uppercase font-bold tracking-widest font-mono">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer border ${
              activeCategory === cat.key
                ? 'bg-cyan-900/40 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                : 'text-cyan-600 border-transparent hover:text-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main split: File List & Code Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
        {/* File selector column */}
        <div className="md:col-span-4 bg-black/40 border-r border-cyan-900/50 p-3 space-y-1 overflow-y-auto max-h-[580px]">
          <div className="text-[10px] font-mono font-bold text-fuchsia-500 uppercase tracking-widest px-2 py-1 mb-2">
            プロジェクト構成 ({filteredFiles.length} ファイル)
          </div>
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-start gap-2.5 cursor-pointer text-xs group relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/40 border border-cyan-400 text-cyan-100 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                    : 'text-cyan-500/80 hover:bg-cyan-900/20 hover:text-cyan-300 border border-transparent'
                }`}
              >
                {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>}
                <div className="mt-0.5 text-cyan-600">
                  {file.category === 'cmake' && <span className="text-yellow-400 font-bold font-mono">⚙</span>}
                  {file.category === 'cpp' && <span className="text-cyan-400 font-bold font-mono">C+</span>}
                  {file.category === 'header' && <span className="text-fuchsia-400 font-bold font-mono">H</span>}
                  {file.category === 'script' && <span className="text-emerald-400 font-bold font-mono">$</span>}
                  {file.category === 'workflow' && <span className="text-blue-400 font-bold font-mono">CI</span>}
                  {file.category === 'docs' && <span className="text-cyan-600 font-bold font-mono">#</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold break-all">{file.path}</div>
                  <div className={`text-[10px] mt-1 ${isSelected ? 'text-cyan-300' : 'text-cyan-700'} tracking-wide line-clamp-2 leading-relaxed`}>
                    {file.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code view column */}
        <div className="md:col-span-8 flex flex-col bg-[#09090b] overflow-hidden">
          {/* File toolbar */}
          <div className="px-4 py-3 bg-black/80 border-b border-cyan-900/50 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-yellow-300 font-bold tracking-widest">{selectedFile.path}</span>
              <span className="text-cyan-800">///</span>
              <span className="text-cyan-500/70 text-[10px] tracking-widest uppercase">{selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-cyan-950 text-cyan-400 rounded text-[10px] uppercase tracking-widest font-bold font-mono transition-colors border border-cyan-800 cursor-pointer hover:border-cyan-500 hover:shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                title="コードをコピー"
              >
                {copied ? <Check className="w-3 h-3 text-yellow-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-fuchsia-950 text-fuchsia-400 rounded text-[10px] uppercase tracking-widest font-bold font-mono transition-colors border border-fuchsia-800 cursor-pointer hover:border-fuchsia-500 hover:shadow-[0_0_8px_rgba(217,70,239,0.4)]"
                title="単体ファイルをダウンロード"
              >
                <Download className="w-3 h-3" />
                <span>SAVE</span>
              </button>
            </div>
          </div>

          {/* Code text */}
          <div className="p-4 overflow-auto max-h-[520px] font-mono text-xs leading-relaxed text-cyan-300">
            <pre className="whitespace-pre">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-cyan-900/20">
                  <span className="table-cell pr-4 text-right select-none text-cyan-800 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
