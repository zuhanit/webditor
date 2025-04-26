from io import BufferedReader
from pathlib import Path
from dataclasses import dataclass
from graphics.types import Graphic, PCX
from PIL import Image
from typing import Sequence
import struct
import numpy as np


def read_pcx(file_path: PCX | str):
    relative_file_path = Path(__file__).parent / "game" / file_path
    img = Image.open(relative_file_path)

    return img


@dataclass(frozen=True)
class GRPFormat:
    HEADER = "<3H"
    """
  uint16 frameCount;\n
  uint16 grpWidth;\n
  uint16 grpHeight;\n
  """
    FRAME_HEADER = "<4BI"
    """
  uint8   frameXOffset;\n
  uint8   frameYOffset;\n
  uint8   frameWidth;\n
  uint8   frameHeight;\n
  uint32  lineTableOffset;\n
  """
    LINE_TABLE = "<H"


class GRPHeader:
    frame_count: int
    grp_width: int
    grp_height: int

    def __init__(self, raw_bytes: bytes):
        (self.frame_count, self.grp_width, self.grp_height) = struct.unpack(
            GRPFormat.HEADER, raw_bytes
        )


class FrameHeader:
    x_offset: int
    y_offset: int
    width: int
    height: int
    line_table_offset: int

    def __init__(self, raw_bytes):
        (
            self.x_offset,
            self.y_offset,
            self.width,
            self.height,
            self.line_table_offset,
        ) = struct.unpack(GRPFormat.FRAME_HEADER, raw_bytes)


class Frame:
    width: int
    height: int

    def __init__(
        self,
        indicies: Sequence[Sequence[int]],
        palette: list[tuple[int, int, int]],
        width: int,
        height: int,
    ):
        result: list[list[tuple[int, int, int]]] = []
        for y in indicies:
            result.append([palette[x] for x in y])

        arr = np.array(result, dtype=np.uint8)
        self.width, self.height = width, height
        self.image = Image.fromarray(arr, mode="RGB")


class GRP:
    header: GRPHeader
    frames: tuple[Frame, ...]
    palette: list[tuple[int, int, int]]

    def __init__(self, palette: PCX | str, path: Graphic | str):
        flat_palette = read_pcx(palette).getpalette()

        if flat_palette is None:
            raise ValueError(
                f"Can't get palette from {palette}. Maybe you missed extract palettes from StarCraft?"
            )

        self.palette = [
            (flat_palette[i], flat_palette[i + 1], flat_palette[i + 2])
            for i in range(0, len(flat_palette), 3)
        ]
        file_path = Path(__file__).parent / "unit" / path
        with open(file_path, "rb") as f:
            self.frames = self.read(f)

    def read(self, buffer: BufferedReader):
        self.header = GRPHeader(buffer.read(struct.calcsize(GRPFormat.HEADER)))

        frame_headers = []
        for _ in range(self.header.frame_count):
            frame_header = FrameHeader(
                buffer.read(struct.calcsize(GRPFormat.FRAME_HEADER))
            )
            frame_headers.append(frame_header)

        frames = self.__get_frames__(frame_headers, buffer)
        return frames

    def __get_frames__(
        self, frame_headers: list[FrameHeader], buffer: BufferedReader
    ) -> tuple[Frame, ...]:
        frames: list[Frame] = []
        for frame_header in frame_headers:
            img = []
            buffer.seek(frame_header.line_table_offset)
            line_offsets = [
                int.from_bytes(buffer.read(2), "little")
                for _ in range(frame_header.height)
            ]

            for offset in line_offsets:
                abs_offset = frame_header.line_table_offset + offset
                decompressed = self.decompress_rle(
                    frame_header.width, buffer, abs_offset
                )
                img.append(decompressed)

            frames.append(
                Frame(img, self.palette, frame_header.width, frame_header.height)
            )

        return tuple(frames)

    def decompress_rle(
        self, width: int, buffer: BufferedReader, offset: int
    ) -> tuple[int, ...]:
        buffer.seek(offset)
        line = bytearray()
        while (len(line)) < width:
            v = buffer.read(1)
            code = int.from_bytes(struct.unpack("B", v), "little")

            match [code >= 0x80, code >= 0x40]:
                case [True, True]:
                    line += b"\x00" * (code - 0x80)
                case [False, True]:
                    value = int.from_bytes(buffer.read(1), "little")
                    line += bytes([value]) * (code - 0x40)
                case [False, False]:
                    line += buffer.read(code)

        return tuple(line)


def get_all_graphic_path():
    base_path = Path(__file__).parent

    grp_files = [
        p
        for p in (base_path / "unit").rglob("*")
        if p.suffix == ".grp" and not p.name.endswith(".dds.grp")
    ]

    stripped = [str(path.relative_to(base_path / "unit")) for path in grp_files]
    return stripped
