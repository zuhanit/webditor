from graphics.scgraphic import GRP
from rectpack import newPacker, PackingMode, PackingBin, MaxRectsBssf, SORT_AREA
from PIL import Image



def pack_images(grp: GRP, bin_size=(512, 512)):
    images = [i.image for i in grp.frames]

    packer = newPacker(
        mode=PackingMode.Offline,
        bin_algo=PackingBin.Global,
        pack_algo=MaxRectsBssf,
        sort_algo=SORT_AREA,
    )

    for index, img in enumerate(images):
        packer.add_rect(img.width, img.height, index)

    packer.add_bin(*bin_size, count=float("inf"))  # type: ignore
    packer.pack()  # type: ignore

    atlases: list[tuple[Image.Image, dict]] = []
    bin_count = len(packer.bin_list())

    # Create one atlas per bin
    for bin_index in range(bin_count):
        atlas = Image.new("RGBA", bin_size)
        meta = {}

        for rect in packer.rect_list():
            b, x, y, w, h, rid = rect
            if b != bin_index:
                continue
            img = images[rid]
            atlas.paste(img, (x, y))
            meta[rid] = {"x": x, "y": y, "width": w, "height": h}

        atlases.append((atlas, meta))

    return atlases
