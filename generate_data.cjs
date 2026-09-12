const fs = require('fs');

const files = [
  { src: 'README.md', dest: 'README.md' },
  { src: 'electron/package.json', dest: 'electron/package.json' },
  { src: 'electron/main.js', dest: 'electron/main.js' },
  { src: 'electron/index.html', dest: 'electron/index.html' },
  { src: 'electron/style.css', dest: 'electron/style.css' },
  { src: 'electron/renderer.js', dest: 'electron/renderer.js' },
  { src: 'windows/Program.cs', dest: 'windows-native/Program.cs' },
  { src: 'windows/start_windows_gui.bat', dest: 'windows-native/start_windows_gui.bat' },
  { src: 'linux/app.py', dest: 'linux-native/app.py' },
  { src: 'linux/build_deb.sh', dest: 'linux-native/build_deb.sh' }
];

const cppProjectFiles = [];
for (const file of files) {
  if (fs.existsSync(file.src)) {
    cppProjectFiles.push({
      path: file.dest,
      content: fs.readFileSync(file.src, 'utf8')
    });
  }
}

fs.writeFileSync('data.json', JSON.stringify(cppProjectFiles, null, 2));
