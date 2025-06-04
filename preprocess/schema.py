import os
from pathlib import Path
import shutil
import subprocess
import sys


BASE_DIR = Path(__file__).resolve().parent.parent
SHELL_ENABLE = True if sys.platform.startswith("win") else False


def generate_schemas():
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BASE_DIR / "backend")  # 'app'의 부모 디렉토리

    shutil.rmtree(BASE_DIR / "preprocess/schemas", ignore_errors=True)
    shutil.rmtree(BASE_DIR / "frontend/schemas", ignore_errors=True)

    subprocess.run(
        [sys.executable, "-m", "preprocess.schema_generator"],
        cwd=BASE_DIR,
        env=env,
        check=True,
        shell=SHELL_ENABLE,
    )

    (BASE_DIR / "frontend/types/schemas").mkdir(parents=True, exist_ok=True)

    for schema in (BASE_DIR / "preprocess/preprocess/schemas").rglob("*.schema.json"):
        # 상대 경로 추출 (schemas/ 하위)
        rel_path = schema.relative_to(BASE_DIR / "preprocess/preprocess/schemas")
        name = schema.stem.replace(".schema", "")
        # 출력 경로: frontend/types/schemas/ + 상대 경로 (확장자만 .ts로)
        output_file = (
            BASE_DIR / "frontend/types/schemas" / rel_path.parent / f"{name}.ts"
        )
        output_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            command = f'json-refs resolve "{schema}" | json-schema-to-zod --module esm --name {name}Schema --type {name} | prettier --parser typescript'
            with output_file.open("w") as f:
                subprocess.run(command, shell=True, stdout=f, check=True)
            print(f"Saved zod schema for {schema} to {output_file}")
        except Exception as e:
            print(f"Failed to save zod schema for {schema}", e)


if __name__ == "__main__":
    generate_schemas()
