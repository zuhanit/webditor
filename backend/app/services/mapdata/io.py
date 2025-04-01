from eudplib.core.mapdata import chktok, mapdata
from eudplib.bindings._rust import mpqapi
from fastapi import UploadFile 
from tempfile import NamedTemporaryFile
from io import BytesIO
from app.services.mapdata.chk import CHK
from app.models.project import RawMap

def get_chkt(file: BytesIO) -> chktok.CHK:
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
    placed_unit=chk.get_placed_units(),
    sprite=chk.get_sprites(),
    string=chk.get_strings(),
    validation=chk.get_validation(),
    mask=chk.get_mask(),
    unit_properties=chk.get_unit_properties(),
    upgrade_restrictions=chk.get_upgrade_restrictions(),
    tech_restrictions=chk.get_tech_restrictions(),
    upgrades=chk.get_upgrade_settings(),
    technologies=chk.get_technologies(),
    unit_restrictions=chk.get_unit_restrictions(),
    raw_triggers=chk.get_triggers(),
    raw_mbrf_triggers=chk.get_mbrf_triggers(),
    force=chk.get_forces(),
    scenario_property=chk.get_scenario_properties(),
  )
  
  return map

async def chk_from_rawmap(rawMap: RawMap) -> CHK:
  chkt = chktok.CHK()
  
  chk_bytes = bytes()
  
  chk_bytes += "VER ".encode()
  chk_bytes += rawMap.validation.ver
  
  chk_bytes += "VCOD".encode()
  chk_bytes += rawMap.validation.vcod
  
  chk_bytes += "OWNR".encode()
  
  chkt.loadchk()

def compile_chk(chk: CHK):
  ...