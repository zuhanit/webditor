#!/bin/bash

python -m scripts.schema_generator

mkdir -p ./frontend/types/schemas

for file in scripts/schemas/*.schema.json; do
  filename=$(basename "$file" .schema.json)
  json2ts "./scripts/schemas/$filename.schema.json" -o "./frontend/types/schemas/$filename.d.ts"
done