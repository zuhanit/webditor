from io import BytesIO
from typing import Literal, TypeAlias
from PIL import Image, ImageMath
from dataclasses import dataclass
from graphics.types import Anim
from pathlib import Path
from typing import TypedDict
import struct

Version: TypeAlias = Literal["SD", "HD2", "HD"]
Layer: TypeAlias = Literal[
    "Diffuse", "Team Color", "Bright", "Normal", "Specular", "AO Depth", "Emissive"
]


@dataclass(frozen=True)
class FormatAndSize:
    format: str
    size: int

    @classmethod
    def from_format(cls, format: str):
        return cls(format, struct.calcsize(format))


@dataclass(frozen=True)
class AnimFormat:
    HEADER = FormatAndSize.from_format(f"<4sHHHH {'32s' * 10}")
    ENTRY = FormatAndSize.from_format("<HHHHI")
    ENTRY_REF = FormatAndSize.from_format("HHIIH")
    ENTRY_IMAGE = FormatAndSize.from_format("IIHH")
    FRAME = FormatAndSize.from_format("HHHHHHHH")


class RAWHeader:
    magic: str
    version: Version
    unknown: int
    layer_count: int
    entries: int
    entry_pointers: tuple[int, ...]
    layers: tuple[Layer, ...]

    def __init__(self, rawfile: bytes):
        unpacked = struct.unpack(AnimFormat.HEADER.format, rawfile)
        (
            self.magic,
            raw_version,
            self.unknown,
            self.layer_count,
            self.entries,
        ) = unpacked[:5]

        match raw_version:
            case 0x0101:
                self.version = "SD"
            case 0x0202:
                self.version = "HD2"
            case 0x0204:
                self.version = "HD"
            case _:
                raise ValueError(
                    f"Expected to version one of 0x0101, 0x0202, 0x0204, but got {raw_version}"
                )

        layers: list[Layer] = []
        for layer_str in unpacked[5:]:
            match layer_str:
                case s if s.startswith(b"diffuse"):
                    layers.append("Diffuse")
                case s if s.startswith(b"bright"):
                    layers.append("Bright")
                case s if s.startswith(b"teamcolor"):
                    layers.append("Team Color")
                case s if s.startswith(b"emissive"):
                    layers.append("Emissive")
                case s if s.startswith(b"normal"):
                    layers.append("Normal")
                case s if s.startswith(b"specular"):
                    layers.append("Specular")
                case s if s.startswith(b"ao_depth"):
                    layers.append("AO Depth")
        self.layers = tuple(layers)


class RAWImage:
    image_pointer: int
    size: int
    width: int
    height: int

    def __init__(self, rawfile: bytes):
        (self.image_pointer, self.size, self.width, self.height) = struct.unpack(
            AnimFormat.ENTRY_IMAGE.format, rawfile
        )


class RAWEntry:
    frame_count: int
    unknown: int
    width: int
    height: int
    frame_pointer: int
    layer_images: tuple[RAWImage, ...]

    def __init__(self, rawfile: bytes, layers: int):
        if rawfile[0] <= 0:
            raise ValueError(
                f"frames of AnimEntry must lager than 0, but got {rawfile[0]}."
            )

        (
            self.frame_count,
            self.unknown,
            self.width,
            self.height,
            self.frame_pointer,
        ) = struct.unpack(AnimFormat.ENTRY.format, rawfile[: AnimFormat.ENTRY.size])

        _images: list[RAWImage] = []
        for i in range(layers):
            start = AnimFormat.ENTRY.size + i * AnimFormat.ENTRY_IMAGE.size
            end = start + AnimFormat.ENTRY_IMAGE.size
            _entry_image_bytes = rawfile[start:end]

            _images.append(RAWImage(_entry_image_bytes))

        self.layer_images = tuple(_images)


class RAWEntryRef:
    frames: int
    ref_id: int
    unknown1: int
    unknown2: int
    unknown3: int

    def __init__(self, rawfile: bytes):
        (self.frames, self.ref_id, self.unknown1, self.unknown2, self.unknown3) = (
            struct.unpack(AnimFormat.ENTRY_REF.format, rawfile)
        )


class FrameMeta(TypedDict):
    x: int
    y: int
    x_offset: int
    y_offset: int
    width: int
    height: int
    unknown1: int
    unknown2: int


def create_frame_meta(rawfile: bytes) -> FrameMeta:
    (
        x,
        y,
        x_offset,
        y_offset,
        width,
        height,
        unknown1,
        unknown2,
    ) = struct.unpack(AnimFormat.FRAME.format, rawfile)
    return FrameMeta(
        x=x,
        y=y,
        x_offset=x_offset,
        y_offset=y_offset,
        width=width,
        height=height,
        unknown1=unknown1,
        unknown2=unknown2,
    )


class AnimImage:
    layers: dict[Layer, Image.Image]
    meta: dict[int, FrameMeta]

    def __init__(self, layers: dict[Layer, Image.Image], meta: dict[int, FrameMeta]):
        self.layers = layers
        self.meta = meta


class SCAnim:
    header: RAWHeader
    images: tuple[AnimImage, ...]

    def __init__(self, path: Anim | str):
        with open(path, "rb") as fp:
            self.fp = fp

            header = RAWHeader(fp.read(AnimFormat.HEADER.size))

            entry_pointers: list[int] = []
            if header.version == "SD":
                for _ in range(header.entries):
                    _pointer_bytes = fp.read(4)
                    entry_pointers.append(int.from_bytes(_pointer_bytes, "little"))
            else:
                entry_pointers.append(fp.tell())

            header.entry_pointers = tuple(entry_pointers)

            self.header = header
            self.entries = [
                self.create_entry(index) for index in range(len(header.entry_pointers))
            ]

            images: list[AnimImage] = []
            for entry in self.entries:
                images.append(self.create_anim_image(entry))

            self.images = tuple(images)

    def create_entry(self, entry_index: int) -> RAWEntry | RAWEntryRef:
        entry_pointer = self.header.entry_pointers[entry_index]
        self.fp.seek(entry_pointer)
        _frame_count = int.from_bytes(self.fp.read(2), "little")
        self.fp.seek(self.fp.tell() - 2)

        if _frame_count == 0:
            _rawbytes = self.fp.read(AnimFormat.ENTRY_REF.size)
            return RAWEntryRef(_rawbytes)
        else:
            _rawbytes = self.fp.read(AnimFormat.ENTRY.size)
            _rawbytes += b"".join(
                [self.fp.read(AnimFormat.ENTRY_IMAGE.size) for _ in range(10)]
            )
            return RAWEntry(_rawbytes, self.header.layer_count)

    def create_anim_image(self, entry: RAWEntry | RAWEntryRef) -> AnimImage:
        if isinstance(entry, RAWEntryRef):
            return AnimImage({}, {})

        layers: dict[Layer, Image.Image] = {}
        meta: dict[int, FrameMeta] = {}
        for layer_index, entry_image in enumerate(entry.layer_images):
            if entry_image.image_pointer != 0:
                self.fp.seek(entry_image.image_pointer)
                raw_image = self.fp.read(entry_image.size)

                if raw_image.startswith(b"BMP "):
                    src = self._create_player_mask_image(
                        raw_image, entry_image.width, entry_image.height
                    )
                    src.load()
                    image = src.copy()
                    layers[self.header.layers[layer_index]] = image
                else:
                    src = Image.open(BytesIO(raw_image))
                    src.load()
                    image = src.copy()
                    layers[self.header.layers[layer_index]] = image

        self.fp.seek(entry.frame_pointer)
        for i in range(entry.frame_count):
            _frame_bytes = self.fp.read(AnimFormat.FRAME.size)
            meta[i] = create_frame_meta(_frame_bytes)

        return AnimImage(layers, meta)

    def _create_player_mask_image(
        self, rawfile: bytes, width: int, height: int
    ) -> Image.Image:
        """Create player color mask from bytes.

        In version 0x0101, the player color mask is in a bitmap format, which is just "BMP " followed by width*height bytes,
        either 0x00 or 0xFF in a top-to-bottom row order. version 0x0202 uses only DDS files.

        Note that player color mask image has "BMP " magic header, but it's not BMP file.

        Args:
            rawfile (bytes): A raw image bytes include "BMP " format header.
            width (int): Width of image.
            height (int): Height of image.

        Returns:
            bytes: The compiled SCX map file content as raw bytes
        """
        img = Image.new("L", (width, height))
        img.putdata(rawfile[4:])

        return img


def get_all_anim_path(path: str):
    p = Path(path)
    grp_files = [p for p in (p).rglob("*") if p.suffix == ".anim"]

    stripped = [str(path.relative_to(p)) for path in grp_files]
    return stripped


def apply_teamcolor(
    diffuse: Image.Image, team_mask: Image.Image, team_rgb=(255, 0, 0)
) -> Image.Image:
    """
    diffuse    : RGBA Image
    team_mask  : RGB  Image (각 채널 0~255 · 흑백이라면 convert('RGB')만 해두면 됨)
    team_rgb   : (R,G,B) 팀 컬러
    """
    # 1) 채널 분리
    dr, dg, db, da = diffuse.split()
    mr, mg, mb = team_mask.convert("RGB").split()

    # 2) 팀 컬러 채널별 * 마스크
    tr = mr.point(lambda i: i * team_rgb[0] / 255)
    tg = mg.point(lambda i: i * team_rgb[1] / 255)
    tb = mb.point(lambda i: i * team_rgb[2] / 255)

    # 3) 보간 :  out = diffuse * (1-mask) + team * mask
    def blend(d, t, m):
        # m 은 0~255 → 0~1 로 정규화
        return ImageMath.eval("d*(255-m)/255 + t*m/255", d=d, t=t, m=m).convert("L")

    out_r = blend(dr, tr, mr)
    out_g = blend(dg, tg, mg)
    out_b = blend(db, tb, mb)

    # 4) 채널 합치기 (alpha 는 원본 유지)
    return Image.merge("RGBA", (out_r, out_g, out_b, da))


# Process HD anim files
# for anim_path in get_all_anim_path():
#     anim = SCAnim(anim_path)

#     _a = str(Path(anim_path).with_suffix(""))[5:]
#     output_path = Path(__file__).parent.parent / "output" / "anim" / "hd" / _a
#     output_path.mkdir(parents=True, exist_ok=True)

#     anim.images[0].layers["Diffuse"].save(str(output_path) + "/diffuse.png")
#     if "Team Color" in anim.images[0].layers.keys():
#         anim.images[0].layers["Team Color"].save(str(output_path) + "/team_color.png")

# a = SCAnim("mainSD.anim")
# b = [*filter(lambda x: isinstance(x, RAWEntryRef), a.entries)]
# print("K")
