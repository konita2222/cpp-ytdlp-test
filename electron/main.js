const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    backgroundColor: '#120B24',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.on('start-download', (event, { url, mode, quality, outputFolder }) => {
  let args = ['--newline'];
  const outputPath = path.join(outputFolder, '%(title)s.%(ext)s');

  if (mode === 'audio') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', quality, '-o', outputPath);
  } else {
    let format = 'bv*+ba/b';
    if (quality === '1080p') format = 'bv*[height<=1080]+ba/b[height<=1080]';
    if (quality === '720p') format = 'bv*[height<=720]+ba/b[height<=720]';
    args.push('-f', format, '--merge-output-format', 'mp4', '-o', outputPath);
  }
  
  args.push(url);

  const process = spawn('yt-dlp', args);

  process.stdout.on('data', (data) => {
    const output = data.toString();
    const progressMatch = output.match(/\[download\]\s+([0-9\.]+)%/);
    if (progressMatch) {
      event.reply('download-progress', { percent: parseFloat(progressMatch[1]), status: `ダウンロード中: ${progressMatch[1]}%` });
    } else if (output.includes('Destination:')) {
      event.reply('download-progress', { status: 'ファイル保存中...' });
    } else if (output.includes('[ExtractAudio]') || output.includes('[Merger]')) {
      event.reply('download-progress', { status: '変換・結合処理中...' });
    }
  });

  process.on('close', (code) => {
    if (code === 0) {
      event.reply('download-complete', { success: true, message: 'ダウンロード完了' });
    } else {
      event.reply('download-complete', { success: false, message: 'エラーが発生しました' });
    }
  });

  process.on('error', (err) => {
    event.reply('download-complete', { success: false, message: 'yt-dlpが見つかりません。' });
  });
});
