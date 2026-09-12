const fs = require('fs');

const files = [
  { src: 'README.md', dest: 'README.md' },
  { src: 'windows/Program.cs', dest: 'windows/Program.cs' },
  { src: 'windows/start_windows_gui.bat', dest: 'windows/start_windows_gui.bat' },
  { src: 'linux/app.py', dest: 'linux/app.py' },
  { src: 'linux/build_deb.sh', dest: 'linux/build_deb.sh' }
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
