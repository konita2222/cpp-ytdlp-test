import sys
import re
import subprocess
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLineEdit, QPushButton, QLabel, 
                             QComboBox, QProgressBar)
from PyQt6.QtCore import QThread, pyqtSignal, Qt

class DownloadThread(QThread):
    progress_signal = pyqtSignal(int)
    status_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(bool, str)

    def __init__(self, url, mode, quality):
        super().__init__()
        self.url = url
        self.mode = mode
        self.quality = quality

    def run(self):
        self.status_signal.emit("ダウンロード準備中...")
        cmd = ["yt-dlp", "--newline"]

        if self.mode == "音声 (Audio)":
            cmd.extend([
                "-x",
                "--audio-format", "mp3",
                "--audio-quality", self.quality,
                "-o", "%(title)s.%(ext)s"
            ])
        else:
            if self.quality == "最高画質":
                f_opt = "bv*+ba/b"
            elif self.quality == "1080p":
                f_opt = "bv*[height<=1080]+ba/b[height<=1080]"
            else:
                f_opt = "bv*[height<=720]+ba/b[height<=720]"
            cmd.extend([
                "-f", f_opt,
                "--merge-output-format", "mp4",
                "-o", "%(title)s.%(ext)s"
            ])

        cmd.append(self.url)

        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            progress_pattern = re.compile(r"\[download\]\s+([0-9\.]+)%")

            for line in process.stdout:
                line = line.strip()
                match = progress_pattern.search(line)
                if match:
                    percent = int(float(match.group(1)))
                    self.progress_signal.emit(percent)
                    self.status_signal.emit(f"ダウンロード中: {percent}%")
                elif "Destination:" in line:
                    self.status_signal.emit("ファイル保存中...")
                elif "[ExtractAudio]" in line or "[Merger]" in line:
                    self.status_signal.emit("変換・結合処理中...")

            process.wait()
            if process.returncode == 0:
                self.progress_signal.emit(100)
                self.finished_signal.emit(True, "ダウンロード完了")
            else:
                self.finished_signal.emit(False, "エラーが発生しました")
        except FileNotFoundError:
            self.finished_signal.emit(False, "yt-dlp または ffmpeg が見つかりません")
        except Exception as e:
            self.finished_signal.emit(False, f"エラー: {str(e)}")

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Nextzz YouTube Downloader")
        self.setFixedSize(560, 310)

        # Theme: Purple(Base) #120B24, Blue(Main) #2563EB, Green(Sub) #10B981
        self.setStyleSheet("""
            QMainWindow {
                background-color: #120B24;
            }
            QWidget {
                background-color: #120B24;
                color: #FFFFFF;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            QLabel {
                font-size: 13px;
                color: #E2E8F0;
            }
            QLabel#title {
                font-size: 18px;
                font-weight: bold;
                color: #FFFFFF;
            }
            QLabel#badge {
                font-size: 11px;
                font-weight: bold;
                color: #10B981;
                background-color: #064E3B;
                padding: 2px 8px;
                border-radius: 4px;
            }
            QLineEdit {
                background-color: #1A102F;
                border: 1px solid #2563EB;
                border-radius: 6px;
                padding: 10px 14px;
                color: #FFFFFF;
                font-size: 13px;
            }
            QLineEdit:focus {
                border: 1px solid #10B981;
            }
            QComboBox {
                background-color: #1A102F;
                border: 1px solid #2563EB;
                border-radius: 6px;
                padding: 6px 12px;
                color: #FFFFFF;
                font-size: 13px;
                min-width: 120px;
            }
            QComboBox:focus {
                border: 1px solid #10B981;
            }
            QComboBox QAbstractItemView {
                background-color: #1A102F;
                border: 1px solid #2563EB;
                color: #FFFFFF;
                selection-background-color: #2563EB;
                selection-color: #FFFFFF;
            }
            QPushButton {
                background-color: #2563EB;
                color: #FFFFFF;
                border: none;
                border-radius: 6px;
                padding: 10px 20px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #1D4ED8;
            }
            QPushButton:disabled {
                background-color: #374151;
                color: #9CA3AF;
            }
            QProgressBar {
                background-color: #1A102F;
                border: 1px solid #2563EB;
                border-radius: 6px;
                text-align: center;
                color: #FFFFFF;
                font-size: 11px;
                font-weight: bold;
                height: 18px;
            }
            QProgressBar::chunk {
                background-color: #10B981;
                border-radius: 5px;
            }
            QLabel#status {
                color: #10B981;
                font-size: 12px;
                font-weight: bold;
            }
        """)

        container = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(28, 24, 28, 24)
        layout.setSpacing(14)

        # Header
        header_layout = QHBoxLayout()
        title = QLabel("Nextzz Downloader")
        title.setObjectName("title")
        badge = QLabel("Phase 2")
        badge.setObjectName("badge")
        header_layout.addWidget(title)
        header_layout.addWidget(badge)
        header_layout.addStretch()
        layout.addLayout(header_layout)

        # URL Input
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("https://www.youtube.com/watch?v=...")
        layout.addWidget(self.url_input)

        # Mode & Quality Selectors
        options_layout = QHBoxLayout()
        options_layout.setSpacing(12)

        mode_box = QVBoxLayout()
        mode_box.setSpacing(4)
        mode_label = QLabel("フォーマット")
        self.mode_combo = QComboBox()
        self.mode_combo.addItems(["動画 (Video)", "音声 (Audio)"])
        self.mode_combo.currentTextChanged.connect(self.on_mode_changed)
        mode_box.addWidget(mode_label)
        mode_box.addWidget(self.mode_combo)
        options_layout.addLayout(mode_box)

        quality_box = QVBoxLayout()
        quality_box.setSpacing(4)
        quality_label = QLabel("品質設定")
        self.quality_combo = QComboBox()
        self.quality_combo.addItems(["最高画質", "1080p", "720p"])
        quality_box.addWidget(quality_label)
        quality_box.addWidget(self.quality_combo)
        options_layout.addLayout(quality_box)

        layout.addLayout(options_layout)

        # Progress Bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)

        # Bottom Controls
        bottom_layout = QHBoxLayout()
        self.status_label = QLabel("待機中")
        self.status_label.setObjectName("status")
        bottom_layout.addWidget(self.status_label)
        bottom_layout.addStretch()

        self.btn_download = QPushButton("ダウンロード開始")
        self.btn_download.clicked.connect(self.start_download)
        bottom_layout.addWidget(self.btn_download)

        layout.addLayout(bottom_layout)

        container.setLayout(layout)
        self.setCentralWidget(container)

    def on_mode_changed(self, mode_text):
        self.quality_combo.clear()
        if mode_text == "音声 (Audio)":
            self.quality_combo.addItems(["0 (最高 320k)", "2 (標準 192k)", "5 (軽量 128k)"])
        else:
            self.quality_combo.addItems(["最高画質", "1080p", "720p"])

    def start_download(self):
        url = self.url_input.text().strip()
        if not url:
            self.status_label.setStyleSheet("color: #EF4444;")
            self.status_label.setText("URLを入力してください")
            return

        self.btn_download.setEnabled(False)
        self.url_input.setEnabled(False)
        self.mode_combo.setEnabled(False)
        self.quality_combo.setEnabled(False)
        self.progress_bar.setValue(0)
        self.status_label.setStyleSheet("color: #10B981;")

        mode = self.mode_combo.currentText()
        raw_quality = self.quality_combo.currentText()
        if mode == "音声 (Audio)":
            quality = raw_quality.split(" ")[0]
        else:
            quality = raw_quality

        self.thread = DownloadThread(url, mode, quality)
        self.thread.progress_signal.connect(self.update_progress)
        self.thread.status_signal.connect(self.update_status)
        self.thread.finished_signal.connect(self.download_finished)
        self.thread.start()

    def update_progress(self, percent):
        self.progress_bar.setValue(percent)

    def update_status(self, text):
        self.status_label.setText(text)

    def download_finished(self, success, message):
        self.btn_download.setEnabled(True)
        self.url_input.setEnabled(True)
        self.mode_combo.setEnabled(True)
        self.quality_combo.setEnabled(True)

        if not success:
            self.status_label.setStyleSheet("color: #EF4444;")
        else:
            self.status_label.setStyleSheet("color: #10B981;")
            self.progress_bar.setValue(100)
        self.status_label.setText(message)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
