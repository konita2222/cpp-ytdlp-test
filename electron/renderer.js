const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('url-input');
const modeSelect = document.getElementById('mode-select');
const qualitySelect = document.getElementById('quality-select');
const outputFolderInput = document.getElementById('output-folder');
const btnFolder = document.getElementById('btn-folder');
const btnDownload = document.getElementById('btn-download');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');

let currentOutputFolder = '';

modeSelect.addEventListener('change', () => {
  qualitySelect.innerHTML = '';
  if (modeSelect.value === 'audio') {
    qualitySelect.add(new Option('0 (最高 320k)', '0'));
    qualitySelect.add(new Option('2 (標準 192k)', '2'));
    qualitySelect.add(new Option('5 (軽量 128k)', '5'));
  } else {
    qualitySelect.add(new Option('最高画質', 'best'));
    qualitySelect.add(new Option('1080p', '1080p'));
    qualitySelect.add(new Option('720p', '720p'));
  }
});

btnFolder.addEventListener('click', async () => {
  const folderPath = await ipcRenderer.invoke('select-folder');
  if (folderPath) {
    currentOutputFolder = folderPath;
    outputFolderInput.value = folderPath;
  }
});

btnDownload.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) {
    statusText.textContent = 'URLを入力してください';
    statusText.className = 'status-text error-text';
    return;
  }
  if (!currentOutputFolder) {
    statusText.textContent = '保存先フォルダを選択してください';
    statusText.className = 'status-text error-text';
    return;
  }

  setUIState(false);
  progressFill.style.width = '0%';
  statusText.textContent = '準備中...';
  statusText.className = 'status-text';

  ipcRenderer.send('start-download', {
    url,
    mode: modeSelect.value,
    quality: qualitySelect.value,
    outputFolder: currentOutputFolder
  });
});

ipcRenderer.on('download-progress', (event, { percent, status }) => {
  if (percent !== undefined) progressFill.style.width = `${percent}%`;
  if (status) statusText.textContent = status;
});

ipcRenderer.on('download-complete', (event, { success, message }) => {
  setUIState(true);
  statusText.textContent = message;
  statusText.className = success ? 'status-text' : 'status-text error-text';
  if (success) progressFill.style.width = '100%';
});

function setUIState(enabled) {
  urlInput.disabled = !enabled;
  modeSelect.disabled = !enabled;
  qualitySelect.disabled = !enabled;
  btnFolder.disabled = !enabled;
  btnDownload.disabled = !enabled;
}
