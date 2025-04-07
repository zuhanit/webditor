
from io import BytesIO
from app.services.mapdata.chk import CHK
from app.services.mapdata.io import build_map, get_chkt, get_map
from app.services.merger import Merger


def build(filename: str):
  filename = "backend/example/" + filename

  with open(filename, "rb") as f:
    chkt = get_chkt(BytesIO(f.read()))
    chk = CHK(chkt)
    map = get_map(chk)

    
    merger = Merger(chk) 
    map_bytes = build_map(map)
    
    print("asdf")
    
build("hello12345.scx")