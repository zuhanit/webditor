import os
from app.models.asset import Asset
from app.models.entities.entity import Entity
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
    children=[
      Asset(
        name="upgrades",
        type="folder",
        children=[
          Asset(name=upgrade.name, type="file", data=upgrade.model_dump())
          for upgrade in converter.upgrades
        ],
      ),
      Asset(
        name="tech",
        type="folder",
        children=[
          Asset(name=tech.name, type="file", data=tech.model_dump())
          for tech in converter.tech
        ],
      ),
      Asset(
        name="upgrade_restrictions",
        type="folder",
        children=[
          Asset(
            name=upgrade_restriction.name,
            type="file",
            data=upgrade_restriction.model_dump(),
          )
          for upgrade_restriction in converter.upgrade_restrictions
        ],
      ),
      Asset(
        name="tech_restrictions",
        type="folder",
        children=[
          Asset(
            name=tech_restriction.name, type="file", data=tech_restriction.model_dump()
          )
          for tech_restriction in converter.tech_restrictions
        ],
      ),
      Asset(
        name="unit_restrictions",
        type="folder",
        children=[
          Asset(
            name=unit_restriction.name, type="file", data=unit_restriction.model_dump()
          )
          for unit_restriction in converter.unit_restrictions
        ],
      ),
      Asset(
        name="flingy_definitions",
        type="folder",
        children=[
          Asset(
            name=flingy_definition.name,
            type="file",
            data=flingy_definition.model_dump(),
          )
          for flingy_definition in converter.flingy_definitions
        ],
      ),
      Asset(
        name="sprite_definitions",
        type="folder",
        children=[
          Asset(
            name=sprite_definition.name,
            type="file",
            data=sprite_definition.model_dump(),
          )
          for sprite_definition in converter.sprite_definitions
        ],
      ),
      Asset(
        name="image_definitions",
        type="folder",
        children=[
          Asset(
            name=image_definition.name, type="file", data=image_definition.model_dump()
          )
          for image_definition in converter.image_definitions
        ],
      ),
      Asset(
        name="weapon_definitions",
        type="folder",
        children=[
          Asset(
            name=weapon_definition.name,
            type="file",
            data=weapon_definition.model_dump(),
          )
          for weapon_definition in converter.weapon_definitions
        ],
      ),
      Asset(
        name="unit_definitions",
        type="folder",
        children=[
          Asset(
            name=unit_definition.name, type="file", data=unit_definition.model_dump()
          )
          for unit_definition in converter.unit_definitions
        ],
      ),
      Asset(
        name="orders",
        type="folder",
        children=[
          Asset(name=order.name, type="file", data=order.model_dump())
          for order in converter.orders
        ],
      ),
      Asset(
        name="portraits",
        type="folder",
        children=[
          Asset(name=portrait.name, type="file", data=portrait.model_dump())
          for portrait in converter.portraits
        ],
      ),
    ],
  )

  return root


def get_entity_node(converter: MapConverter) -> list[EntityNode]:
  return [
    EntityNode(
      name="Tile",
      children=[
        EntityNode(
          name=tile.name,
          data=tile,
        )
        for tile in converter.tiles
      ],
    ),
    EntityNode(
      name="Location",
      children=[
        EntityNode(name=location.name, data=location)
        for location in converter.locations
      ],
    ),
    EntityNode(
      name="Sprite",
      children=[
        EntityNode(name=sprite.name, data=sprite) for sprite in converter.placed_sprites
      ],
    ),
    EntityNode(
      name="Unit",
      children=[
        EntityNode(name=unit.name, data=unit) for unit in converter.placed_units
      ],
    ),
    EntityNode(
      name="Mask",
      children=[EntityNode(name=mask.name, data=mask) for mask in converter.mask],
    ),
  ]


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
  entities: list[Entity] = [
    *converter.tiles,
    *converter.locations,
    *converter.placed_sprites,
    *converter.placed_units,
    *converter.mask,
  ]

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
    entities=entities,
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
