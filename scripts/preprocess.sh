#!/bin/bash

cd "$(dirname "$0")"
cd ../preprocess
poetry run python -m terrain.main
poetry run python -m graphics.main --path /Volumes/External/Programming/webditor/preprocess/graphics/anim --output /Volumes/External/Programming/webditor/preprocess/output/anim --sd --hd