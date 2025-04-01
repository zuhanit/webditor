from eudplib.core.mapdata.chktok import CHK as EPCHK
from typing import Literal, TypedDict, cast
from app.models.unit import Cost, Stat, Unit, UnitProperty, UnitRestriction
from app.models.terrain import EraTilesetReverseDict, RawTerrain, Size, Tile, EraTilesetDict
from app.models.player import Force, OwnrPlayerTypeReverseDict, Player, OwnrPlayerTypeDict, SidePlayerRaceDict, SidePlayerRaceReverseDict
from app.models.location import Location
from app.models.spatial import Position2D, RectPosition
from app.models.sprite import Sprite
from app.models.string import String
from app.models.components.transform import Transform
from app.models.components.weapon import Weapon
from app.models.validation import Validation
from app.models.mask import Mask
from app.models.tech import TechRestriction, UpgradeRestriction, TechCost, Technology, UpgradeSetting
from app.models.cost import Cost
from app.models.rawtrigger import RawTriggerSection
from app.models.project import RawMap, ScenarioProperty
import struct
import copy



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
  "UNIT": "I 6H 4B I 2H 2I",
  "THG2": "3H2BH",
  "MASK": "B",
  "UPRP": "2H4BI2HI",
  "SPRP": "2H",
  "PUNI": "3B",
  "UPGR": "5B",
  "PTEC": "5B",
  "UPGx": "5B",
  "TECx": "B4H",
  "VER ": "H",
  "VCOD": "256I16B",
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
  size: Size
  """Not placed unit table."""

  def __init__(self, chkt: EPCHK):
    self.chkt = chkt
    self.string_table = self.get_strings()
    self.player_table = self.get_players()
    self.unitdata_table = self.get_units()
    self.size = self.get_terrain().size

  """
  Unit section processings 
  """
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
          cost=Cost(mineral=unpacked[id + (228 * 6)], gas=unpacked[id + (228 * 5)], time=unpacked[id + (228 * 4)]),
          name=unit_name.content,
          hit_points=hit_points,
          shield_points=shield_points,
          armor_points=unpacked[id + (228 * 3)],
          weapon=weapon,
          resource_amount=0,
          hangar=0,
          unit_state=0,
          related_unit=0,
        )
      )

    return result

  def get_placed_units(self) -> list[Unit]:
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
      unitdata = copy.deepcopy(self.unitdata_table[unit_id])

      unitdata.transform.position.x = unit[1]
      unitdata.transform.position.y = unit[2]
      unitdata.serial_number = unit[0]
      unitdata.relation_type = unit[4]
      unitdata.special_properties = unit[5]
      unitdata.valid_properties = unit[6]
      unitdata.owner = self.player_table[unit[7]]
      unitdata.hit_points.current = unitdata.hit_points.max * unit[8] // 100
      unitdata.shield_points.current = unitdata.shield_points.max * unit[9] // 100
      unitdata.resource_amount = unit[10]
      unitdata.hangar = unit[11]
      unitdata.unit_state = unit[12]
      unitdata.related_unit = unit[13]

      result.append(unitdata)

    return result

  def get_unit_properties(self) -> list[UnitProperty]:
    uprp_bytes = self.chkt.getsection("UPRP")
    format_size = struct.calcsize(CHK_FORMATDICT["UPRP"])
    section_count = len(uprp_bytes) // format_size
    
    result: list[UnitProperty] = []
    for i in range(section_count):
      index = format_size * i
      uprp = struct.unpack(CHK_FORMATDICT["UPRP"], uprp_bytes[index : index + format_size])
      result.append(UnitProperty(
        id=i,
        special_properties=uprp[0],
        unit_data=uprp[1],
        owner=0, # Always be NULL in UPRP section,
        hit_point_percent=uprp[3],
        shield_point_percent=uprp[4],
        energy_point_percent=uprp[5],
        resource_amount=uprp[6],
        units_in_hangar=uprp[7],
        flags=uprp[8]
      ))
      
    return result
  
  def get_unit_restrictions(self) -> list[UnitRestriction]:
    puni_bytes = self.chkt.getsection("PUNI")
    
    UNIT_COUNT = 228
    PLAYER_COUNT = 12
  
    PLAYER_AVAILABILITY_OFFSET = 0
    GLOBAL_AVAILABILITY_OFFSET = PLAYER_AVAILABILITY_OFFSET + UNIT_COUNT * PLAYER_COUNT
    USES_DEFAULTS_OFFSET = GLOBAL_AVAILABILITY_OFFSET + UNIT_COUNT
  
    result: list[UnitRestriction] = []
    for i in range(UNIT_COUNT):
        player_availability = cast(list[bool], list(puni_bytes[
            PLAYER_AVAILABILITY_OFFSET + i * PLAYER_COUNT:
            PLAYER_AVAILABILITY_OFFSET + (i + 1) * PLAYER_COUNT
        ]))
        global_availability = cast(bool, puni_bytes[GLOBAL_AVAILABILITY_OFFSET + i])
        uses_defaults = cast(list[bool], list(puni_bytes[
            USES_DEFAULTS_OFFSET + i * PLAYER_COUNT:
            USES_DEFAULTS_OFFSET + (i + 1) * PLAYER_COUNT
        ]))
  
        result.append(UnitRestriction(
            id=i,
            availability=player_availability,
            global_availability=global_availability,
            uses_defaults=uses_defaults,
        ))
  
    return result

  """
  Terrain section processing 
  """
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

    for y in range(dimension.height):
      for x in range(dimension.width):
        tile = Tile(
          group=mtxm[y * dimension.width + x] >> 4,
          id=mtxm[y * dimension.width + x] & 0xF,
        )
        tile_id[y][x] = tile

    return RawTerrain(size=dimension, tileset=EraTilesetDict[tileset], tile_id=tile_id)

  """
  Player section processings
  """
  def get_players(self) -> list[Player]:
    ownr = struct.unpack(CHK_FORMATDICT["OWNR"], self.chkt.getsection("OWNR"))
    side = struct.unpack(CHK_FORMATDICT["SIDE"], self.chkt.getsection("SIDE"))
    colr = struct.unpack(CHK_FORMATDICT["COLR"], self.chkt.getsection("COLR"))

    result: list[Player] = [
      Player(id=i, name=f"Player {i+1}", color=0, player_type="Computer", race="Inactive") for i in range(12)
    ]

    for index, player in enumerate(result):
      player.player_type = OwnrPlayerTypeDict[ownr[index]]
      player.race = SidePlayerRaceDict[side[index]]

      if index < 8:
        # TODO: CRGB-based color setting
        player.color = colr[index]
    
    FORC = struct.unpack("8B 4H 4B", self.chkt.getsection("FORC"))
    P = FORC[0:8]
    for index, value in enumerate(P):
      result[index].force = value 

    return result

  def get_forces(self) -> list[Force]: 
    FORC = struct.unpack("8B 4H 4B", self.chkt.getsection("FORC"))
    
    result: list[Force] = []
    for i in range(4):
      name_index: int = FORC[8 + i] - 1
      result.append(Force(
        id=i,
        name=self.string_table[name_index].content,
        properties=FORC[12 + i],
      ))
    
    return result

  """
  Location section processing
  """
  def get_locations(self) -> list[Location]:
    mrgn_bytes = self.chkt.getsection("MRGN")
    format_size = struct.calcsize(CHK_FORMATDICT["MRGN"])
    location_count = len(mrgn_bytes) // format_size

    result: list[Location] = []
    for i in range(0, location_count):
      MRGN = struct.unpack(
        CHK_FORMATDICT["MRGN"], mrgn_bytes[i * format_size : (i + 1) * format_size]
      )
      result.append(
        Location(
          position=RectPosition(
            Left=MRGN[0], Top=MRGN[1], Right=MRGN[2], bottom=MRGN[3]
          ),
          name_id=MRGN[4],
          elevation_flags=MRGN[5],
        )
      )

    return result

  """
  Sprite section processing
  """
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
          transform=Transform(
            position=Position2D(
              x=sprite[1],
              y=sprite[2]
            )
          ),
          owner=sprite[3],
          flags=sprite[5],
        )
      )

    return result

  """
  String section processing
  """
  def get_strings(self) -> list[String]:
    str_bytes = self.chkt.getsection("STRx")
    string_count = struct.unpack("I", str_bytes[0:4])[0]
    print("SC:", string_count)
    offsets = [struct.unpack("I", str_bytes[i : i + 4])[0]
               for i in range(4, 4 + 4 * string_count, 4)]
    

    result: list[String] = []
    for i in range(string_count):
      start = offsets[i]
      end = offsets[i + 1] if i + 1 < len(offsets) else len(str_bytes)
      string_content = str_bytes[start:end].split(b"\x00")[0].decode("utf-8")
      result.append(String(id=i, content=string_content))

    return result
  
  def get_scenario_properties(self) -> ScenarioProperty:
    if (len(self.string_table) == 0):
      raise ValueError("Must initialize string table before call `get_scenario_properties()`")

    SPRP = struct.unpack("2H", self.chkt.getsection("SPRP"))
    
    return ScenarioProperty(
      name=self.string_table[SPRP[0] - 1],
      description=self.string_table[SPRP[1] - 1],
    )
    
  """
  Validation section processing 
  """

  def get_validation(self) -> Validation:
    ver_bytes = self.chkt.getsection("VER ")
    
    # FIXME: VCOD validation need
    vcod_bytes = self.chkt.getsection("VCOD")
    
    return Validation(
      ver=ver_bytes,
      vcod=vcod_bytes,
    )
    
  def get_mask(self) -> list[Mask]:
    mask_bytes = self.chkt.getsection("MASK")
    
    result: list[Mask] = []
    for x in range(self.size.height):
      for y in range(self.size.width):
        position = y * self.size.width + x
        flag = struct.unpack("B", mask_bytes[position : position + 1])[0]
        result.append(Mask(id=position, flags=flag))
        
    return result
   
  """
  Tech section processings
  """
  def get_upgrade_restrictions(self) -> list[UpgradeRestriction]:
    pupx_bytes = self.chkt.getsection("PUPx")

    UPGRADE_COUNT = 61
    PLAYER_COUNT = 12
    PLAYER_MAX_OFFSET = 0
    PLAYER_MIN_OFFSET = PLAYER_MAX_OFFSET + UPGRADE_COUNT * PLAYER_COUNT
    DEFAULT_MAX_OFFSET = PLAYER_MIN_OFFSET + UPGRADE_COUNT * PLAYER_COUNT
    DEFAULT_START_OFFSET = DEFAULT_MAX_OFFSET + UPGRADE_COUNT
    USES_DEFAULT_OFFSET = DEFAULT_START_OFFSET + UPGRADE_COUNT

    result: list[UpgradeRestriction] = []

    for i in range(UPGRADE_COUNT):
        player_max = list(pupx_bytes[PLAYER_MAX_OFFSET + i * PLAYER_COUNT : PLAYER_MAX_OFFSET + (i + 1) * PLAYER_COUNT])
        player_min = list(pupx_bytes[PLAYER_MIN_OFFSET + i * PLAYER_COUNT : PLAYER_MIN_OFFSET + (i + 1) * PLAYER_COUNT])
        default_max = pupx_bytes[DEFAULT_MAX_OFFSET + i]
        default_start = pupx_bytes[DEFAULT_START_OFFSET + i]
        uses_default = list(pupx_bytes[USES_DEFAULT_OFFSET + i * PLAYER_COUNT : USES_DEFAULT_OFFSET + (i + 1) * PLAYER_COUNT])

        result.append(
            UpgradeRestriction(
                id=i,
                player_maximum_level=player_max,
                player_minimum_level=player_min,
                default_maximum_level=default_max,
                default_minimum_level=default_start,
                uses_default=cast(list[bool], uses_default)
            )
        )

    return result
  
  def get_tech_restrictions(self) -> list[TechRestriction]:
    ptex_bytes = self.chkt.getsection("PTEx")

    TECH_COUNT = 44
    PLAYER_COUNT = 12
    PLAYER_AVAILABILITY_OFFSET = 0
    PLAYER_RESEARCHED_OFFSET = PLAYER_AVAILABILITY_OFFSET + TECH_COUNT * PLAYER_COUNT
    DEFAULT_AVAILABILITY_OFFSET = PLAYER_RESEARCHED_OFFSET + TECH_COUNT * PLAYER_COUNT
    DEFAULT_RESEARCHED_OFFSET = DEFAULT_AVAILABILITY_OFFSET + TECH_COUNT
    USES_DEFAULT_OFFSET = DEFAULT_RESEARCHED_OFFSET + TECH_COUNT

    result: list[TechRestriction] = []
    for i in range(TECH_COUNT):
      player_availability: list[bool] = cast(list[bool], list(ptex_bytes[
        PLAYER_AVAILABILITY_OFFSET + i * PLAYER_COUNT :
        PLAYER_AVAILABILITY_OFFSET + (i + 1) * PLAYER_COUNT
      ]))
      player_researched = cast(list[bool], list(ptex_bytes[
        PLAYER_RESEARCHED_OFFSET + i * PLAYER_COUNT :
        PLAYER_RESEARCHED_OFFSET + (i + 1) * PLAYER_COUNT
      ]))
      default_availability = cast(bool, ptex_bytes[DEFAULT_AVAILABILITY_OFFSET + i])
      default_researched = cast(bool, ptex_bytes[DEFAULT_RESEARCHED_OFFSET + i])
      uses_defaults = cast(list[bool], list(ptex_bytes[
        USES_DEFAULT_OFFSET + i * PLAYER_COUNT :
        USES_DEFAULT_OFFSET + (i + 1) * PLAYER_COUNT
      ]))

      result.append(
        TechRestriction(
          id=i,
          player_availability=player_availability,
          player_already_researched=player_researched,
          default_availability=default_availability,
          default_already_researched=default_researched,
          uses_default=uses_defaults,
        )
      )

    return result
  
  def get_upgrade_settings(self) -> list[UpgradeSetting]:
      upgx_bytes = self.chkt.getsection("UPGx")
      UPGx = struct.unpack(f"61B B {61 * 6}H", upgx_bytes)

      UPGRADE_COUNT = 61
      USES_DEFAULT_OFFSET = 0
      UNUSED_OFFSET = USES_DEFAULT_OFFSET + UPGRADE_COUNT
      BASE_MINERAL_OFFSET = UNUSED_OFFSET + 1
      FACTOR_MINERAL_OFFSET = BASE_MINERAL_OFFSET + UPGRADE_COUNT
      BASE_GAS_OFFSET = FACTOR_MINERAL_OFFSET + UPGRADE_COUNT
      FACTOR_GAS_OFFSET = BASE_GAS_OFFSET + UPGRADE_COUNT
      BASE_TIME_OFFSET = FACTOR_GAS_OFFSET + UPGRADE_COUNT
      FACTOR_TIME_OFFSET = BASE_TIME_OFFSET + UPGRADE_COUNT

      result: list[UpgradeSetting] = []
      for i in range(UPGRADE_COUNT):
          result.append(
              UpgradeSetting(
                  id=i,
                  uses_default=UPGx[USES_DEFAULT_OFFSET + i],
                  base_cost=Cost(
                      mineral=UPGx[BASE_MINERAL_OFFSET + i],
                      gas=UPGx[BASE_GAS_OFFSET + i],
                      time=UPGx[BASE_TIME_OFFSET + i],
                  ),
                  factor_cost=Cost(
                      mineral=UPGx[FACTOR_MINERAL_OFFSET + i],
                      gas=UPGx[FACTOR_GAS_OFFSET + i],
                      time=UPGx[FACTOR_TIME_OFFSET + i],
                  ),
              )
          )

      return result
  
  def get_technologies(self) -> list[Technology]:
    tecx_bytes = self.chkt.getsection("TECx")
    TECx = struct.unpack("44B 44H 44H 44H 44H", tecx_bytes)
    
    TECH_COUNT = 44
    USE_DEFAULT_OFFSET = 0
    MINERAL_COST_OFFSET = USE_DEFAULT_OFFSET + TECH_COUNT
    GAS_COST_OFFSET = MINERAL_COST_OFFSET + TECH_COUNT
    TIME_COST_OFFSET = GAS_COST_OFFSET + TECH_COUNT
    ENERGY_COST_OFFSET = TIME_COST_OFFSET + TECH_COUNT
    
    result: list[Technology] = [] 
    for i in range(TECH_COUNT):
      result.append(
        Technology(
          id=i,
          use_default=TECx[USE_DEFAULT_OFFSET + i : USE_DEFAULT_OFFSET + i + 1][0],
          cost=TechCost(
            mineral=TECx[MINERAL_COST_OFFSET + i : MINERAL_COST_OFFSET + i + 1][0],
            gas=TECx[GAS_COST_OFFSET + i : GAS_COST_OFFSET + i + 1][0],
            time=TECx[TIME_COST_OFFSET + i : TIME_COST_OFFSET + i + 1][0],
            energy=TECx[ENERGY_COST_OFFSET + i : ENERGY_COST_OFFSET + i + 1][0]
          )
        )
      )
      
    return result
