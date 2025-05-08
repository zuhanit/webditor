const { execSync } = require("child_process");
const os = require("os");

const isWindows = os.platform().startsWith("win");

const cmd = isWindows
  ? `call backend\\.venv\\Scripts\\activate.bat && cd backend && uvicorn app.main:app --reload --port 8000 --log-level debug --reload-dir ../wengine`
  : `source backend/.venv/bin/activate && cd backend && uvicorn app.main:app --reload --port 8000 --log-level debug --reload-dir ../wengine`;

execSync(cmd, { stdio: "inherit", shell: true });
