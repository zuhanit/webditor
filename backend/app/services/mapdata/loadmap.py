from eudplib.core.mapdata import chktok, mapdata
from eudplib.bindings._rust import mpqapi
from fastapi import UploadFile 
from tempfile import NamedTemporaryFile
from io import BytesIO
from app.services.mapdata.chk import CHK
from app.models.project import RawMap

async def get_chkt(file: BytesIO) -> chktok.CHK:
  """
  Get chkt class.
  
  Since stormlib after 0.9.0 can get data from http by using prefix, it limited on Windows. So
  tempfile has used.
  """
  
  with NamedTemporaryFile(delete=True, suffix=".scx") as tmp:
      content = file.read()
      tmp.write(content) 
      tmp_path = tmp.name
      
      mpqr = mpqapi.MPQ.open(tmp_path)
      scenario_chk_bytes = mpqr.extract_file("staredit\\scenario.chk") 
      
      chkt = chktok.CHK()
      chkt.loadchk(scenario_chk_bytes)

  return chkt

def get_chk_data(chk: CHK):
  """
  """
  map = RawMap(
    unit=chk.get_units(),
    terrain=chk.get_terrain(),
    player=chk.get_players(),
    location=chk.get_locations(),
    placed_unit=chk.get_paced_units(),
    sprite=chk.get_sprites(),
    string=chk.get_strings()
  )
  
  return map