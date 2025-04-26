from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from graphics.scgraphic import GRP, Graphic, get_all_graphic_path
from graphics.packer import pack_images
from rich.console import Console
from rich.table import Table

all_graphic = get_all_graphic_path()
all_pallete = [
    "tblink.pcx",
    "tfontgam.pcx",
    "thpbar.pcx",
    "ticon.pcx",
    "tminimap.pcx",
    "tselect.pcx",
    "tunit.pcx",
    "twire.pcx",
]

success_table = Table(title="Graphic Process Result")
success_table.add_column("GRP")
success_table.add_column("Size")

failed_table = Table(title="Graphic Processing Failed Result")
failed_table.add_column("GRP")
failed_table.add_column("Reason")


def next_power_of_two(x: int) -> int:
    return 1 if x == 0 else 2 ** (x - 1).bit_length()


def process_graphic(grp_path: Graphic | str):
    grow_width = True
    results = []
    for palette in all_pallete:
        grow_width = True
        try:
            grp = GRP(palette, grp_path)
            maximum_height = max([frame.image.height for frame in grp.frames])
            maximum_width = max([frame.image.width for frame in grp.frames])

            bin_size = [
                next_power_of_two(maximum_width),
                next_power_of_two(maximum_height),
            ]

            while True:
                packed = pack_images(grp, bin_size)
                if len(packed) > 1:
                    if grow_width:
                        bin_size[0] *= 2
                    else:
                        bin_size[1] *= 2
                    grow_width = not grow_width
                else:
                    results.append(
                        (
                            "success",
                            grp_path,
                            palette,
                            packed[0][0],
                            f"{bin_size[0]}*{bin_size[1]}",
                        )
                    )
        except Exception as e:
            results.append(("failed", grp_path, palette, None, str(e)))

    return results


output_base = "output/graphics"
if __name__ == "__main__":
    with ProcessPoolExecutor() as executor:
        futures = [executor.submit(process_graphic, graphic) for graphic in all_graphic]
        for future in futures:
            results = future.result()
            for result, grp_path, palette, atlas, size in results:
                if result == "success":
                    png_path = Path(grp_path).with_suffix(".png")
                    save_path = Path(output_base) / palette / png_path
                    save_path.parent.mkdir(parents=True, exist_ok=True)
                    atlas.save(save_path)
                    success_table.add_row(grp_path, size)
                else:
                    failed_table.add_row(grp_path, size)

    console = Console(width=200)
    console.print(success_table)
    console.print(failed_table)
