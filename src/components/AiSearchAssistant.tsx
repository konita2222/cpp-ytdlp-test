import { useState } from 'react';
import { Bot, Send, Search, ExternalLink, Sparkles, Loader2, HelpCircle } from 'lucide-react';

interface GroundingSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: GroundingSource[];
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  'Bilibili の動画で高画質 (1080p/4K) を取得するための yt-dlp オプションや注意点は？',
  'Windows で CMake や ffmpeg が「コマンドが見つかりません」となる時の対処法は？',
  'Android (Termux) でダウンロードした動画をスマホのギャラリーに表示させる方法は？',
  'C++17の std::filesystem でパスを扱う際の Windows と Linux のスラッシュの違いは？',
];

export function AiSearchAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'こんにちは！C++、CMake、yt-dlp、FFmpeg のクロスプラットフォーム開発に関する質問を何でもどうぞ。Google検索グラウンディングにより最新のパッケージ情報やツールの使用法を回答します。',
      timestamp: 'たった今',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AIアシスタントの応答に失敗しました。');
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `エラーが発生しました: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>AI ビルド & 技術アシスタント</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono flex items-center gap-1">
                <Search className="w-3 h-3" />
                Google Search Grounding 有効
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              yt-dlp、FFmpeg、CMakeエラー、Debian/Windows/Termuxの疑問を検索連携で解決
            </p>
          </div>
        </div>
      </div>

      {/* Suggested queries */}
      <div>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
          よくある質問（クリックして即座に質問）
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-left text-xs p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="line-clamp-1">💡 {q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 max-h-[380px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 px-1">
              <span>{m.sender === 'user' ? 'あなた' : 'AIアシスタント'}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400 font-medium block mb-1">
                    参照されたウェブ情報ソース (Google Search):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="max-w-[200px] truncate">{s.title || s.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>最新情報をGoogle検索で調査しながら回答を生成しています...</span>
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="C++、CMake、yt-dlp、FFmpeg、ビルドエラーについて質問を入力..."
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>送信</span>
        </button>
      </div>
    </div>
  );
}
