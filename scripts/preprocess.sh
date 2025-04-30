#!/bin/bash

cd "$(dirname "$0")"
cd ../preprocess
poetry run python -m terrain.main
poetry run python -m graphics.main --path ./graphics/anim --output ../backend/app/static/anim --sd --hd