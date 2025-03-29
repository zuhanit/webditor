#!/bin/bash

cd "$(dirname "$0")"
cd ../preprocess
poetry run python -m terrain.main