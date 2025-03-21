from eudplib import GetChkTokenized
from typing import TypedDict
from pydantic import BaseModel
from app.models.unit import RawUnit, Unit, PlacedUnit
from app.models.terrain import RawTerrain, Size, Tile, EraTilesetDict
from app.models.player import Player, OwnrPlayerTypeDict, SidePlayerRaceDict
from app.models.location import Location, ElevationFlag
from app.models.spatial import Position2D, RectPosition
from app.models.sprite import Sprite
from app.models.string import String
import struct


CHK_FORMATDICT: dict[str, str] = {
  "UNIx": "".join(("228B",  "228I", "228H", "228B", "228H", "228H", "228H", "228H", "130H", "130H")),
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
  "VER": "H"
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

class CHK(BaseModel):
  units: list[Unit]

  def __init__(self):
    ...

  def unix_bytes_to_unit(self, unit_bytes: bytes) -> list[RawUnit]:
    result: list[RawUnit] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], unit_bytes)
    for id in range(228):
      result.append(RawUnit(
        id=0,
        use_default=False,
        hit_points=unpacked[id + 228],
        shield_points=unpacked[id + (228 * 2)],
        armor_points=unpacked[id + (228 * 3)],
        build_time=unpacked[id + (228 * 4)],
        mineral_cost=unpacked[id + (228 * 5)],
        gas_cost=unpacked[id + (228 * 6)],
        string_number=unpacked[id + (228 * 7)],
        weapon_damage=1,
        weapon_upgrade_damage=1
      ))

    return result
  
  def tileset_bytes_to_terrain(self, tileset_bytes: TerrainSections) -> RawTerrain:
    dim = struct.unpack(CHK_FORMATDICT["DIM "], tileset_bytes["DIM"])
    era = struct.unpack(CHK_FORMATDICT["ERA "], tileset_bytes["ERA"])

    dimension: Size = Size(width=dim[0], height=dim[1])
    tileset = era[0]
    
    tile_id: list[list[Tile]] = [[Tile(id=0, group=0)] * dimension.width for _ in range(dimension.height)]
    mtxm =  struct.unpack(f"{dimension.height * dimension.width}H", tileset_bytes["MTXM"])
    
    for y in range(dimension.height - 1):
      for x in range(dimension.width - 1):
        tile = Tile(
          group=mtxm[y * dimension.width + x] >> 4,
          id=mtxm[y * dimension.width + x] & 0xF
        )
        tile_id[y][x] = tile
  
    return RawTerrain(
      size=dimension,
      tileset=EraTilesetDict[tileset],
      tile_id=tile_id
    )
  
  def player_bytes_to_player(self, player_bytes: PlayerSections) -> list[Player]:
    ownr = struct.unpack(CHK_FORMATDICT["OWNR"], player_bytes["OWNR"])
    side = struct.unpack(CHK_FORMATDICT["SIDE"], player_bytes["SIDE"])
    colr = struct.unpack(CHK_FORMATDICT["COLR"], player_bytes["COLR"])
    
    result: list[Player] = [Player(id=i, color=0, player_type="Computer", race="Inactive") for i in range(12)]
    
    for index, player in enumerate(result):
      player.player_type = OwnrPlayerTypeDict[ownr[index]]
      player.race = SidePlayerRaceDict[side[index]]
      
      if (index < 8):
        pass #TODO: Color Setting
        
    return result

  def mrgn_bytes_to_location(self, mrgn_bytes: bytes) -> list[Location]:
    format_size = struct.calcsize(CHK_FORMATDICT["MRGN"])
    location_count = len(mrgn_bytes) // format_size
    
    result: list[Location] = []
    for i in range(0, location_count):
      mrgn = struct.unpack(CHK_FORMATDICT["MRGN"], mrgn_bytes[i*format_size : (i+1) * format_size])
      result.append(Location(
        position=RectPosition(
          Left=mrgn[0],
          Top=mrgn[1],
          Right=mrgn[2],
          bottom=mrgn[3]
        ),
        name_id=mrgn[4],
        elevation_flags=mrgn[5]
      ))
    
    return result
  
  def unit_bytes_to_placed_unit(self, unit_bytes: bytes) -> list[PlacedUnit]:
    format_size = struct.calcsize(CHK_FORMATDICT["UNIT"])
    unit_count = len(unit_bytes) // format_size
    
    result: list[PlacedUnit] = []
    for i in range(0, unit_count):
      unit = struct.unpack(CHK_FORMATDICT["UNIT"], unit_bytes[i*format_size : (i+1) * format_size])
      result.append(PlacedUnit(
        serial_number=unit[0],
        position=Position2D(
          x=unit[1],
          y=unit[2]
        ),
        id=unit[3],
        relation_type=unit[4],
        special_properties=unit[5],
        valid_properties=unit[6],
        owner=unit[7],
        hp_percent=unit[8],
        shield_percent=unit[9],
        resource_amount=unit[10],
        hangar=unit[11],
        unit_state=unit[12],
        related_unit=unit[13]
      ))
    
    return result

  def thg2_to_sprites(self, thg2_bytes: bytes) -> list[Sprite]:
    format_size = struct.calcsize(CHK_FORMATDICT["THG2"])
    sprite_count = len(thg2_bytes) // format_size
    
    result: list[Sprite] = []
    for i in range(0, sprite_count):
      sprite = struct.unpack(CHK_FORMATDICT["THG2"], thg2_bytes[i*format_size : (i+1) * format_size])
      result.append(Sprite(
        id=sprite[0],
        position=Position2D(
          x=sprite[1],
          y=sprite[2]
        ),
        player=sprite[3],
        flags=sprite[5]
      ))
      
    return result
    
  def strx_to_string(self, str_bytes: bytes) -> list[String]:
    string_count = struct.unpack("I", str_bytes[0:4])[0]

    result: list[String] = []
    for i in range(4, 4*string_count, 4):
      start_string_offset = struct.unpack("I", str_bytes[i:i+4])[0]
      next_string_offset = struct.unpack("I", str_bytes[i+4:i+8])[0]
      string_content = str_bytes[start_string_offset:next_string_offset].decode("utf-8")
      result.append(String(
        id=i // 4,
        content=string_content
      ))

    return result