from io import BytesIO
from app.services.mapdata.chk import CHK
from app.services.mapdata.io import build_map, get_chkt, get_map
from app.services.merger import Merger
from app.services.rawdata.dat import DAT


def build(filename: str):
  filename = "backend/example/" + filename

  with open(filename, "rb") as f:
    chkt = get_chkt(BytesIO(f.read()))
    chk = CHK(chkt)
    dat = DAT()
    map = get_map(chk, dat)

    merger = Merger(chk)
    map_bytes = build_map(map)


build("hello12345.scx")
