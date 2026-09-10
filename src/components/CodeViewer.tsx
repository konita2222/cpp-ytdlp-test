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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base tracking-wide flex items-center gap-2">
              <span>C++ プロジェクト ソースコード</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                CMake 3.20+ / C++17
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Windows / Debian / Android (Termux) 共通ビルド設計
            </p>
          </div>
        </div>

        {/* Global Action: Download Entire ZIP */}
        <button
          id="btn-download-project-zip"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
        >
          <FolderArchive className="w-4 h-4" />
          <span>{isZipping ? 'ZIP生成中...' : 'プロジェクト全体をZIPダウンロード'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat.key
                ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main split: File List & Code Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
        {/* File selector column */}
        <div className="md:col-span-4 bg-slate-950/40 border-r border-slate-800/80 p-3 space-y-1 overflow-y-auto max-h-[580px]">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1">
            プロジェクト構成 ({filteredFiles.length} ファイル)
          </div>
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="mt-0.5 text-slate-400">
                  {file.category === 'cmake' && <span className="text-amber-400 font-bold">⚙</span>}
                  {file.category === 'cpp' && <span className="text-cyan-400 font-bold">C+</span>}
                  {file.category === 'header' && <span className="text-purple-400 font-bold">H</span>}
                  {file.category === 'script' && <span className="text-emerald-400 font-bold">$</span>}
                  {file.category === 'workflow' && <span className="text-blue-400 font-bold">CI</span>}
                  {file.category === 'docs' && <span className="text-slate-400 font-bold">#</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-medium truncate">{file.path}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {file.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code view column */}
        <div className="md:col-span-8 flex flex-col bg-slate-900/90 overflow-hidden">
          {/* File toolbar */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-slate-200 font-medium">{selectedFile.path}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors border border-slate-700 cursor-pointer"
                title="コードをコピー"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー済み' : 'コピー'}</span>
              </button>
              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors border border-slate-700 cursor-pointer"
                title="単体ファイルをダウンロード"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </div>

          {/* Code text */}
          <div className="p-4 overflow-auto max-h-[520px] font-mono text-xs leading-relaxed text-slate-300">
            <pre className="whitespace-pre">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-800/30">
                  <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px]">
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
