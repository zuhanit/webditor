import os
from app.models.asset import Asset
from app.models.components.transform import TransformComponent
from app.models.entities.unit import Unit
from app.models.structs.spatial import Position2D, Size
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
import uuid


def get_assets(converter: MapConverter) -> Asset:
  root = Asset(
    name="root",
    type="folder",
    id=0,
    children=[
      get_default_entities(converter),
      Asset(
        name="Upgrades",
        type="folder",
        id=1,
        children=[
          Asset(
            name=upgrade.name,
            type="file",
            data=upgrade.model_dump(),
            id=upgrade.id,
          )
          for upgrade in converter.upgrades
        ],
      ),
      Asset(
        name="Tech",
        type="folder",
        id=2,
        children=[
          Asset(
            name=tech.name,
            type="file",
            data=tech.model_dump(),
            id=tech.id,
          )
          for tech in converter.tech
        ],
      ),
      Asset(
        name="Upgrade Restrictions",
        type="folder",
        id=3,
        children=[
          Asset(
            name=upgrade_restriction.name,
            type="file",
            data=upgrade_restriction.model_dump(),
            id=upgrade_restriction.id,
          )
          for upgrade_restriction in converter.upgrade_restrictions
        ],
      ),
      Asset(
        name="Tech Restrictions",
        type="folder",
        id=4,
        children=[
          Asset(
            name=tech_restriction.name,
            type="file",
            data=tech_restriction.model_dump(),
            id=tech_restriction.id,
          )
          for tech_restriction in converter.tech_restrictions
        ],
      ),
      Asset(
        name="Unit Restrictions",
        type="folder",
        id=5,
        children=[
          Asset(
            name=unit_restriction.name,
            type="file",
            data=unit_restriction.model_dump(),
            id=unit_restriction.id,
          )
          for unit_restriction in converter.unit_restrictions
        ],
      ),
      Asset(
        name="Flingy Definitions",
        type="folder",
        id=6,
        children=[
          Asset(
            name=flingy_definition.name,
            type="file",
            data=flingy_definition.model_dump(),
            id=flingy_definition.id,
          )
          for flingy_definition in converter.flingy_definitions
        ],
      ),
      Asset(
        name="Sprite Definitions",
        type="folder",
        id=7,
        children=[
          Asset(
            name=sprite_definition.name,
            type="file",
            data=sprite_definition.model_dump(),
            preview=sprite_definition.image.id,
            id=sprite_definition.id,
          )
          for sprite_definition in converter.sprite_definitions
        ],
      ),
      Asset(
        name="Image Definitions",
        type="folder",
        id=8,
        children=[
          Asset(
            name=image_definition.name,
            type="file",
            data=image_definition.model_dump(),
            preview=image_definition.id,
            id=image_definition.id,
          )
          for image_definition in converter.image_definitions
        ],
      ),
      Asset(
        name="Weapon Definitions",
        type="folder",
        id=9,
        children=[
          Asset(
            name=weapon_definition.name,
            type="file",
            data=weapon_definition.model_dump(),
            id=weapon_definition.id,
          )
          for weapon_definition in converter.weapon_definitions
        ],
      ),
      Asset(
        name="Unit Definitions",
        type="folder",
        id=10,
        children=[
          Asset(
            name=unit_definition.name,
            type="file",
            data=unit_definition.model_dump(),
            preview=unit_definition.specification.graphics.sprite.image.id,
            id=unit_definition.id,
          )
          for unit_definition in converter.unit_definitions
        ],
      ),
      Asset(
        name="Orders",
        type="folder",
        id=11,
        children=[
          Asset(
            name=order.name,
            type="file",
            data=order.model_dump(),
            id=order.id,
          )
          for order in converter.orders
        ],
      ),
      Asset(
        name="Portraits",
        type="folder",
        id=12,
        children=[
          Asset(
            name=portrait.name,
            type="file",
            data=portrait.model_dump(),
            id=portrait.id,
          )
          for portrait in converter.portraits
        ],
      ),
    ],
  )
  return root


def get_default_entities(converter: MapConverter) -> Asset:
  return Asset(
    name="Entities",
    type="folder",
    id=0,
    children=[
      Asset(
        name="Tile",
        type="folder",
        id=0,
        children=[
          Asset(
            name=tile.name,
            type="file",
            data=tile.model_dump(),
            id=tile.id,
          )
          for tile in converter.tiles
        ],
      ),
      Asset(
        name="Location",
        type="folder",
        id=1,
        children=[
          Asset(
            name=location.name,
            type="file",
            data=location.model_dump(),
            id=location.id,
          )
          for location in converter.locations
        ],
      ),
      Asset(
        name="Sprite",
        type="folder",
        id=2,
        children=[
          Asset(
            name=sprite.name,
            type="file",
            data=sprite.model_dump(),
            preview=sprite.definition.image.id,
            id=sprite.id,
          )
          for sprite in converter.default_sprite_entities
        ],
      ),
      Asset(
        name="Unit",
        type="folder",
        id=3,
        children=[
          Asset(
            name=unit.name,
            type="file",
            data=unit.model_dump(),
            id=unit.id,
            preview=unit.unit_definition.specification.graphics.sprite.image.id,
          )
          for unit in converter.default_unit_entities
        ],
      ),
      Asset(
        name="Mask",
        type="folder",
        id=4,
        children=[
          Asset(
            name=mask.name,
            type="file",
            data=mask.model_dump(),
            id=mask.id,
          )
          for mask in converter.mask
        ],
      ),
    ],
  )


def get_entity_node(converter: MapConverter) -> Asset:
  return Asset(
    name="Entities",
    type="folder",
    id=0,
    children=[
      Asset(
        name="Tile",
        type="folder",
        id=0,
        children=[
          Asset(
            name=tile.name,
            type="file",
            data=tile.model_dump(),
            id=tile.id,
          )
          for tile in converter.tiles
        ],
      ),
      Asset(
        name="Location",
        type="folder",
        id=1,
        children=[
          Asset(
            name=location.name,
            type="file",
            data=location.model_dump(),
            id=location.id,
          )
          for location in converter.locations
        ],
      ),
      Asset(
        name="Sprite",
        type="folder",
        id=2,
        children=[
          Asset(
            name=sprite.name,
            type="file",
            data=sprite.model_dump(),
            id=sprite.id,
          )
          for sprite in converter.placed_sprites
        ],
      ),
      Asset(
        name="Unit",
        type="folder",
        id=3,
        children=[
          Asset(
            name=unit.name,
            type="file",
            data=unit.model_dump(),
            id=unit.id,
          )
          for unit in converter.placed_units
        ],
      ),
      Asset(
        name="Mask",
        type="folder",
        id=4,
        children=[
          Asset(
            name=mask.name,
            type="file",
            data=mask.model_dump(),
            id=mask.id,
          )
          for mask in converter.mask
        ],
      ),
    ],
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
    entities=get_entity_node(converter),
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
