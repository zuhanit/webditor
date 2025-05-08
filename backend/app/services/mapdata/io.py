import os
from app.services.merger import Merger
from eudplib import CompressPayload
from eudplib.core.mapdata import chktok, mapdata
from eudplib.maprw.savemap import SaveMap
from eudplib.maprw.loadmap import LoadMap
from eudplib.bindings._rust import mpqapi
from tempfile import NamedTemporaryFile
from io import BytesIO
from app.services.mapdata.chk import CHK, CHKBuilder
from app.services.rawdata.dat import DAT
from app.models.project import Usemap
from app.services.bridge.transformer import Transformer
import uuid


def get_chkt(file: BytesIO) -> chktok.CHK:
  """
  Get chkt class.

  Since stormlib after 0.9.0 can get data from http by using prefix, it limited on Windows. So
  tempfile has used.
  """
  content = file.read()

  with NamedTemporaryFile(delete=False, suffix=".scx") as tmp:
    tmp.write(content)
    tmp_path = tmp.name

  try:
    mpqr = mpqapi.MPQ.open(tmp_path)
    scenario_chk_bytes = mpqr.extract_file("staredit\\scenario.chk")

    chkt = chktok.CHK()
    chkt.loadchk(scenario_chk_bytes)

    return chkt
  finally:
    try:
      del mpqr  # Ensure MPQ object is released
    except NameError:
      pass
    try:
      os.remove(tmp_path)
    except PermissionError:
      pass


def get_map(chk: CHK, dat: DAT):
  """ """
  merger = Merger(chk, dat)
  map: Usemap = Usemap(
    terrain=chk.get_terrain(),
    player=chk.get_players(),
    location=chk.get_locations(),
    unit_definitions=merger.merge_unit_definitions(),
    placed_unit=merger.merge_placed_unit(),
    sprite=dat.get_sprites(),
    placed_sprite=merger.merge_placed_sprite(),
    string=chk.get_strings(),
    validation=chk.get_validation(),
    mask=chk.get_mask(),
    unit_properties=chk.get_unit_properties(),
    upgrade_restrictions=chk.get_upgrade_restrictions(),
    tech_restrictions=chk.get_tech_restrictions(),
    upgrades=merger.merge_upgrade(),
    technologies=merger.merge_tech(),
    unit_restrictions=chk.get_unit_restrictions(),
    raw_triggers=chk.get_triggers(),
    raw_mbrf_triggers=chk.get_mbrf_triggers(),
    force=chk.get_forces(),
    scenario_property=chk.get_scenario_properties(),
    weapons=merger.merge_weapon(),
    images=dat.get_images(),
    flingy=dat.get_flingy(),
    orders=dat.get_orders(),
    portrait=dat.get_portraits(),
  )

  return map


def build_map(map: Usemap, delete: bool = True):
  """Build map by eudplib.

  This function uses `eudplib.LoadMap()` and `eudplib.SaveMap()` internally,
  and eudplib maprw needs original map to initialize map data. So using any
  uncompressed/unprotected map that will be overwritten by rawmap data and
  overrides. In webditor, uses (2)Bottleneck.scx

  Args:
      rawmap (RawMap): A RawMap object that contains structured map data to serialize.
      delete (bool, optional): If True, deletes the temporary output file after reading. Defaults to True.

  Returns:
      bytes: The compiled SCX map file content as raw bytes.
  """
  original_fname = "./app/services/rawdata/original.scx"

  serializer = CHKBuilder(map)

  transformer = Transformer(map)
  rootf = transformer.transform()

  LoadMap(original_fname)
  serialized_chkt = chktok.CHK()
  serialized_chkt.loadchk(serializer.to_bytes())

  with open(original_fname, "rb") as f:
    rawfile = f.read()
    mapdata.init_map_data(serialized_chkt, rawfile)

  temp_output_fname = "./output/" + str(uuid.uuid4()) + ".scx"

  CompressPayload(True)
  SaveMap(temp_output_fname, rootf)

  with open(temp_output_fname, "rb") as f:
    map_bytes = f.read()

  if delete:
    os.remove(temp_output_fname)

  return map_bytes
