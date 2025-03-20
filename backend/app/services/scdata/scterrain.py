import os
import struct
from typing import Dict, Literal, TypeVar, Callable, List, Tuple, Any, TypedDict, overload

TERRAIN_FORMAT_KIND = Literal["cv5", "vx4ex", "vr4", "vf4", "wpe"]

T = TypeVar("T")
Tilesets = Literal[
    "ashworld", "badlands", "Desert", "Ice", "install", "jungle", "platform", "Twilight"
]

def read(
    tileset: Tilesets,
    kind: TERRAIN_FORMAT_KIND,
    tileset_format: str,
    analyze: Callable[[Tuple[Any, ...]], T],
):
    FILE_PATH = f"./src/tileset/data/tileset/{tileset}.{kind}"
    FILE_SIZE = os.path.getsize(FILE_PATH)
    FORMAT_SIZE = struct.calcsize(tileset_format)

    result: List[T] = []
    with open(FILE_PATH, "rb") as file:
        for _ in range(FILE_SIZE // FORMAT_SIZE):
            chunk = struct.unpack(tileset_format, file.read(FORMAT_SIZE))
            analyzed_chunk = analyze(chunk)
            result.append(analyzed_chunk)

    return result

class CV5TileFlag(TypedDict):
    walkable: bool
    unknown1: bool
    unwalkable: bool
    unknown2: bool
    has_doodad_cover: bool
    unknown3: bool
    creep: bool
    unbuildable: bool
    blocks_view: bool
    mid_ground: bool
    high_ground: bool
    occupied: bool
    receding_creep: bool
    cliff_edge: bool
    temporary_creep: bool
    allow_beacon: bool


class CV5Tile(TypedDict):
    terrian_type: int
    flags: CV5TileFlag
    edge_types: Dict[str, int]
    terrian_piece_type: Dict[str, int]
    tiles: Tuple


class CV5DoodadFlag(TypedDict):
    has_sprite_overlay: bool
    has_unit_overlay: bool
    is_overlay_flipped: bool


class CV5Doodad(TypedDict):
    terran_type: int
    flags: CV5DoodadFlag
    overlay_id: int
    scr_doodad: int
    group_string: int
    unknown1: int
    doodad_id: int
    width: int
    height: int
    unknown2: int
    tiles: Tuple


class CV5:
    """
    This file defines the various tile groups that are referenced by the TILE/MTXM sections of the CHK (0x7FF0 for the group index, 0x000F for the tile index).

    Struct Size: 52 bytes
    ID Range: 0-2047
    """

    @staticmethod
    def chunk_analyze(chunk: Tuple[Any, ...]) -> CV5Tile | CV5Doodad:
        if chunk[0] == 1:
            return CV5.chunk_to_doodad(chunk)
        else:
            return CV5.chunk_to_tile(chunk)

    @staticmethod
    def chunk_to_tile(chunk: Tuple[Any, ...]) -> CV5Tile:
        tile: CV5Tile = {
            "terrian_type": chunk[0],
            "flags": CV5.analyze_flag(chunk[1], False),
            "edge_types": {
                "left": chunk[2],
                "up": chunk[3],
                "right": chunk[4],
                "down": chunk[5],
            },
            "terrian_piece_type": {
                "left": chunk[6],
                "up": chunk[7],
                "right": chunk[8],
                "down": chunk[9],
            },
            "tiles": chunk[10:],
        }
        return tile

    @staticmethod
    def chunk_to_doodad(chunk: Tuple[Any, ...]) -> CV5Doodad:
        doodad: CV5Doodad = {
            "terran_type": chunk[0],
            "flags": CV5.analyze_flag(chunk[1], True),
            "overlay_id": chunk[2],
            "scr_doodad": chunk[3],
            "group_string": chunk[4],
            "unknown1": chunk[5],
            "doodad_id": chunk[6],
            "width": chunk[7],
            "height": chunk[8],
            "unknown2": chunk[9],
            "tiles": chunk[10:],
        }
        return doodad
      
    @staticmethod
    @overload
    def analyze_flag(flag: int, isDoodad: Literal[False]) -> CV5TileFlag: ...
    
    @staticmethod
    @overload
    def analyze_flag(flag: int, isDoodad: Literal[True]) -> CV5DoodadFlag: ...

    @staticmethod
    def analyze_flag(flag: int, isDoodad: bool) -> CV5TileFlag | CV5DoodadFlag:
        result: CV5TileFlag | CV5DoodadFlag

        if not isDoodad:
            result = {
                "walkable": flag & 0x0001 != 0,
                "unknown1": flag & 0x0002 != 0,
                "unwalkable": flag & 0x0004 != 0,
                "unknown2": flag & 0x0008 != 0,
                "has_doodad_cover": flag & 0x0010 != 0,
                "unknown3": flag & 0x0020 != 0,
                "creep": flag & 0x0040 != 0,
                "unbuildable": flag & 0x0080 != 0,
                "blocks_view": flag & 0x0100 != 0,
                "mid_ground": flag & 0x0200 != 0,
                "high_ground": flag & 0x400 != 0,
                "occupied": flag & 0x0800 != 0,
                "receding_creep": flag & 0x1000 != 0,
                "cliff_edge": flag & 0x2000 != 0,
                "temporary_creep": flag & 0x4000 != 0,
                "allow_beacon": flag & 0x8000 != 0,
            }
        else:
            result = {
                "has_sprite_overlay": flag & 0x1000 != 0,
                "has_unit_overlay": flag & 0x2000 != 0,
                "is_overlay_flipped": flag & 0x4000 != 0,
            }

        return result

    def __init__(self, tileset: Tilesets):
        result = read(tileset, "cv5", "HH4H4H16H", self.chunk_analyze)
        self.tiles = result


class VR4:
    """
    Graphical Data for minitiles. Referenced by VX4 or VX4EX.

    Struct Size: 64 Bytes
    Max ID: 32767 (VX4) or 2147483647 (VX4EX)
        u8[8][8] - WPE color index
    """

    def __init__(self, tileset: Tilesets):
        result = read(tileset, "vr4", "64B", lambda x: x)
        self.graphics = result


class VX4Type(TypedDict):
    flipped: bool
    vr4_id: tuple[int, ...]


class VX4:
    """
    MiniTile graphic references for each MegaTile. Referenced by CV5.

    Struct Size: 32 Bytes
    ID Range: 0-65535

    - u16[16] - MiniTile graphics
        - Bit 0 (0x0001) - Horizontally Flipped
        - 15 Bits (0xFFFE) - VR4 ID
    """

    @staticmethod
    def chunk_to_flags(chunk: tuple) -> Tuple[VX4Type, ...]:
        graphics: List[VX4Type] = []

        for g in chunk:
            result: VX4Type = {
                "flipped": g & 0x0001 == 1,
                "vr4_id": g >> 1,
            }
            graphics.append(result)

        return tuple(graphics)

    def __init__(self, tileset: Tilesets):
        result = read(tileset, "vx4ex", "16I", self.chunk_to_flags)
        self.graphics = result


class VF4Flag(TypedDict):
    walkable: bool
    mid: bool
    high: bool
    blocks_view: bool
    ramp: bool


class VF4:
    """
    MiniTile flags for each MegaTile. Referenced by CV5.

    Struct Size: 32 Bytes
    ID Range: 0-65535

    - u16[16] - MiniTile Flags:
        - 0x0001 - Walkable
        - 0x0002 - Mid
        - 0x0004 - High (Mid and High unchecked = Low)
        - 0x0008 - Blocks View
        - 0x0010 - Ramp - Appears in the middle of most ramps/stairs
        - Rest unknown/unused
    """

    @staticmethod
    def chunk_to_flags(chunk: tuple) -> Tuple[VF4Flag, ...]:
        flags: List[VF4Flag] = []

        for flag in chunk:
            analyzed_flag = VF4.analyze_flag(flag)
            flags.append(analyzed_flag)
        return tuple(flags)

    @staticmethod
    def analyze_flag(flag: int) -> VF4Flag:
        result: VF4Flag = {
            "walkable": flag & 0x0001 != 0,
            "mid": flag & 0x0002 != 0,
            "high": flag & 0x0004 != 0,
            "blocks_view": flag & 0x0008 != 0,
            "ramp": flag & 0x0010 != 0,
        }
        return result

    def __init__(self, tileset: Tilesets):
        result = read(tileset, "vf4", "16H", self.chunk_to_flags)
        self.flags = result


class WPEType(TypedDict):
    red: int
    green: int
    blue: int
    unused: int


class WPE:
    """
    256-color RGB Palette.

    Struct Size: 4 Bytes (entire file is always 1024 bytes).
    ID Range: 0-255

    - u8 - Red
    - u8 - Green
    - u8 - Blue
    - u8 - Unused
    """

    @staticmethod
    def chunk_to_pallette(chunk: Tuple[Any, ...]) -> WPEType:
        return {
            "red": chunk[0],
            "green": chunk[1],
            "blue": chunk[2],
            "unused": chunk[3],
        }

    def __init__(self, tileset: Tilesets):
        result = read(tileset, "wpe", "4B", self.chunk_to_pallette)
        self.graphics = result