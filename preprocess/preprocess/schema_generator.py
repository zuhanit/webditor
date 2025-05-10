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
            filename = f"{attr_name}.schema.json"
            path = output_dir / filename
            path.write_text(json.dumps(schema, indent=2, ensure_ascii=False))
            print(f"Saved schema for {attr_name} to {path}")
