from eudplib.core.mapdata.chktok import CHK as EPCHK
from typing import TypedDict
from app.models.unit import Cost, Stat, Unit
from app.models.terrain import RawTerrain, Size, Tile, EraTilesetDict
from app.models.player import Player, OwnrPlayerTypeDict, SidePlayerRaceDict
from app.models.location import Location
from app.models.spatial import Position2D, RectPosition
from app.models.sprite import Sprite
from app.models.string import String
from app.models.components.transform import Transform
from app.models.components.weapon import Weapon
import struct


CHK_FORMATDICT: dict[str, str] = {
  "UNIx": "".join(
    ("228B", "228I", "228H", "228B", "228H", "228H", "228H", "228H", "130H", "130H")
  ),
  "ERA ": "H",
  "DIM ": "2H",
  "OWNR": "12B",
  "SIDE": "12B",
  "COLR": "8B",
  "MRGN": "4I2H",
  "UNIT": "I6H4BI2H2I",
  "THG2": "3H2BH",
  "MASK": "B",
  "UPRP": "2H4BI2HI",
  "SPRP": "2H",
  "PUNI": "3B",
  "UPGR": "5B",
  "PTEC": "5B",
  "UPGx": "5B",
  "TECx": "B4H",
  "VER": "H",
}


class TerrainSections(TypedDict):
  DIM: bytes
  ERA: bytes
  MTXM: bytes


class PlayerSections(TypedDict):
  OWNR: bytes
  SIDE: bytes
  COLR: bytes
  CRGB: bytes


class CHK:
  """
  Base class for unpacking raw chk contents, transforming Model.
  """

  units: list[Unit]
  chkt: EPCHK
  string_table: list[String] = []
  player_table: list[Player] = []
  unitdata_table: list[Unit] = []
  """Not placed unit table."""

  def __init__(self, chkt: EPCHK):
    self.chkt = chkt
    self.string_table = self.get_strings()
    self.player_table = self.get_players()
    self.unitdata_table = self.get_units()

  def get_units(self) -> list[Unit]:
    if len(self.string_table) == 0:
      raise ValueError("Must initialize string table before call `get units`")

    result: list[Unit] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], self.chkt.getsection("UNIx"))
    for id in range(228):
      unitname_id: int = unpacked[id + (228 * 7)]
      unit_name = self.string_table[unitname_id]
      hit_points = Stat(current=unpacked[id + 228], max=unpacked[id + 228])
      shield_points = Stat(
        current=unpacked[id + (228 * 2)], max=unpacked[id + (228 * 2)]
      )
      weapon = Weapon()
      result.append(
        Unit(
          id=id,
          cost=Cost(mineral=unpacked[id + (228 * 6)], gas=unpacked[id + (228 * 5)]),
          name=unit_name.content,
          hit_points=hit_points,
          shield_hpoints=shield_points,
          armor_points=unpacked[id + (228 * 3)],
          build_time=unpacked[id + (228 * 4)],
          weapon=weapon,
          resource_amount=0,
          hangar=0,
          unit_state=0,
          related_unit=0,
        )
      )

    return result

  def get_paced_units(self) -> list[Unit]:
    if len(self.unitdata_table) == 0:
      raise ValueError("Must initialize unitdata table before call `get_placed_units`")
    unit_bytes = self.chkt.getsection("UNIT")
    format_size = struct.calcsize(CHK_FORMATDICT["UNIT"])
    unit_count = len(unit_bytes) // format_size

    result: list[Unit] = []
    for i in range(0, unit_count):
      unit = struct.unpack(
        CHK_FORMATDICT["UNIT"], unit_bytes[i * format_size : (i + 1) * format_size]
      )
      unit_id: int = unit[3]
      unitdata = self.unitdata_table[unit_id]

      unitdata.serial_number = unit[0]
      unitdata.relation_type = unit[4]
      unitdata.spetial_properties = unit[5]
      unitdata.valid_properties = unit[6]
      unitdata.owner = unit[7]
      unitdata.hit_points.current = unitdata.hit_points.max // unit[8] * 100
      unitdata.shield_hpoints.current = unitdata.shield_hpoints.max // unit[9] * 100
      unitdata.resource_amount = unit[10]
      unitdata.hangar = unit[11]
      unitdata.unit_state = unit[12]
      unitdata.related_unit = unit[13]

      result.append(unitdata)

    return result

  def get_terrain(self) -> RawTerrain:
    dim = struct.unpack(CHK_FORMATDICT["DIM "], self.chkt.getsection("DIM "))
    era = struct.unpack(CHK_FORMATDICT["ERA "], self.chkt.getsection("ERA "))

    dimension: Size = Size(width=dim[0], height=dim[1])
    tileset = era[0]

    tile_id: list[list[Tile]] = [
      [Tile(group=0, id=0) for _ in range(dimension.width)] for _ in range(dimension.height)
    ]
    mtxm = struct.unpack(
      f"{dimension.height * dimension.width}H", self.chkt.getsection("MTXM")
    )

    for y in range(dimension.height - 1):
      for x in range(dimension.width - 1):
        tile = Tile(
          group=mtxm[y * dimension.width + x] >> 4,
          id=mtxm[y * dimension.width + x] & 0xF,
        )
        tile_id[y][x] = tile

    return RawTerrain(size=dimension, tileset=EraTilesetDict[tileset], tile_id=tile_id)

  def get_players(self) -> list[Player]:
    ownr = struct.unpack(CHK_FORMATDICT["OWNR"], self.chkt.getsection("OWNR"))
    side = struct.unpack(CHK_FORMATDICT["SIDE"], self.chkt.getsection("SIDE"))
    colr = struct.unpack(CHK_FORMATDICT["COLR"], self.chkt.getsection("COLR"))

    result: list[Player] = [
      Player(id=i, color=0, player_type="Computer", race="Inactive") for i in range(12)
    ]

    for index, player in enumerate(result):
      player.player_type = OwnrPlayerTypeDict[ownr[index]]
      player.race = SidePlayerRaceDict[side[index]]

      if index < 8:
        pass  # TODO: Color Setting

    return result

  def get_locations(self) -> list[Location]:
    mrgn_bytes = self.chkt.getsection("MRGN")
    format_size = struct.calcsize(CHK_FORMATDICT["MRGN"])
    location_count = len(mrgn_bytes) // format_size

    result: list[Location] = []
    for i in range(0, location_count):
      mrgn = struct.unpack(
        CHK_FORMATDICT["MRGN"], mrgn_bytes[i * format_size : (i + 1) * format_size]
      )
      result.append(
        Location(
          position=RectPosition(
            Left=mrgn[0], Top=mrgn[1], Right=mrgn[2], bottom=mrgn[3]
          ),
          name_id=mrgn[4],
          elevation_flags=mrgn[5],
        )
      )

    return result

  def get_sprites(self) -> list[Sprite]:
    thg2_bytes = self.chkt.getsection("THG2")
    format_size = struct.calcsize(CHK_FORMATDICT["THG2"])
    sprite_count = len(thg2_bytes) // format_size

    result: list[Sprite] = []
    for i in range(0, sprite_count):
      sprite = struct.unpack(
        CHK_FORMATDICT["THG2"], thg2_bytes[i * format_size : (i + 1) * format_size]
      )
      result.append(
        Sprite(
          id=sprite[0],
          position=Position2D(x=sprite[1], y=sprite[2]),
          player=sprite[3],
          flags=sprite[5],
        )
      )

    return result

  def get_strings(self) -> list[String]:
    str_bytes = self.chkt.getsection("STRx")
    string_count = struct.unpack("I", str_bytes[0:4])[0]

    result: list[String] = []
    for i in range(4, 4 * string_count, 4):
      start_string_offset = struct.unpack("I", str_bytes[i : i + 4])[0]
      next_string_offset = struct.unpack("I", str_bytes[i + 4 : i + 8])[0]
      string_content = str_bytes[start_string_offset:next_string_offset].decode("utf-8")
      result.append(String(id=i // 4, content=string_content))

    return result
