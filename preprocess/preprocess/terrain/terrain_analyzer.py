from .scterrain import CV5, VF4, VX4, VR4, WPE, Tilesets, VF4Flag
from pydantic import BaseModel, Field
from typing import cast
from tqdm import tqdm
import numpy as np


class Color(BaseModel):
    red: int = 0
    green: int = 0
    blue: int = 0


class Minitile(BaseModel):
    id: int = 0
    flags: VF4Flag
    color: list[Color] = Field(default_factory=list, max_length=64)


class Megatile(BaseModel):
    id: int = 0
    is_doodad: bool
    minitiles: list[Minitile] = Field(default_factory=list, max_length=16)


class Terrain(BaseModel):
    tileset: str
    groups: list


class TerrainAnalyzer:
    def __init__(self, tileset: Tilesets, term_num: int = 0) -> None:
        self.tileset = tileset
        self.term_num = term_num
        self.cv5 = CV5(tileset)
        self.vx4 = VX4(tileset)
        self.vf4 = VF4(tileset)
        self.vr4 = VR4(tileset)
        self.wpe = WPE(tileset)

    def change_tileset(self, tileset: Tilesets) -> None:
        self.cv5 = CV5(tileset)
        self.vx4 = VX4(tileset)
        self.vf4 = VF4(tileset)
        self.vr4 = VR4(tileset)
        self.wpe = WPE(tileset)
    
    def get_group_table(self):
        result = []

        for group_id, group in tqdm(
            enumerate(self.cv5.groups),
            desc=f"Processing {self.tileset} CV5 Group",
            position=self.term_num,
        ):
            result.append(group["tiles"])

        return result

    def get_megatile_colors(self) -> bytearray:
        result = bytearray()
        megatile_count = len(self.vx4.graphics)

        for megatile_index in tqdm(
            range(megatile_count),
            desc=f"Processing {self.tileset} Megatile Color",
            position=self.term_num,
        ):
            megatile = self.get_megatile(megatile_index)
            pixel = np.zeros((32, 32, 3), dtype=np.uint8)
            
            for y_tile in range(4):
                for x_tile in range(4):
                    minitile = megatile.minitiles[y_tile * 4 + x_tile]
                    for y in range(8):
                        for x in range(8):
                            color = minitile.color[y * 8 + x]
                            pixel[y_tile * 8 + y][x_tile * 8 + x] = [color.red, color.green, color.blue] 

            result.extend(pixel.tobytes())

        expected_size = megatile_count * 16 * 64 * 3
        assert len(result) == expected_size, (
            f"get_megatile_colors() failed. Expected: {expected_size},\
        but got {len(result)}"
        )

        print(f"get_megatile_colors() succesfully finished. Output size: {len(result)}")
        return result

    def get_megatile(self, id: int) -> Megatile:
        result_minitile = []
        minitiles = self.vx4.graphics[id]

        for minitile_index in range(16):
            vx4_indice = minitiles[minitile_index]
            vr4_id = cast(int, vx4_indice["vr4_id"])
            minitile_flags = self.vf4.flags[id]

            flag = minitile_flags[minitile_index]
            minitile = self.get_minitile(vr4_id, vx4_indice["flipped"], flag)
            result_minitile.append(minitile)

        return Megatile(id=id, is_doodad=False, minitiles=result_minitile)

    def get_minitile(self, id: int, flipped: bool, flags: VF4Flag) -> Minitile:
        graphic = self.vr4.graphics[id]
        colors = []

        for wpe_index in graphic:
            palette = self.wpe.graphics[wpe_index]
            colors.append(
                Color(red=palette["red"], green=palette["green"], blue=palette["blue"])
            )
        if flipped:
            rows = [colors[i * 8:(i + 1) * 8] for i in range(8)]
            flipped_rows = [list(reversed(row)) for row in rows]
            colors = [color for row in flipped_rows for color in row]

        return Minitile(id=id, flags=flags, color=colors)
