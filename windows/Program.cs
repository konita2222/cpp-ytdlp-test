using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using System.Text.RegularExpressions;

namespace NextzzDownloader
{
    public class MainForm : Form
    {
        private TextBox txtUrl;
        private ComboBox cmbMode;
        private ComboBox cmbQuality;
        private TextBox txtOutputFolder;
        private Button btnSelectFolder;
        private Button btnDownload;
        private Label lblStatus;
        private ProgressBar progressBar;

        public MainForm()
        {
            this.Text = "Nextzz YouTube Downloader (C# Edition)";
            this.Size = new Size(580, 360);
            this.BackColor = Color.FromArgb(18, 11, 36); // Purple Base
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point, ((byte)(0)));
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;

            // Header
            Label lblTitle = new Label() { Text = "Nextzz Downloader", Location = new Point(24, 20), AutoSize = true, Font = new Font("Segoe UI", 12F, FontStyle.Bold) };
            this.Controls.Add(lblTitle);

            Label lblBadge = new Label() { Text = "C# Native", Location = new Point(190, 24), AutoSize = true, ForeColor = Color.FromArgb(16, 185, 129), BackColor = Color.FromArgb(6, 78, 59), Font = new Font("Segoe UI", 8F, FontStyle.Bold) };
            this.Controls.Add(lblBadge);

            // URL Input
            txtUrl = new TextBox() { Location = new Point(24, 60), Width = 510, BackColor = Color.FromArgb(26, 16, 47), ForeColor = Color.White, BorderStyle = BorderStyle.FixedSingle };
            txtUrl.Text = "https://www.youtube.com/watch?v=";
            this.Controls.Add(txtUrl);

            // Options
            Label lblMode = new Label() { Text = "フォーマット:", Location = new Point(24, 100), AutoSize = true, ForeColor = Color.FromArgb(226, 232, 240) };
            this.Controls.Add(lblMode);
            
            cmbMode = new ComboBox() { Location = new Point(110, 96), Width = 150, DropDownStyle = ComboBoxStyle.DropDownList, BackColor = Color.FromArgb(26, 16, 47), ForeColor = Color.White };
            cmbMode.Items.AddRange(new string[] { "動画 (Video)", "音声 (Audio)" });
            cmbMode.SelectedIndex = 0;
            cmbMode.SelectedIndexChanged += CmbMode_SelectedIndexChanged;
            this.Controls.Add(cmbMode);

            Label lblQuality = new Label() { Text = "品質設定:", Location = new Point(280, 100), AutoSize = true, ForeColor = Color.FromArgb(226, 232, 240) };
            this.Controls.Add(lblQuality);

            cmbQuality = new ComboBox() { Location = new Point(350, 96), Width = 184, DropDownStyle = ComboBoxStyle.DropDownList, BackColor = Color.FromArgb(26, 16, 47), ForeColor = Color.White };
            this.Controls.Add(cmbQuality);
            CmbMode_SelectedIndexChanged(null, null); // Initialize quality options

            // Output Folder
            txtOutputFolder = new TextBox() { Location = new Point(24, 140), Width = 420, BackColor = Color.FromArgb(26, 16, 47), ForeColor = Color.White, BorderStyle = BorderStyle.FixedSingle, ReadOnly = true };
            txtOutputFolder.Text = Environment.GetFolderPath(Environment.SpecialFolder.MyVideos);
            this.Controls.Add(txtOutputFolder);

            btnSelectFolder = new Button() { Text = "保存先", Location = new Point(454, 138), Width = 80, Height = 25, BackColor = Color.FromArgb(55, 65, 81), ForeColor = Color.White, FlatStyle = FlatStyle.Flat };
            btnSelectFolder.FlatAppearance.BorderSize = 0;
            btnSelectFolder.Click += BtnSelectFolder_Click;
            this.Controls.Add(btnSelectFolder);

            // Progress
            progressBar = new ProgressBar() { Location = new Point(24, 190), Width = 510, Height = 14, Style = ProgressBarStyle.Continuous };
            this.Controls.Add(progressBar);

            lblStatus = new Label() { Text = "待機中", Location = new Point(24, 215), AutoSize = true, ForeColor = Color.FromArgb(16, 185, 129), Font = new Font("Segoe UI", 8F, FontStyle.Bold) };
            this.Controls.Add(lblStatus);

            // Download Button
            btnDownload = new Button() { Text = "ダウンロード開始", Location = new Point(24, 250), Width = 510, Height = 40, BackColor = Color.FromArgb(37, 99, 235), ForeColor = Color.White, FlatStyle = FlatStyle.Flat, Font = new Font("Segoe UI", 10F, FontStyle.Bold) };
            btnDownload.FlatAppearance.BorderSize = 0;
            btnDownload.Cursor = Cursors.Hand;
            btnDownload.Click += BtnDownload_Click;
            this.Controls.Add(btnDownload);
        }

        private void CmbMode_SelectedIndexChanged(object sender, EventArgs e)
        {
            cmbQuality.Items.Clear();
            if (cmbMode.SelectedIndex == 1) // Audio
            {
                cmbQuality.Items.AddRange(new string[] { "0 (最高 320k)", "2 (標準 192k)", "5 (軽量 128k)" });
            }
            else // Video
            {
                cmbQuality.Items.AddRange(new string[] { "最高画質", "1080p", "720p" });
            }
            cmbQuality.SelectedIndex = 0;
        }

        private void BtnSelectFolder_Click(object sender, EventArgs e)
        {
            using (FolderBrowserDialog fbd = new FolderBrowserDialog())
            {
                fbd.Description = "保存先フォルダを選択してください";
                if (fbd.ShowDialog() == DialogResult.OK)
                {
                    txtOutputFolder.Text = fbd.SelectedPath;
                }
            }
        }

        private void BtnDownload_Click(object sender, EventArgs e)
        {
            string url = txtUrl.Text.Trim();
            if (string.IsNullOrEmpty(url) || url == "https://www.youtube.com/watch?v=") 
            { 
                SetStatus("URLを入力してください", true); 
                return; 
            }

            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string ytdlpPath = Path.Combine(basePath, "yt-dlp.exe");
            
            if (!File.Exists(ytdlpPath))
            {
                SetStatus("エラー: 同じフォルダに yt-dlp.exe が見つかりません。", true);
                return;
            }

            SetUIState(false);
            progressBar.Value = 0;
            SetStatus("準備中...", false);

            string outputPath = Path.Combine(txtOutputFolder.Text, "%(title)s.%(ext)s");
            string args = "--newline ";

            if (cmbMode.SelectedIndex == 1) // Audio
            {
                string q = cmbQuality.Text.Split(' ')[0];
                args += $"-x --audio-format mp3 --audio-quality {q} -o \"{outputPath}\" ";
            }
            else // Video
            {
                string format = "bv*+ba/b";
                if (cmbQuality.Text == "1080p") format = "bv*[height<=1080]+ba/b[height<=1080]";
                if (cmbQuality.Text == "720p") format = "bv*[height<=720]+ba/b[height<=720]";
                args += $"-f \"{format}\" --merge-output-format mp4 -o \"{outputPath}\" ";
            }
            args += $"\"{url}\"";

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = ytdlpPath;
            psi.Arguments = args;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.StandardOutputEncoding = System.Text.Encoding.UTF8;

            Process proc = new Process();
            proc.StartInfo = psi;

            Regex progressRegex = new Regex(@"\[download\]\s+([0-9\.]+)%");

            proc.OutputDataReceived += (s, ev) => 
            { 
                if (ev.Data != null) 
                {
                    Invoke(new Action(() => {
                        Match m = progressRegex.Match(ev.Data);
                        if (m.Success && double.TryParse(m.Groups[1].Value, out double percent))
                        {
                            progressBar.Value = Math.Min(100, (int)percent);
                            SetStatus($"ダウンロード中: {percent:F1}%", false);
                        }
                        else if (ev.Data.Contains("Destination:"))
                        {
                            SetStatus("ファイル保存中...", false);
                        }
                        else if (ev.Data.Contains("[ExtractAudio]") || ev.Data.Contains("[Merger]"))
                        {
                            SetStatus("変換・結合処理中...", false);
                        }
                    }));
                }
            };

            proc.EnableRaisingEvents = true;
            proc.Exited += (s, ev) => 
            { 
                Invoke(new Action(() => { 
                    if (proc.ExitCode == 0)
                    {
                        progressBar.Value = 100;
                        SetStatus("ダウンロード完了しました。", false); 
                    }
                    else
                    {
                        SetStatus("エラーが発生しました。FFmpegがないか、URLが不正です。", true);
                    }
                    SetUIState(true); 
                })); 
            };

            proc.Start();
            proc.BeginOutputReadLine();
        }

        private void SetStatus(string msg, bool isError)
        {
            lblStatus.Text = msg;
            lblStatus.ForeColor = isError ? Color.FromArgb(239, 68, 68) : Color.FromArgb(16, 185, 129);
        }

        private void SetUIState(bool enabled)
        {
            txtUrl.Enabled = enabled;
            cmbMode.Enabled = enabled;
            cmbQuality.Enabled = enabled;
            btnSelectFolder.Enabled = enabled;
            btnDownload.Enabled = enabled;
            if (enabled) btnDownload.BackColor = Color.FromArgb(37, 99, 235);
            else btnDownload.BackColor = Color.FromArgb(55, 65, 81);
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }
}
