document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    let platform = 'windows';
    let edition = 'gui';
    let projectFiles = [];

    // Elements
    const platformBtns = document.querySelectorAll('.platform-btn');
    const editionBtns = document.querySelectorAll('.edition-btn');
    const instructionContent = document.getElementById('instruction-content');
    const downloadBtn = document.getElementById('main-download-btn');
    const downloadText = document.getElementById('download-text');
    const fabDownload = document.getElementById('fab-download');

    // Fetch data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            projectFiles = data;
        })
        .catch(error => {
            console.error('Error loading data.json:', error);
            alert('ファイルの読み込みに失敗しました。リロードしてください。');
        });

    function updateUI() {
        // Update Platform Buttons
        platformBtns.forEach(btn => {
            if (btn.dataset.platform === platform) {
                btn.className = "platform-btn flex flex-col items-center gap-3 py-4 rounded-xl transition-all bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
            } else {
                btn.className = "platform-btn flex flex-col items-center gap-3 py-4 rounded-xl transition-all text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent";
            }
        });

        // Update Edition Buttons
        editionBtns.forEach(btn => {
            if (btn.dataset.edition === 'gui') {
                if (platform !== 'windows') {
                    btn.disabled = true;
                    btn.className = "edition-btn flex items-center justify-center gap-2 py-4 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed text-cyan-700 border border-transparent";
                } else {
                    btn.disabled = false;
                    if (edition === 'gui') {
                        btn.className = "edition-btn flex items-center justify-center gap-2 py-4 rounded-xl transition-all bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
                    } else {
                        btn.className = "edition-btn flex items-center justify-center gap-2 py-4 rounded-xl transition-all text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent";
                    }
                }
            } else if (btn.dataset.edition === 'cli') {
                if (edition === 'cli') {
                    btn.className = "edition-btn flex items-center justify-center gap-2 py-4 rounded-xl transition-all bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
                } else {
                    btn.className = "edition-btn flex items-center justify-center gap-2 py-4 rounded-xl transition-all text-cyan-700 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent";
                }
            }
        });

        // Update Instructions
        let html = '';
        if (platform === 'windows' && edition === 'gui') {
            html = `
            <ol class="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ページ下のボタンからZIPをダウンロードし「すべて展開」します。</li>
                <li>ネットから <code class="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">yt-dlp.exe</code> と <code class="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">ffmpeg.exe</code> をダウンロードし、展開したフォルダに入れます。</li>
                <li><code class="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">start_windows_gui.bat</code> をダブルクリックすると画面が開きます。</li>
            </ol>`;
        } else if (platform === 'windows' && edition === 'cli') {
            html = `
            <ol class="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ページ下のボタンからZIPをダウンロードし「すべて展開」します。</li>
                <li>フォルダ内の <code class="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">scripts/build_windows.bat</code> をダブルクリックします。</li>
                <li>自動で準備が完了し、コマンドラインから利用可能になります。</li>
            </ol>`;
        } else if (platform === 'linux') {
            html = `
            <ol class="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>ZIPをダウンロードし、展開します。</li>
                <li>ターミナルで展開したフォルダを開きます。</li>
                <li><code class="text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/50">bash scripts/build_linux.sh</code> を実行すると全自動で完了します。</li>
            </ol>`;
        } else if (platform === 'android') {
            html = `
            <ol class="space-y-3 text-sm text-cyan-100/70 leading-relaxed list-decimal list-inside marker:text-cyan-500 marker:font-bold">
                <li>F-Droidから「Termux」アプリをインストールします。</li>
                <li>ZIPをスマホにダウンロードして展開します。</li>
                <li>Termux内でCMakeを使ってビルドします。</li>
            </ol>`;
        }
        instructionContent.innerHTML = html;
    }

    // Event Listeners
    platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.platform;
            platform = p;
            if (p !== 'windows') {
                edition = 'cli';
            }
            updateUI();
        });
    });

    editionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            edition = btn.dataset.edition;
            updateUI();
        });
    });

    fabDownload.addEventListener('click', () => {
        document.getElementById('download-section').scrollIntoView({ behavior: 'smooth' });
    });

    downloadBtn.addEventListener('click', async () => {
        if (projectFiles.length === 0) {
            alert("データの読み込み中です。少々お待ちください。");
            return;
        }

        try {
            downloadBtn.disabled = true;
            downloadText.textContent = '準備中...';
            
            const zip = new JSZip();
            for (const file of projectFiles) {
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
            alert("ZIPの生成に失敗しました。");
        } finally {
            downloadBtn.disabled = false;
            downloadText.textContent = 'ファイルをダウンロードする';
        }
    });

    // Init
    updateUI();
});
