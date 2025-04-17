#!/bin/bash

python -m scripts.schema_generator

rm -rf "./frontend/schemas/**/*"
rm -rf "./scripts/schemas/**/*"
mkdir -p ./frontend/types/schemas

for file in scripts/schemas/*.schema.json; do
  filename=$(basename "$file" .schema.json)
  echo "Generating schema $filename"
  json-refs resolve "./scripts/schemas/$filename.schema.json" | json-schema-to-zod --module esm --name ${filename}Schema --type $filename | prettier --parser typescript > "./frontend/types/schemas/$filename.ts"
done