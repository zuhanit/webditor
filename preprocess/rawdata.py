import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SHELL_ENABLE = True if sys.platform.startswith("win") else False


def run_preprocess():
    subprocess.run(
        [
            sys.executable,
            "-m",
            "terrain.main",
            "--path",
            "./rawdata/TileSet",
            "--output",
            "../../backend/static/terrain",
        ],
        cwd=BASE_DIR / "preprocess" / "preprocess",
        check=True,
        shell=SHELL_ENABLE,
    )
    subprocess.run(
        [
            sys.executable,
            "-m",
            "graphics.main",
            "--path",
            "./rawdata/anim",
            "--output",
            "../../backend/static/anim",
            "--sd",
            "--hd",
        ],
        cwd=BASE_DIR / "preprocess" / "preprocess",
        check=True,
        shell=SHELL_ENABLE,
    )


if __name__ == "__main__":
    run_preprocess()
