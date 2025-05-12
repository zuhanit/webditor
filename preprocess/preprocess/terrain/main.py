from concurrent.futures import ProcessPoolExecutor
from .scterrain import Tilesets
from .terrain_analyzer import TerrainAnalyzer
from typing import cast
from pathlib import Path
import os
import gzip
import json
import argparse


def process_tileset(tileset: str, input_path: str, output: str):
    TA = TerrainAnalyzer(input_path, cast(Tilesets, tileset))
    output_path = f"{output}/{tileset}"
    os.makedirs(output_path, exist_ok=True)

    binary_path = f"{output_path}/megatile_color.bin"
    compressed_path = f"{output_path}/megatile_color.gz"

    with open(binary_path, "wb") as f:
        g = TA.get_megatile_colors()
        f.write(g)

    with open(binary_path, "rb") as f_in:
        with gzip.open(compressed_path, "wb") as f_out:
            f_out.writelines(f_in)


def process_group_table(tileset: str, input_path: str, output: str):
    TA = TerrainAnalyzer(input_path, cast(Tilesets, tileset))
    output_path = f"{output}/{tileset}"
    os.makedirs(output_path, exist_ok=True)

    binary_path = f"{output_path}/cv5_group.json"

    with open(binary_path, "w") as f:
        g = TA.get_group_table()
        json.dump(g, f)


parser = argparse.ArgumentParser(
    description="Extract terrain data from StarCraft: Remastered terrain files."
)
parser.add_argument(
    "--path",
    "-p",
    type=Path,
    required=True,
    help="folder path where terrain files included.",
)
parser.add_argument(
    "--output",
    "-o",
    type=Path,
    required=True,
    help="output path",
)

if __name__ == "__main__":
    tilesets = [
        "ashworld",
        "badlands",
        "Desert",
        "Ice",
        "install",
        "jungle",
        "platform",
        "Twilight",
    ]
    args = parser.parse_args()

    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(process_tileset, tileset, args.path, args.output)
            for tileset in tilesets
        ]
        for future in futures:
            future.result()

    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(process_group_table, tileset, args.path, args.output)
            for tileset in tilesets
        ]
        for future in futures:
            future.result()
