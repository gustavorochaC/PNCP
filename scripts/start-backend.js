const path = require('path');
const { spawn } = require('child_process');

const backendDir = path.join(__dirname, '..', 'backend');
const isWin = process.platform === 'win32';
const python = path.join(backendDir, '.venv', isWin ? 'Scripts\\python.exe' : 'bin/python');
const uvicorn = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false,
});

uvicorn.on('error', (err) => {
  console.error('Backend start failed:', err.message);
  process.exit(1);
});
uvicorn.on('exit', (code) => process.exit(code || 0));
