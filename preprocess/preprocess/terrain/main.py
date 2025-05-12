from concurrent.futures import ProcessPoolExecutor
from .scterrain import Tilesets
from .terrain_analyzer import TerrainAnalyzer
from typing import cast
import os
import gzip
import json


def process_tileset(tileset: str):
    TA = TerrainAnalyzer(cast(Tilesets, tileset))
    output_path = f"./output/terrain/{tileset}"
    os.makedirs(output_path, exist_ok=True)

    binary_path = f"{output_path}/megatile_color.bin"
    compressed_path = f"{output_path}/megatile_color.gz"

    with open(binary_path, "wb") as f:
        g = TA.get_megatile_colors()
        f.write(g)

    with open(binary_path, "rb") as f_in:
        with gzip.open(compressed_path, "wb") as f_out:
            f_out.writelines(f_in)


def process_group_table(tileset: str):
    TA = TerrainAnalyzer(cast(Tilesets, tileset))
    output_path = f"./output/terrain/{tileset}"
    os.makedirs(output_path, exist_ok=True)

    binary_path = f"{output_path}/cv5_group.json"

    with open(binary_path, "w") as f:
        g = TA.get_group_table()
        json.dump(g, f)


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

    with ProcessPoolExecutor() as executor:
        futures = [executor.submit(process_tileset, tileset) for tileset in tilesets]
        for future in futures:
            future.result()

    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(process_group_table, tileset) for tileset in tilesets
        ]
        for future in futures:
            future.result()
