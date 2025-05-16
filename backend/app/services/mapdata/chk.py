from app.core.w_logging import get_logger
from eudplib.core.mapdata.chktok import CHK as EPCHK
from typing import Literal, TypedDict, cast
from app.models.unit import Cost, Stat, CHKUnit, UnitProperty, UnitRestriction
from app.models.terrain import (
  EraTilesetReverseDict,
  RawTerrain,
  Size,
  Tile,
  EraTilesetDict,
)
from app.models.player import (
  Force,
  OwnrPlayerTypeReverseDict,
  Player,
  OwnrPlayerTypeDict,
  SidePlayerRaceDict,
  SidePlayerRaceReverseDict,
)
from app.models.location import Location
from app.models.structs.spatial import Position2D, RectPosition
from app.models.sprite import CHKSprite
from app.models.string import String
from app.models.components.transform import TransformComponent
from app.models.definitions.weapon_definition import CHKWeapon, Damage
from app.models.validation import Validation
from app.models.mask import Mask
from app.models.tech import (
  TechRestriction,
  UpgradeRestriction,
  TechCost,
  CHKTechnology,
  UpgradeSetting,
)
from app.models.rawtrigger import RawTriggerSection
from app.models.project import Usemap, ScenarioProperty
from ..utils.reverse import reverse_tbl_dict
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

DEFAULT_PLAYER_COLOR = (
  (244, 4, 4),
  (12, 72, 204),
  (44, 180, 148),
  (136, 4, 156),
  (248, 140, 20),
  (112, 48, 20),
  (204, 224, 208),
  (252, 252, 56),
  (8, 128, 8),
  (252, 252, 124),
  (252, 252, 124),
  (236, 196, 176),
  (64, 104, 212),
)


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

  units: list[CHKUnit]
  chkt: EPCHK
  string_table: list[String] = []
  player_table: list[Player] = []
  unitdata_table: list[CHKUnit] = []
  size: Size
  unit_serial_number: int = 0
  """Not placed unit table."""

  def __init__(self, chkt: EPCHK):
    self.logger = get_logger("CHK")
    self.logger.debug("Initializing CHK with raw data.")
    self.chkt = chkt
    self.string_table = self.get_strings()
    self.player_table = self.get_players()
    self.unitdata_table = self.get_unit_definitions()
    self.size = self.get_terrain().size

  """
  Unit section processings 
  """

  def get_unit_definitions(self) -> list[CHKUnit]:
    from eudplib.core.rawtrigger.strdict.stattxt import DefStatTextDict

    if len(self.string_table) == 0:
      raise ValueError("Must initialize string table before call `get units`")

    result: list[CHKUnit] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], self.chkt.getsection("UNIx"))
    for id in range(228):
      unitname_id: int = unpacked[id + (228 * 7)]
      unit_name = (
        self.string_table[unitname_id].content
        if unitname_id != 0
        else reverse_tbl_dict(DefStatTextDict)[id + 1]
      )
      hit_points = Stat(current=unpacked[id + 228], max=unpacked[id + 228])
      shield_points = Stat(
        current=unpacked[id + (228 * 2)], max=unpacked[id + (228 * 2)]
      )
      result.append(
        CHKUnit(
          id=id,
          cost=Cost(
            mineral=unpacked[id + (228 * 6)],
            gas=unpacked[id + (228 * 5)],
            time=unpacked[id + (228 * 4)],
          ),
          name=unit_name,
          hit_points=hit_points,
          shield_points=shield_points,
          armor_points=unpacked[id + (228 * 3)],
          resource_amount=0,
          hangar=0,
          unit_state=0,
          related_unit=0,
          transform=TransformComponent(position=Position2D(x=0, y=0)),
        )
      )

    self.logger.debug(f"get_units complete: {len(result)} units parsed.")
    return result

  def get_placed_units(self) -> list[CHKUnit]:
    if len(self.unitdata_table) == 0:
      raise ValueError("Must initialize unitdata table before call `get_placed_units`")

    unit_bytes = self.chkt.getsection("UNIT")
    format_size = struct.calcsize(CHK_FORMATDICT["UNIT"])
    unit_count = len(unit_bytes) // format_size

    result: list[CHKUnit] = []
    for i in range(0, unit_count):
      unit = struct.unpack(
        CHK_FORMATDICT["UNIT"], unit_bytes[i * format_size : (i + 1) * format_size]
      )
      unit_id: int = unit[3]
      unitdata = copy.deepcopy(self.unitdata_table[unit_id])

      unitdata.transform.position.x = unit[1]
      unitdata.transform.position.y = unit[2]
      unitdata.serial_number = (
        self.unit_serial_number if unit_id != 214 else None
      )  # Start Location will be ignored.
      self.unit_serial_number += 1 if unit_id != 214 else 0
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

    self.logger.debug(f"get_placed_units complete: {len(result)} units parsed.")
    return result

  def get_unit_properties(self) -> list[UnitProperty]:
    uprp_bytes = self.chkt.getsection("UPRP")
    format_size = struct.calcsize(CHK_FORMATDICT["UPRP"])
    section_count = len(uprp_bytes) // format_size

    result: list[UnitProperty] = []
    for i in range(section_count):
      index = format_size * i
      uprp = struct.unpack(
        CHK_FORMATDICT["UPRP"], uprp_bytes[index : index + format_size]
      )
      result.append(
        UnitProperty(
          id=i,
          special_properties=uprp[0],
          unit_data=uprp[1],
          owner=0,  # Always be NULL in UPRP section,
          hit_point_percent=uprp[3],
          shield_point_percent=uprp[4],
          energy_point_percent=uprp[5],
          resource_amount=uprp[6],
          units_in_hangar=uprp[7],
          flags=uprp[8],
        )
      )

    self.logger.debug(
      f"get_placed_properties complete: {len(result)} properties parsed."
    )
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
      player_availability = cast(
        list[bool],
        list(
          puni_bytes[
            PLAYER_AVAILABILITY_OFFSET + i * PLAYER_COUNT : PLAYER_AVAILABILITY_OFFSET
            + (i + 1) * PLAYER_COUNT
          ]
        ),
      )
      global_availability = cast(bool, puni_bytes[GLOBAL_AVAILABILITY_OFFSET + i])
      uses_defaults = cast(
        list[bool],
        list(
          puni_bytes[
            USES_DEFAULTS_OFFSET + i * PLAYER_COUNT : USES_DEFAULTS_OFFSET
            + (i + 1) * PLAYER_COUNT
          ]
        ),
      )

      result.append(
        UnitRestriction(
          id=i,
          availability=player_availability,
          global_availability=global_availability,
          uses_defaults=uses_defaults,
        )
      )

    self.logger.debug(
      f"get_placed_restrictions complete: {len(result)} restrictions parsed."
    )
    return result

  """
  Weapon section processing.
  """

  def get_weapons(self) -> list[CHKWeapon]:
    result: list[CHKWeapon] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], self.chkt.getsection("UNIx"))[
      228 * 8 :
    ]
    for id in range(130):
      result.append(
        CHKWeapon(
          damage=Damage(amount=unpacked[id], bonus=unpacked[130 + id], factor=0)
        )
      )

    self.logger.debug(f"get_weapons complete: {len(result)} weapons parsed.")
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
      [Tile(group=0, id=0) for _ in range(dimension.width)]
      for _ in range(dimension.height)
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

    self.logger.debug(
      f"get_trains complete. Width: {dimension.width}, Height: {dimension.height}"
    )
    return RawTerrain(size=dimension, tileset=EraTilesetDict[tileset], tile_id=tile_id)

  """
  Player section processings
  """

  def get_players(self) -> list[Player]:
    ownr = struct.unpack(CHK_FORMATDICT["OWNR"], self.chkt.getsection("OWNR"))
    side = struct.unpack(CHK_FORMATDICT["SIDE"], self.chkt.getsection("SIDE"))
    colr = struct.unpack(CHK_FORMATDICT["COLR"], self.chkt.getsection("COLR"))

    result: list[Player] = [
      Player(
        id=i,
        name=f"Player {i + 1}",
        color=0,
        rgb_color=(0, 0, 0),
        player_type="Computer",
        race="Inactive",
      )
      for i in range(12)
    ]

    for index, player in enumerate(result):
      player.player_type = OwnrPlayerTypeDict[ownr[index]]
      player.race = SidePlayerRaceDict[side[index]]

      if index < 8:
        # TODO: CRGB-based color setting
        player.color = colr[index]
        player.rgb_color = DEFAULT_PLAYER_COLOR[player.color]

    FORC = struct.unpack("8B 4H 4B", self.chkt.getsection("FORC"))
    P = FORC[0:8]
    for index, value in enumerate(P):
      result[index].force = value

    self.logger.debug(f"get_players complete. {len(result)} players parsed.")
    return result

  def get_forces(self) -> list[Force]:
    FORC = struct.unpack("8B 4H 4B", self.chkt.getsection("FORC"))

    result: list[Force] = []
    for i in range(4):
      name_index: int = FORC[8 + i] - 1
      result.append(
        Force(
          id=i,
          name=self.string_table[name_index].content,
          properties=FORC[12 + i],
        )
      )

    self.logger.debug(f"get_forces complete. {len(result)} forces parsed.")
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
      if (MRGN[0], MRGN[1], MRGN[2], MRGN[3]) != (0, 0, 0, 0):
        result.append(
          Location(
            id=i,
            position=RectPosition(
              left=MRGN[0], top=MRGN[1], right=MRGN[2], bottom=MRGN[3]
            ),
            name_id=MRGN[4],
            elevation_flags=MRGN[5],
            name=self.string_table[MRGN[4] - 1].content,
          )
        )

    self.logger.debug(f"get_locations complete. {len(result)} locations parsed.")
    return result

  """
  Sprite section processing
  """

  def get_placed_sprites(self) -> list[CHKSprite]:
    thg2_bytes = self.chkt.getsection("THG2")
    format_size = struct.calcsize(CHK_FORMATDICT["THG2"])
    sprite_count = len(thg2_bytes) // format_size

    result: list[CHKSprite] = []
    for i in range(0, sprite_count):
      sprite = struct.unpack(
        CHK_FORMATDICT["THG2"], thg2_bytes[i * format_size : (i + 1) * format_size]
      )
      result.append(
        CHKSprite(
          id=sprite[0],
          transform=TransformComponent(position=Position2D(x=sprite[1], y=sprite[2])),
          owner=sprite[3],
          flags=sprite[5],
        )
      )

    self.logger.debug(f"get_placed_sprites complete. {len(result)} sprites parsed.")
    return result

  """
  String section processing
  """

  def get_strings(self) -> list[String]:
    str_bytes = self.chkt.getsection("STRx")
    string_count = struct.unpack("I", str_bytes[0:4])[0]
    offsets = [
      struct.unpack("I", str_bytes[i : i + 4])[0]
      for i in range(4, 4 + 4 * string_count, 4)
    ]

    result: list[String] = []
    for i in range(string_count):
      start = offsets[i]
      end = offsets[i + 1] if i + 1 < len(offsets) else len(str_bytes)
      string_content = str_bytes[start:end].split(b"\x00")[0].decode("utf-8")
      result.append(String(id=i, content=string_content))

    return result

  def get_scenario_properties(self) -> ScenarioProperty:
    if len(self.string_table) == 0:
      raise ValueError(
        "Must initialize string table before call `get_scenario_properties()`"
      )

    SPRP = struct.unpack("2H", self.chkt.getsection("SPRP"))
    name = self.string_table[SPRP[0] - 1]
    description = self.string_table[SPRP[1] - 1]

    self.logger.debug(
      f"get_scenario_properties complete. name: {name}, description: {description}"
    )

    return ScenarioProperty(name=name, description=description)

  """
  Validation section processing 
  """

  def get_validation(self) -> Validation:
    ver_bytes = self.chkt.getsection("VER ")

    # FIXME: VCOD validation need
    vcod_bytes = self.chkt.getsection("VCOD")

    self.logger.debug("get_validation complete.")
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

    self.logger.debug("get_mask complete.")
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
      player_max = list(
        pupx_bytes[
          PLAYER_MAX_OFFSET + i * PLAYER_COUNT : PLAYER_MAX_OFFSET
          + (i + 1) * PLAYER_COUNT
        ]
      )
      player_min = list(
        pupx_bytes[
          PLAYER_MIN_OFFSET + i * PLAYER_COUNT : PLAYER_MIN_OFFSET
          + (i + 1) * PLAYER_COUNT
        ]
      )
      default_max = pupx_bytes[DEFAULT_MAX_OFFSET + i]
      default_start = pupx_bytes[DEFAULT_START_OFFSET + i]
      uses_default = list(
        pupx_bytes[
          USES_DEFAULT_OFFSET + i * PLAYER_COUNT : USES_DEFAULT_OFFSET
          + (i + 1) * PLAYER_COUNT
        ]
      )

      result.append(
        UpgradeRestriction(
          id=i,
          player_maximum_level=player_max,
          player_minimum_level=player_min,
          default_maximum_level=default_max,
          default_minimum_level=default_start,
          uses_default=cast(list[bool], uses_default),
        )
      )

    self.logger.debug(
      f"get_upgrade_restrictions complete. {len(result)} restrictions parsed."
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
      player_availability: list[bool] = cast(
        list[bool],
        list(
          ptex_bytes[
            PLAYER_AVAILABILITY_OFFSET + i * PLAYER_COUNT : PLAYER_AVAILABILITY_OFFSET
            + (i + 1) * PLAYER_COUNT
          ]
        ),
      )
      player_researched = cast(
        list[bool],
        list(
          ptex_bytes[
            PLAYER_RESEARCHED_OFFSET + i * PLAYER_COUNT : PLAYER_RESEARCHED_OFFSET
            + (i + 1) * PLAYER_COUNT
          ]
        ),
      )
      default_availability = cast(bool, ptex_bytes[DEFAULT_AVAILABILITY_OFFSET + i])
      default_researched = cast(bool, ptex_bytes[DEFAULT_RESEARCHED_OFFSET + i])
      uses_defaults = cast(
        list[bool],
        list(
          ptex_bytes[
            USES_DEFAULT_OFFSET + i * PLAYER_COUNT : USES_DEFAULT_OFFSET
            + (i + 1) * PLAYER_COUNT
          ]
        ),
      )

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

    self.logger.debug(
      f"get_tech_restrictions complete. {len(result)} restrictions parsed."
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

    self.logger.debug(f"get_upgrade_settings complete. {len(result)} settings parsed.")
    return result

  def get_technologies(self) -> list[CHKTechnology]:
    tecx_bytes = self.chkt.getsection("TECx")
    TECx = struct.unpack("44B 44H 44H 44H 44H", tecx_bytes)

    TECH_COUNT = 44
    USE_DEFAULT_OFFSET = 0
    MINERAL_COST_OFFSET = USE_DEFAULT_OFFSET + TECH_COUNT
    GAS_COST_OFFSET = MINERAL_COST_OFFSET + TECH_COUNT
    TIME_COST_OFFSET = GAS_COST_OFFSET + TECH_COUNT
    ENERGY_COST_OFFSET = TIME_COST_OFFSET + TECH_COUNT

    result: list[CHKTechnology] = []
    for i in range(TECH_COUNT):
      result.append(
        CHKTechnology(
          id=i,
          use_default=TECx[USE_DEFAULT_OFFSET + i : USE_DEFAULT_OFFSET + i + 1][0],
          cost=TechCost(
            mineral=TECx[MINERAL_COST_OFFSET + i : MINERAL_COST_OFFSET + i + 1][0],
            gas=TECx[GAS_COST_OFFSET + i : GAS_COST_OFFSET + i + 1][0],
            time=TECx[TIME_COST_OFFSET + i : TIME_COST_OFFSET + i + 1][0],
            energy=TECx[ENERGY_COST_OFFSET + i : ENERGY_COST_OFFSET + i + 1][0],
          ),
        )
      )

    self.logger.debug(
      f"get_upgrade_settings complete. {len(result)} technologies parsed."
    )
    return result

  def get_triggers(self) -> RawTriggerSection:
    trig_bytes = self.chkt.getsection("TRIG")

    self.logger.debug("get_triggers complete.")
    return RawTriggerSection(raw_data=trig_bytes)

  def get_mbrf_triggers(self) -> RawTriggerSection:
    mbrf_bytes = self.chkt.getsection("MBRF")

    self.logger.debug("get_mbrf_triggers complete.")
    return RawTriggerSection(raw_data=mbrf_bytes)


def section(name: str, data: bytes) -> bytes:
  header = struct.pack("<4sI", name.encode(), len(data))
  return header + data


class CHKBuilder:
  def __init__(self, map: Usemap):
    self.map = map
    self.logger = get_logger("CHK")

  def to_bytes(self) -> bytes:
    USED_SECTION = (
      "VER",
      "VCOD",
      "OWNR",
      "SIDE",
      "COLR",
      "ERA",
      "DIM",
      "MTXM",
      "UNIT",
      "PUNI",
      "UNIx",
      "PUPx",
      "UPGx",
      "THG2",
      "MASK",
      "MRGN",
      "STRx",
      "SPRP",
      "FORC",
      "PTEx",
      "TECx",
      "MBRF",
      "TRIG",
      "UPRP",
    )
    b = bytearray()

    for section_name in USED_SECTION:
      try:
        section_bytes = getattr(self, section_name)
        b += section_bytes
      except AttributeError:
        print(f"Section '{section_name}' not implemented in CHKSerializer.")

    return bytes(b)

  def find_string_by_content(self, content: str):
    ref = next((s for s in self.map.string if s.content == content), None)
    if ref is None:
      raise IndexError("Cannot find string on table.")

    return ref

  @property
  def VER(self) -> bytes:
    return b"".join([section("VER ", self.map.validation.ver)])

  @property
  def VCOD(self) -> bytes:
    # FIXME: Processing VCOD, checksum
    return b"".join([section("VCOD", self.map.validation.vcod)])

  @property
  def OWNR(self) -> bytes:
    b = bytearray()
    for p in self.map.player:
      b += OwnrPlayerTypeReverseDict[p.player_type].to_bytes(1, byteorder="little")

    return section("OWNR", b)

  @property
  def ERA(self) -> bytes:
    b = EraTilesetReverseDict[self.map.terrain.tileset].to_bytes(2, byteorder="little")
    return section("ERA ", b)

  @property
  def DIM(self) -> bytes:
    b = struct.pack("<2H", self.map.terrain.size.width, self.map.terrain.size.height)
    return section("DIM ", b)

  @property
  def SIDE(self) -> bytes:
    b = bytearray()
    for p in self.map.player:
      b += SidePlayerRaceReverseDict[p.race].to_bytes(1, byteorder="little")

    return section("SIDE", b)

  @property
  def MTXM(self) -> bytes:
    b = bytearray()

    for y in range(self.map.terrain.size.height):
      for x in range(self.map.terrain.size.width):
        tile = self.map.terrain.tile_id[y][x]
        value = (tile.group << 4) | (tile.id & 0xF)
        b += struct.pack("<H", value)

    return section("MTXM", b)

  @property
  def PUNI(self) -> bytes:
    b = bytearray()
    availability = [
      struct.pack("<12B", *v.availability) for v in self.map.unit_restrictions
    ]
    global_availability = [
      struct.pack("<B", v.global_availability) for v in self.map.unit_restrictions
    ]
    uses_defaults = [
      struct.pack("<12B", *v.uses_defaults) for v in self.map.unit_restrictions
    ]

    b += b"".join(availability)
    b += b"".join(global_availability)
    b += b"".join(uses_defaults)

    return section("PUNI", b)

  @property
  def UPGx(self) -> bytes:
    upgrade_settings = self.map.upgrades

    b = struct.pack(
      f"<61B B {6 * 61}H",
      *[u.use_default for u in upgrade_settings],
      0,
      *[u.base_cost.mineral for u in upgrade_settings],
      *[u.factor_cost.mineral for u in upgrade_settings],
      *[u.base_cost.gas for u in upgrade_settings],
      *[u.factor_cost.gas for u in upgrade_settings],
      *[u.base_cost.time for u in upgrade_settings],
      *[u.factor_cost.time for u in upgrade_settings],
    )

    return section("UPGx", b)

  @property
  def PTEx(self) -> bytes:
    b = bytearray()

    b += b"".join(
      [struct.pack("<12B", *v.player_availability) for v in self.map.tech_restrictions]
    )
    b += b"".join(
      [
        struct.pack("<12B", *v.player_already_researched)
        for v in self.map.tech_restrictions
      ]
    )
    b += b"".join(
      [struct.pack("<B", v.default_availability) for v in self.map.tech_restrictions]
    )
    b += b"".join(
      [
        struct.pack("<B", v.default_already_researched)
        for v in self.map.tech_restrictions
      ]
    )
    b += b"".join(
      [struct.pack("<12B", *v.uses_default) for v in self.map.tech_restrictions]
    )

    return section("PTEx", b)

  @property
  def UNIT(self) -> bytes:
    b = bytearray()

    for unit in self.map.placed_unit:
      unit_ref = unit.unit_definition
      b += struct.pack(
        "<I 6H 4B I 2H 2I",
        unit.serial_number if unit.serial_number is not None else 0,
        unit.transform.position.x,
        unit.transform.position.y,
        unit.id,
        unit.relation_type,
        unit.special_properties,
        unit.valid_properties,
        unit.owner.id,
        unit_ref.stats.hit_points.current * 100 // unit_ref.stats.hit_points.max
        if unit_ref.stats.hit_points.max != 0
        else 100,
        unit_ref.stats.shield_points.current * 100 // unit_ref.stats.shield_points.max
        if unit_ref.stats.shield_points.max != 0
        else 100,
        unit_ref.stats.energy_points.current,
        unit.resource_amount,
        unit.hangar,
        unit.unit_state,
        0,
        unit.related_unit,
      )

    return section("UNIT", b)

  @property
  def THG2(self) -> bytes:
    b = bytearray()

    for sprite in self.map.placed_sprite:
      b += struct.pack(
        "<3H2BH",
        sprite.id,
        sprite.transform.position.x,
        sprite.transform.position.y,
        sprite.owner,
        0,
        sprite.flags,
      )

    return section("THG2", b)

  @property
  def MASK(self) -> bytes:
    b = bytearray()
    height, width = self.map.terrain.size.height, self.map.terrain.size.width

    for y in range(height):
      for x in range(width):
        b += struct.pack("<B", self.map.mask[y * width + x].flags)

    return section("MASK", b)

  @property
  def STRx(self, encoding: Literal["utf-8", "CP949"] = "utf-8") -> bytes:
    b = bytearray()
    string_count = len(self.map.string)

    offset = 4 + 4 * string_count

    b += struct.pack("<I", len(self.map.string))
    offsets = []

    binary_string = bytearray()
    string_table = {}
    for string in self.map.string:
      encoded_content = string.content.encode(encoding) + b"\x00"
      # Duplicated string offset
      if encoded_content in string_table:
        offsets.append(string_table[encoded_content])
      else:
        string_table[encoded_content] = offset
        offsets.append(offset)
        offset += len(encoded_content)
        binary_string += encoded_content

    for o in offsets:
      b += struct.pack("<I", o)

    b.extend(binary_string)
    return section("STRx", b)

  @property
  def UPRP(self) -> bytes:
    b = bytearray()

    for uproperty in self.map.unit_properties:
      b += struct.pack(
        "<2H4BI2HI",
        uproperty.special_properties,
        uproperty.unit_data,
        0,  # Owner in UPRP section always NULL
        uproperty.hit_point_percent,
        uproperty.shield_point_percent,
        uproperty.energy_point_percent,
        uproperty.resource_amount,
        uproperty.units_in_hangar,
        uproperty.flags,
        0,  # Unknown/unused. Padding?
      )

    return section("UPRP", b)

  @property
  def MRGN(self) -> bytes:
    b = bytearray()

    for location in self.map.location:
      b += struct.pack(
        "<4I2H",
        location.position.left,
        location.position.top,
        location.position.right,
        location.position.bottom,
        location.name_id,
        location.elevation_flags,
      )

    return section("MRGN", b)

  @property
  def TRIG(self) -> bytes:
    b = self.map.raw_triggers.raw_data
    return section("TRIG", b)

  @property
  def MBRF(self) -> bytes:
    b = self.map.raw_mbrf_triggers.raw_data
    return section("MBRF", b)

  @property
  def SPRP(self) -> bytes:
    b = struct.pack(
      "<2H",
      self.map.scenario_property.name.id + 1,
      self.map.scenario_property.description.id + 1,
    )

    return section("SPRP", b)

  @property
  def FORC(self) -> bytes:
    b = struct.pack(
      "<8B4H4B",
      *[p.force for p in self.map.player[:8]],
      *[self.find_string_by_content(f.name).id + 1 for f in self.map.force],
      *[f.properties for f in self.map.force],
    )

    return section("FORC", b)

  @property
  def COLR(self) -> bytes:
    b = struct.pack("8B", *[p.color for p in self.map.player[:8]])
    return section("COLR", b)

  @property
  def PUPx(self) -> bytes:
    restrictions = self.map.upgrade_restrictions
    b = struct.pack(
      f"{61 * 12}B {61 * 12}B {61 * 2}B {61 * 12}B",
      *[b for v in restrictions for b in v.player_maximum_level],
      *[b for v in restrictions for b in v.player_minimum_level],
      *[v.default_maximum_level for v in restrictions],
      *[v.default_minimum_level for v in restrictions],
      *[b for v in restrictions for b in v.uses_default],
    )

    return section("PUPx", b)

  @property
  def UNIx(self) -> bytes:
    units = self.map.unit_definitions
    weapons = self.map.weapons
    b = struct.pack(
      f"228B 228I 228H 228B {4 * 228}H {2 * 130}H",
      *[u.id for u in units],
      *[u.stats.hit_points.max for u in units],
      *[u.stats.shield_points.max for u in units],
      *[u.stats.armor_points for u in units],
      *[u.cost.cost.time for u in units],
      *[u.cost.cost.mineral for u in units],
      *[u.cost.cost.gas for u in units],
      *[
        self.find_string_by_content(u.name).id if not u.use_default else 0
        for u in units
      ],
      # FIXME: Use weapons.dat
      *[w.damage.amount for w in weapons],
      *[w.damage.bonus for w in weapons],
    )

    return section("UNIx", b)

  @property
  def TECx(self) -> bytes:
    technologies = self.map.technologies
    b = struct.pack(
      f"44B {4 * 44}H",
      *[t.use_default for t in technologies],
      *[t.cost.mineral for t in technologies],
      *[t.cost.gas for t in technologies],
      *[t.cost.time for t in technologies],
      *[t.cost.energy for t in technologies],
    )

    return section("TECx", b)
