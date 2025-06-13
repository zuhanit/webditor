import os
from pydantic import BaseModel
from app.models.asset import Asset
from app.services.rawdata.converter import MapConverter
from eudplib import CompressPayload
from eudplib.core.mapdata import chktok, mapdata
from eudplib.maprw.savemap import SaveMap
from eudplib.maprw.loadmap import LoadMap
from eudplib.bindings._rust import mpqapi
from tempfile import NamedTemporaryFile
from io import BytesIO
from app.services.rawdata.chk import CHK, CHKBuilder
from app.services.rawdata.dat import DAT
from app.models.project import Usemap
from app.services.bridge.transformer import Transformer
from itertools import count
import uuid


def create_items(items: list | dict) -> list[Asset]:
  id_gen = count(-1)

  def create_folder(name: str, parent_id: int) -> Asset:
    return Asset(
      name=name,
      type="folder",
      id=next(id_gen),
      parent_id=parent_id,
    )

  def create_file(name: str, parent_id: int, data: BaseModel) -> Asset:
    return Asset(
      name=name,
      type="file",
      id=next(id_gen),
      parent_id=parent_id,
      data=data,
    )

  def traverse(items: list | dict, parent_id: int) -> list[Asset]:
    result: list[Asset] = []
    if isinstance(items, list):
      for item in items:
        result.append(create_file(item.name, parent_id, item))
    elif isinstance(items, dict):
      for name, items in items.items():
        result.append(create_folder(name, parent_id))
        result.extend(traverse(items, result[-1].id))
    return result

  return traverse(items, next(id_gen))


def get_assets(converter: MapConverter) -> list[Asset]:
  return create_items(
    {
      "Tech": converter.tech,
      "Upgrade": converter.upgrades,
      "Restrictions": {
        "Upgrade": converter.upgrade_restrictions,
        "Tech": converter.tech_restrictions,
        "Unit": converter.unit_restrictions,
      },
      "Definitions": {
        "Flingy": converter.flingy_definitions,
        "Sprite": converter.sprite_definitions,
        "Image": converter.image_definitions,
        "Weapon": converter.weapon_definitions,
        "Unit": converter.unit_definitions,
        "Order": converter.orders,
        "Portrait": converter.portraits,
      },
      "Entities": {
        "Unit": converter.default_unit_entities,
        "Sprite": converter.default_sprite_entities,
      },
    },
  )


def get_entities(converter: MapConverter) -> list[Asset]:
  return create_items(
    {
      "Tile": converter.tiles,
      "Location": converter.locations,
      "Sprite": converter.placed_sprites,
      "Unit": converter.placed_units,
      "Mask": converter.mask,
    },
  )


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
  converter = MapConverter(dat, chk)

  map: Usemap = Usemap(
    terrain=converter.terrain,
    player=converter.players,
    string=converter.strings,
    validation=converter.validation,
    unit_properties=converter.unit_properties,
    raw_triggers=converter.triggers,
    raw_mbrf_triggers=converter.mbrf_triggers,
    force=converter.forces,
    scenario_property=converter.scenario_property,
    entities=get_entities(converter),
    assets=get_assets(converter),
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
