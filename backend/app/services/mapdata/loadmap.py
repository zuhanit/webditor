from eudplib.core.mapdata import chktok, mapdata

def load_map(raw_data: bytes) -> chktok.CHK:
  """
  Load map from bytes by using eudplib chktok
  
  In eudplib can use `LoadMap` but that function processes where map exists on drive. So webditor uses
  `chktok` for bytes processing.
  """
  chkt = chktok.CHK()
  chkt.loadchk(raw_data)
  mapdata.init_map_data(chkt, raw_data)
  
  return chkt