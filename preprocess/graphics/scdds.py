from dataclasses import dataclass
from io import BytesIO
from PIL import Image, ImageFile
import struct


@dataclass(frozen=True)
class DDSFormats:
    HEADER = "IHH"
    """
    u32 filesize
    u16 frame count
    u16 unknown  0x1001=SD, 0x1002=HD2, 0x1004=HD, 0x1011=SD bitmaps
    """

    ENTRY_HEADER = "IHHI"
    """
     u32 unk -- always zero?
     u16 width
     u16 height
     u32 size
     u8[size] DDS file
     """


_entry_header_size = struct.calcsize(DDSFormats.ENTRY_HEADER)


class DDSHeader:
    file_size: int
    frame_count: int
    unknown: int

    def __init__(self, rawfile: bytes):
        (self.file_size, self.frame_count, self.unknown) = struct.unpack(
            DDSFormats.HEADER, rawfile
        )


def _accept(prefix: bytes):
    return not prefix.startswith(b"DDS ")


class DDSGRPImageFile(ImageFile.ImageFile):
    format: str = "DDS.GRP"
    format_description = "StarCraft: Remastered .dds.grp image"
    frames: list[ImageFile.ImageFile]

    def _open(self) -> None:
        if self.fp is None:
            return

        header_format_size = struct.calcsize(DDSFormats.HEADER)
        header = DDSHeader(self.fp.read(header_format_size))

        self.frames = []

        self._n_frames = header.frame_count
        self.__frame = 0
        self.__rewind = self.fp.tell()

        for i in range(self._n_frames):
            _entry_header_bytes = self.fp.read(_entry_header_size)
            (unknown, width, height, size) = struct.unpack(
                DDSFormats.ENTRY_HEADER, _entry_header_bytes
            )
            _entry_dds_image_bytes = self.fp.read(size)

            dds_img = Image.open(BytesIO(_entry_dds_image_bytes))
            dds_img.load()
            self.frames.append(dds_img)

        self._seek(0)

    def seek(self, frame: int) -> None:
        if not (0 <= frame < self._n_frames):
            raise EOFError(
                f"Cannot seek to frame {frame}, Total frame counts: {self._n_frames}"
            )

        self._seek(frame)

    def _seek(self, frame: int, update_image: bool = True) -> None:
        self.__frame = frame

        target_frame = self.frames[frame]
        self.im = target_frame.im
        self._mode = target_frame.mode
        self._size = target_frame.size
        self.tile = target_frame.tile

    def tell(self) -> int:
        return self.__frame


Image.register_open(DDSGRPImageFile.format, DDSGRPImageFile, _accept)

Image.register_extensions(DDSGRPImageFile.format, ["dds.grp", "dds.vr4"])

with Image.open(
    "/Volumes/External/Programming/webditor/preprocess/terrain/TileSet/badlands.dds.vr4"
) as im:
    im.seek(400)
    im.save("Hello.png")
    im.show()
    pass
