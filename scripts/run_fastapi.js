import { execSync } from "child_process";
import os from "os";

const isWindows = os.platform().startsWith("win");

const cmd = isWindows
  ? `call backend\\.venv\\Scripts\\activate.bat && cd backend && uvicorn app.main:app --reload --port 8000 --log-level debug --reload-dir ../wengine --reload-dir .`
  : `source backend/.venv/bin/activate && cd backend && uvicorn app.main:app --reload --port 8000 --log-level debug --reload-dir ../wengine --reload-dir .`;

execSync(cmd, { stdio: "inherit", shell: true });
