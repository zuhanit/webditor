from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import re
from typing import Literal, Optional, TypeAlias, cast
from graphics.scgraphic import GRP, get_all_graphic_path
from graphics.scanim import AnimImage, RAWEntryRef, SCAnim, get_all_anim_path
from graphics.packer import pack_images
from graphics.types import PCX, Graphic, Anim
from rich.console import Console
from rich.table import Table
from PIL import Image
import json
import argparse

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


output_base = "output/graphics"


def next_power_of_two(x: int) -> int:
    return 1 if x == 0 else 2 ** (x - 1).bit_length()


def process_graphic(grp_path: Graphic | str, pcx: PCX | str):
    grow_width = True
    try:
        grp = GRP("tunit.pcx", grp_path)
        maximum_height = max([frame.image.height for frame in grp.frames])
        maximum_width = max([frame.image.width for frame in grp.frames])

        bin_size = [next_power_of_two(maximum_width), next_power_of_two(maximum_height)]

        while True:
            packed = pack_images(grp, bin_size)
            if len(packed) > 1:
                if grow_width:
                    bin_size[0] *= 2
                else:
                    bin_size[1] *= 2
                grow_width = not grow_width
            else:
                return (
                    "success",
                    grp_path,
                    packed[0][0],
                    f"{bin_size[0]}*{bin_size[1]}",
                )
    except Exception as e:
        return ("failed", grp_path, None, str(e))


Anim_Process_Result: TypeAlias = Literal[
    "success", "success_without_team_color", "failed"
]


def process_hd_anim(
    anim_path: Anim | str,
) -> tuple[
    Anim_Process_Result,
    Optional[Image.Image],
    Optional[Image.Image],
    str,
    Optional[dict],
    Optional[str],
]:
    try:
        anim = SCAnim(anim_path)

        if "Team Color" in anim.images[0].layers.keys():
            return (
                "success",
                anim.images[0].layers["Diffuse"],
                anim.images[0].layers["Team Color"],
                anim_path,
                anim.images[0].meta,
                "success",
            )
        else:
            return (
                "success_without_team_color",
                anim.images[0].layers["Diffuse"],
                None,
                anim_path,
                anim.images[0].meta,
                "success without team color",
            )
    except Exception as e:
        return ("failed", None, None, anim_path, None, str(e))


def process_multiple_anim(
    anim: AnimImage,
) -> tuple[
    Anim_Process_Result,
    Optional[Image.Image],
    Optional[Image.Image],
    Optional[dict],
    str,
]:
    try:
        if "Team Color" in anim.layers.keys():
            return (
                "success",
                anim.layers["Diffuse"],
                anim.layers["Team Color"],
                anim.meta,
                "success",
            )
        else:
            return (
                "success_without_team_color",
                anim.layers["Diffuse"],
                None,
                anim.meta,
                "success without team color",
            )
    except Exception as e:
        return ("failed", None, None, None, str(e))


def get_table(table_title: str = "Result") -> Table:
    table = Table(title=table_title)
    table.add_column("Index")
    table.add_column("Entry Type")
    table.add_column("Message")

    return table


def process_hd():
    result_table = get_table("HD anim reference processing result")
    maybe_entry_ref: list[str] = []

    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(process_hd_anim, str(Path(args.path / "hd" / anim_path)))
            for anim_path in get_all_anim_path(str(Path(args.path) / "hd"))
        ]
        for future in futures:
            result, diffuse, team_color, anim_path, meta, msg = future.result()

            if result == "success" or result == "success_without_team_color":
                _a = str(int(Path(anim_path).with_suffix("").name[5:]))
                output_path = Path(args.output) / "hd" / _a
                output_path.mkdir(parents=True, exist_ok=True)

                if diffuse is not None:
                    diffuse.save(str(output_path) + "/diffuse.png")
                if team_color is not None:
                    team_color.save(str(output_path) + "/team_color.png")
                if meta is not None:
                    with open(str(output_path) + "/meta.json", "w") as f:
                        json.dump(meta, f)
                result_table.add_row(anim_path, "Entry", msg)
            else:
                maybe_entry_ref.append(anim_path)

    for path in maybe_entry_ref:
        anim = SCAnim(path)
        if isinstance(anim.entries[0], RAWEntryRef):
            entry_ref = anim.entries[0]
            try:
                import shutil

                src_dir = Path(args.output) / "hd" / str(entry_ref.ref_id)
                dest_dir = Path(args.output) / "hd" / str(id)

                dest_dir.mkdir(parents=True, exist_ok=True)
                print(dest_dir)

                for img_path in src_dir.iterdir():
                    shutil.copy(img_path, dest_dir / img_path.name)

                result_table.add_row(
                    str(id),
                    "RAWEntryRef",
                    f"Entry references {entry_ref.ref_id}, copied to {dest_dir} succesfully.",
                )
            except Exception as e:
                result_table.add_row(
                    str(id), "RAWEntryRef", f"Failed to copy {id}, error: {str(e)}"
                )

        else:
            result_table.add_row(str(id), str(type(entry_ref)), "Not entry references")

    console.print(result_table)


def process_sd():
    result_table = get_table("SD anim processing result")
    mainSD_anim_path = args.path / "sd" / Path("mainSD.anim")
    sd_anim = SCAnim(str(mainSD_anim_path))
    all_sd_images = [image for image in sd_anim.images]

    maybe_entry_ref: list[int] = []
    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(process_multiple_anim, sd_image)
            for sd_image in all_sd_images
        ]

        for index, future in enumerate(futures):
            result, diffuse, team_color, meta, msg = future.result()

            if result == "success" or result == "success_without_team_color":
                output_path = Path(args.output) / "sd" / str(index)
                output_path.mkdir(parents=True, exist_ok=True)

                if diffuse is not None:
                    diffuse.save(str(output_path) + "/diffuse.png")
                if team_color is not None:
                    team_color.save(str(output_path) + "/team_color.png")
                if meta is not None:
                    with open(str(output_path) + "/meta.json", "w") as f:
                        json.dump(meta, f)

                if (diffuse, team_color) == (None, None):
                    maybe_entry_ref.append(index)
                else:
                    result_table.add_row(str(index), "Entry", msg)
            else:
                maybe_entry_ref.append(index)

    for id in maybe_entry_ref:
        entry_ref = sd_anim.entries[id]
        if isinstance(entry_ref, RAWEntryRef):
            try:
                import shutil

                src_dir = Path(args.output) / "sd" / str(entry_ref.ref_id)
                dest_dir = Path(args.output) / "sd" / str(id)

                dest_dir.mkdir(parents=True, exist_ok=True)

                for img_path in src_dir.iterdir():
                    shutil.copy(img_path, dest_dir / img_path.name)

                result_table.add_row(
                    str(id),
                    "RAWEntryRef",
                    f"Entry references {entry_ref.ref_id}, copied to {dest_dir} succesfully.",
                )
            except Exception as e:
                result_table.add_row(
                    str(id), "RAWEntryRef", f"Failed to copy {id}, error: {str(e)}"
                )

        else:
            result_table.add_row(str(id), str(type(entry_ref)), "Not entry references")
    console.print(result_table)


parser = argparse.ArgumentParser(
    description="Extract diffuse.png, team_color.png, meta.json from StarCraft: Remastered .anim files."
)
parser.add_argument(
    "--path",
    "-p",
    type=Path,
    required=True,
    help="folder path where .anim files included.",
)
parser.add_argument(
    "--output",
    "-o",
    type=Path,
    required=True,
    help="output path",
)
parser.add_argument("--sd", action="store_true", help="process all SD .anim files")
parser.add_argument("--hd", action="store_true", help="process all HD .anim files")

if __name__ == "__main__":
    console = Console(width=200)
    args = parser.parse_args()

    if args.hd:
        process_hd()

    if args.sd:
        process_sd()

    STATIC = Path("../") / "backend" / "static"

    print(STATIC.glob("anim/**/*.png"))
    hd_manifest: dict[int, dict[str, bool]] = {}
    sd_manifest: dict[int, dict[str, bool]] = {}
    for png in STATIC.glob("anim/**/*.png"):
        m = re.search(r"/anim/(sd|hd)/(\d+)/(diffuse|team_color)\.png$", png.as_posix())
        if not m:
            continue
        ver, idx, kind = m.groups()
        idx = int(idx)
        if ver == "sd":
            sd_manifest.setdefault(idx, {"diffuse": False, "team_color": False})
            sd_manifest[idx][kind] = True
        else:
            hd_manifest.setdefault(idx, {"diffuse": False, "team_color": False})
            hd_manifest[idx][kind] = True

    (STATIC / "anim" / "hd" / "manifest.json").write_text(
        json.dumps(hd_manifest), encoding="utf-8"
    )
    print("hd/manifest.json written:", len(hd_manifest), "entries")

    (STATIC / "anim" / "sd" / "manifest.json").write_text(
        json.dumps(sd_manifest), encoding="utf-8"
    )
    print("sd/manifest.json written:", len(sd_manifest), "entries")
