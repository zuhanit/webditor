import subprocess
import shutil
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def run_preprocess():
    subprocess.run(
        ["poetry", "run", "python", "-m", "terrain.main"],
        cwd=BASE_DIR / "preprocess",
        check=True,
    )
    subprocess.run(
        [
            "poetry",
            "run",
            "python",
            "-m",
            "graphics.main",
            "--path",
            "./graphics/anim",
            "--output",
            "../backend/static/anim",
            "--sd",
            "--hd",
        ],
        cwd=BASE_DIR / "preprocess",
        check=True,
    )


def generate_schemas():
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BASE_DIR / "backend")  # 'app'의 부모 디렉토리

    shutil.rmtree(BASE_DIR / "scripts/schemas", ignore_errors=True)
    shutil.rmtree(BASE_DIR / "frontend/schemas", ignore_errors=True)

    subprocess.run(
        ["python", "-m", "scripts.schema_generator"], cwd=BASE_DIR, env=env, check=True
    )

    (BASE_DIR / "frontend/types/schemas").mkdir(parents=True, exist_ok=True)

    for schema in (BASE_DIR / "scripts/schemas").glob("*.schema.json"):
        name = schema.name.replace(".schema.json", "")
        try:
            command = f'json-refs resolve "{schema}" | json-schema-to-zod --module esm --name {name}Schema --type {name} | prettier --parser typescript'
            output_file = BASE_DIR / f"frontend/types/schemas/{name}.ts"
            with output_file.open("w") as f:
                subprocess.run(command, shell=True, stdout=f, check=True)
            print(f"✅ Saved zod schema for {schema} to {output_file}")
        except Exception as e:
            print(f"❌ Failed to save zod schema for {schema}", e)


if __name__ == "__main__":
    run_preprocess()
    generate_schemas()
