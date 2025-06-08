import pkgutil
import importlib
import inspect
import json
from pathlib import Path
from pydantic import BaseModel

# Define the base module path
BASE_MODULE = "backend.app.models"

# Import the base module
base_module = importlib.import_module(BASE_MODULE)

# Create an output directory
output_dir = Path(__file__).parent / "schemas"
output_dir.mkdir(parents=True, exist_ok=True)

# Recursively generate and save individual schema files
for finder, name, ispkg in pkgutil.walk_packages(
    base_module.__path__, prefix=BASE_MODULE + "."
):
    module = importlib.import_module(name)
    for attr_name in dir(module):
        attr = getattr(module, attr_name)
        if (
            inspect.isclass(attr)
            and issubclass(attr, BaseModel)
            and attr is not BaseModel
        ):
            schema = attr.model_json_schema()
            # 모듈 경로에서 BASE_MODULE 이후 부분 추출
            if name == BASE_MODULE:
                rel_module = ""
            else:
                rel_module = name[len(BASE_MODULE) + 1 :]  # 예: 'user', 'project.item'
            # 폴더 경로로 변환 (마지막 요소는 파일명으로 사용)
            parts = rel_module.split(".") if rel_module else []
            if len(parts) > 1:
                folder_path = "/".join(parts[:-1])  # 마지막은 파일명(클래스명)
            elif len(parts) == 1:
                folder_path = parts[0]
            else:
                folder_path = ""
            target_dir = output_dir / folder_path
            target_dir.mkdir(parents=True, exist_ok=True)
            filename = f"{attr_name}.schema.json"
            path = target_dir / filename
            path.write_text(json.dumps(schema, indent=2, ensure_ascii=False))
            print(f"Saved schema for {attr_name} to {path}")
