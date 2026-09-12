#!/bin/bash
set -e

PKG_NAME="nextzz-downloader"
PKG_VER="1.0.0"
ARCH="all"
BUILD_DIR="${PKG_NAME}_${PKG_VER}_${ARCH}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/DEBIAN"
mkdir -p "$BUILD_DIR/usr/bin"
mkdir -p "$BUILD_DIR/usr/share/$PKG_NAME"
mkdir -p "$BUILD_DIR/usr/share/applications"

# DEBIAN/control
cat << 'EOC' > "$BUILD_DIR/DEBIAN/control"
Package: nextzz-downloader
Version: 1.0.0
Section: utils
Priority: optional
Architecture: all
Depends: python3, python3-pyqt6, yt-dlp, ffmpeg
Maintainer: Nextzz Software
Description: Lightweight YouTube Downloader powered by PyQt and yt-dlp
EOC

# app.py
cat << 'EOP' > "$BUILD_DIR/usr/share/$PKG_NAME/app.py"
import sys
import subprocess
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLineEdit, QPushButton, QLabel)
from PyQt6.QtCore import QThread, pyqtSignal

class DownloadThread(QThread):
    finished_signal = pyqtSignal(bool, str)
    status_signal = pyqtSignal(str)

    def __init__(self, url):
        super().__init__()
        self.url = url

    def run(self):
        self.status_signal.emit("ダウンロード中...")
        cmd = [
            "yt-dlp",
            "-f", "b",
            "-o", "%(title)s.%(ext)s",
            self.url
        ]
        try:
            process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if process.returncode == 0:
                self.finished_signal.emit(True, "完了しました")
            else:
                self.finished_signal.emit(False, "エラーが発生しました")
        except FileNotFoundError:
            self.finished_signal.emit(False, "yt-dlp が見つかりません")

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Nextzz YouTube Downloader")
        self.setFixedSize(520, 200)

        self.setStyleSheet("""
            QMainWindow { background-color: #120B24; }
            QWidget { background-color: #1A102F; color: #FFFFFF; font-family: sans-serif; }
            QLineEdit { background-color: #0E071A; border: 1px solid #2563EB; border-radius: 6px; padding: 8px 12px; color: #FFFFFF; font-size: 13px; }
            QLineEdit:focus { border: 1px solid #10B981; }
            QPushButton { background-color: #2563EB; color: #FFFFFF; border: none; border-radius: 6px; padding: 8px 16px; font-weight: bold; font-size: 13px; }
            QPushButton:hover { background-color: #1D4ED8; }
            QPushButton:disabled { background-color: #374151; color: #9CA3AF; }
            QLabel#status { color: #10B981; font-size: 12px; }
        """)

        container = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        title = QLabel("YouTube Video Downloader")
        title.setStyleSheet("font-size: 16px; font-weight: bold; color: #FFFFFF;")
        layout.addWidget(title)

        input_layout = QHBoxLayout()
        input_layout.setSpacing(8)

        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("https://www.youtube.com/watch?v=...")
        input_layout.addWidget(self.url_input)

        self.btn_download = QPushButton("ダウンロード")
        self.btn_download.clicked.connect(self.start_download)
        input_layout.addWidget(self.btn_download)

        layout.addLayout(input_layout)

        self.status_label = QLabel("待機中")
        self.status_label.setObjectName("status")
        layout.addWidget(self.status_label)

        container.setLayout(layout)
        self.setCentralWidget(container)

    def start_download(self):
        url = self.url_input.text().strip()
        if not url:
            self.status_label.setStyleSheet("color: #EF4444;")
            self.status_label.setText("URLを入力してください")
            return

        self.btn_download.setEnabled(False)
        self.url_input.setEnabled(False)
        self.status_label.setStyleSheet("color: #10B981;")

        self.thread = DownloadThread(url)
        self.thread.status_signal.connect(self.update_status)
        self.thread.finished_signal.connect(self.download_finished)
        self.thread.start()

    def update_status(self, text):
        self.status_label.setText(text)

    def download_finished(self, success, message):
        self.btn_download.setEnabled(True)
        self.url_input.setEnabled(True)
        if not success:
            self.status_label.setStyleSheet("color: #EF4444;")
        else:
            self.status_label.setStyleSheet("color: #10B981;")
        self.status_label.setText(message)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
EOP

# /usr/bin launcher
cat << 'EOB' > "$BUILD_DIR/usr/bin/$PKG_NAME"
#!/bin/bash
exec python3 /usr/share/nextzz-downloader/app.py "$@"
EOB
chmod +x "$BUILD_DIR/usr/bin/$PKG_NAME"

# .desktop entry
cat << 'EOD' > "$BUILD_DIR/usr/share/applications/$PKG_NAME.desktop"
[Desktop Entry]
Name=Nextzz YouTube Downloader
Exec=nextzz-downloader
Type=Application
Categories=Utility;AudioVideo;
Terminal=false
EOD

dpkg-deb --build "$BUILD_DIR"
echo "Build complete: ${BUILD_DIR}.deb"
