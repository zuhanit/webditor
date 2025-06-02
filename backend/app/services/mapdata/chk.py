from app.core.w_logging import get_logger
from app.models.project import Usemap
from app.services.utils.player import (
  OwnrPlayerTypeDict,
  SidePlayerRaceDict,
  OwnrPlayerTypeReverseDict,
  SidePlayerRaceReverseDict,
)
from app.services.utils.tileset import EraTilesetDict, EraTilesetReverseDict
from eudplib.core.mapdata.chktok import CHK as EPCHK
from typing import Literal, TypedDict, cast
from ..utils.reverse import reverse_tbl_dict
from app.types import chk_types, spatial
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

  units: list[chk_types.UnitSetting]
  chkt: EPCHK

  def __init__(self, chkt: EPCHK):
    self.logger = get_logger("CHK")
    self.chkt = chkt

  """
  Unit section processings 
  """

  @property
  def unit_definitions(self) -> list[chk_types.UnitSetting]:
    from eudplib.core.rawtrigger.strdict.stattxt import DefStatTextDict

    result: list[chk_types.UnitSetting] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], self.chkt.getsection("UNIx"))
    for id in range(228):
      unitname_id: int = unpacked[id + (228 * 7)]
      unit_name = (
        self.strings[unitname_id].content
        if unitname_id != 0
        else reverse_tbl_dict(DefStatTextDict)[id + 1]
      )
      stat = chk_types.Stat(
        hit_points=unpacked[id + 228],
        shield_points=unpacked[id + (228 * 2)],
        armor_points=unpacked[id + (228 * 3)],
      )
      cost = chk_types.Cost(
        mineral=unpacked[id + (228 * 6)],
        gas=unpacked[id + (228 * 5)],
        time=unpacked[id + (228 * 4)],
      )
      result.append(
        chk_types.UnitSetting(
          id=id,
          name=unit_name,
          use_default=unpacked[0],
          stat=stat,
          cost=cost,
          string=self.strings[unitname_id],
        )
      )

    self.logger.debug(f"get_units complete: {len(result)} units parsed.")
    return result

  @property
  def placed_units(self) -> list[chk_types.Unit]:
    unit_bytes = self.chkt.getsection("UNIT")
    format_size = struct.calcsize(CHK_FORMATDICT["UNIT"])
    unit_count = len(unit_bytes) // format_size

    result: list[chk_types.Unit] = []
    for i in range(0, unit_count):
      unit = struct.unpack(
        CHK_FORMATDICT["UNIT"], unit_bytes[i * format_size : (i + 1) * format_size]
      )

      result.append(
        chk_types.Unit(
          serial_number=unit[0],
          position=spatial.Position(x=unit[1], y=unit[2]),
          unit_id=unit[3],
          relation_type=chk_types.RelationFlag(unit[4]),
          special_properties=chk_types.SpecialPropertiesFlag(unit[5]),
          valid_properties=chk_types.ValidPropertiesFlag(unit[6]),
          owner=self.players[unit[7]],
          stat=chk_types.Stat(
            hit_points=unit[8], shield_points=unit[9], armor_points=unit[10]
          ),
          resource_amount=unit[11],
          hangar=unit[12],
          unit_state=chk_types.UnitStateFlag(unit[13]),
          related_unit=unit[14],
        )
      )

    self.logger.debug(f"get_placed_units complete: {len(result)} units parsed.")
    return result

  @property
  def unit_properties(self) -> list[chk_types.UnitProperty]:
    uprp_bytes = self.chkt.getsection("UPRP")
    format_size = struct.calcsize(CHK_FORMATDICT["UPRP"])
    section_count = len(uprp_bytes) // format_size

    result: list[chk_types.UnitProperty] = []
    for i in range(section_count):
      index = format_size * i
      uprp = struct.unpack(
        CHK_FORMATDICT["UPRP"], uprp_bytes[index : index + format_size]
      )
      result.append(
        chk_types.UnitProperty(
          special_properties=chk_types.SpecialPropertiesFlag(uprp[0]),
          valid_properties=chk_types.ValidPropertiesFlag(uprp[1]),
          owner=0,  # Always be NULL in UPRP section,
          stats=chk_types.Stat(
            hit_points=uprp[2], shield_points=uprp[3], armor_points=uprp[4]
          ),
          resource_amount=uprp[5],
          hangar=uprp[6],
          flags=chk_types.SpecialPropertiesFlag(uprp[7]),
        )
      )

    self.logger.debug(
      f"get_placed_properties complete: {len(result)} properties parsed."
    )
    return result

  @property
  def unit_restrictions(self) -> list[chk_types.UnitRestriction]:
    puni_bytes = self.chkt.getsection("PUNI")

    UNIT_COUNT = 228
    PLAYER_COUNT = 12

    PLAYER_AVAILABILITY_OFFSET = 0
    GLOBAL_AVAILABILITY_OFFSET = PLAYER_AVAILABILITY_OFFSET + UNIT_COUNT * PLAYER_COUNT
    USES_DEFAULTS_OFFSET = GLOBAL_AVAILABILITY_OFFSET + UNIT_COUNT

    result: list[chk_types.UnitRestriction] = []
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
        chk_types.UnitRestriction(
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

  @property
  def weapons(self) -> list[chk_types.CHKWeapon]:
    result: list[chk_types.CHKWeapon] = []

    unpacked = struct.unpack(CHK_FORMATDICT["UNIx"], self.chkt.getsection("UNIx"))[
      228 * 8 :
    ]
    for id in range(130):
      result.append(
        chk_types.CHKWeapon(
          damage=chk_types.Damage(amount=unpacked[id], bonus=unpacked[130 + id])
        )
      )

    self.logger.debug(f"get_weapons complete: {len(result)} weapons parsed.")
    return result

  """
  Terrain section processing 
  """

  @property
  def terrain(self) -> chk_types.Terrain:
    dim = struct.unpack(CHK_FORMATDICT["DIM "], self.chkt.getsection("DIM "))
    era = struct.unpack(CHK_FORMATDICT["ERA "], self.chkt.getsection("ERA "))

    dimension: spatial.Size = spatial.Size(width=dim[0], height=dim[1])
    tileset = era[0]

    self.logger.debug(
      f"get_trains complete. Width: {dimension.width}, Height: {dimension.height}"
    )
    return chk_types.Terrain(size=dimension, tileset=EraTilesetDict[tileset])

  @property
  def tiles(self) -> list[chk_types.Tile]:
    terrain = self.terrain
    mtxm = struct.unpack(
      f"{terrain.size.width * terrain.size.height}H", self.chkt.getsection("MTXM")
    )

    result: list[chk_types.Tile] = []
    for y in range(terrain.size.height):
      for x in range(terrain.size.width):
        tile = chk_types.Tile(
          group=mtxm[y * terrain.size.width + x] >> 4,
          id=mtxm[y * terrain.size.width + x] & 0xF,
          position=spatial.Position(x=x, y=y),
        )
        result.append(tile)

    self.logger.debug(f"get_tile complete. {len(result)} tiles parsed.")
    return result

  """
  Player section processings
  """

  @property
  def players(self) -> list[chk_types.Player]:
    ownr = struct.unpack(CHK_FORMATDICT["OWNR"], self.chkt.getsection("OWNR"))
    side = struct.unpack(CHK_FORMATDICT["SIDE"], self.chkt.getsection("SIDE"))
    colr = struct.unpack(CHK_FORMATDICT["COLR"], self.chkt.getsection("COLR"))

    result: list[chk_types.Player] = [
      chk_types.Player(
        id=i,
        color=0,
        rgb_color=(0, 0, 0),
        player_type="Computer",
        race="Inactive",
        force=chk_types.Force(
          id=0, name=self.strings[0], properties=chk_types.ForceProperties(0)
        ),
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

  @property
  def forces(self) -> list[chk_types.Force]:
    FORC = struct.unpack("8B 4H 4B", self.chkt.getsection("FORC"))

    result: list[chk_types.Force] = []
    for i in range(4):
      name_index: int = FORC[8 + i] - 1
      result.append(
        chk_types.Force(
          id=i,
          name=self.strings[name_index],
          properties=FORC[12 + i],
        )
      )

    self.logger.debug(f"get_forces complete. {len(result)} forces parsed.")
    return result

  """
  Location section processing
  """

  @property
  def locations(self) -> list[chk_types.Location]:
    mrgn_bytes = self.chkt.getsection("MRGN")
    format_size = struct.calcsize(CHK_FORMATDICT["MRGN"])
    location_count = len(mrgn_bytes) // format_size

    result: list[chk_types.Location] = []
    for i in range(0, location_count):
      MRGN = struct.unpack(
        CHK_FORMATDICT["MRGN"], mrgn_bytes[i * format_size : (i + 1) * format_size]
      )
      if (MRGN[0], MRGN[1], MRGN[2], MRGN[3]) != (0, 0, 0, 0):
        result.append(
          chk_types.Location(
            id=i,
            string=self.strings[MRGN[4]],
            position=spatial.Position(x=MRGN[0], y=MRGN[1]),
            size=spatial.Size(width=MRGN[2] - MRGN[0], height=MRGN[3] - MRGN[1]),
            elevation_flag=chk_types.ElevationFlag(MRGN[5]),
          )
        )

    self.logger.debug(f"get_locations complete. {len(result)} locations parsed.")
    return result

  """
  Sprite section processing
  """

  @property
  def sprites(self) -> list[chk_types.Sprite]:
    thg2_bytes = self.chkt.getsection("THG2")
    format_size = struct.calcsize(CHK_FORMATDICT["THG2"])
    sprite_count = len(thg2_bytes) // format_size

    result: list[chk_types.Sprite] = []
    for i in range(0, sprite_count):
      sprite = struct.unpack(
        CHK_FORMATDICT["THG2"], thg2_bytes[i * format_size : (i + 1) * format_size]
      )
      result.append(
        chk_types.Sprite(
          id=sprite[0],
          position=spatial.Position(x=sprite[1], y=sprite[2]),
          owner=self.players[sprite[3]],
          flags=chk_types.SpriteFlag(sprite[5]),
        )
      )

    self.logger.debug(f"get_placed_sprites complete. {len(result)} sprites parsed.")
    return result

  """
  String section processing
  """

  @property
  def strings(self) -> list[chk_types.String]:
    str_bytes = self.chkt.getsection("STRx")
    string_count = struct.unpack("I", str_bytes[0:4])[0]
    offsets = [
      struct.unpack("I", str_bytes[i : i + 4])[0]
      for i in range(4, 4 + 4 * string_count, 4)
    ]

    result: list[chk_types.String] = []
    for i in range(string_count):
      start = offsets[i]
      end = offsets[i + 1] if i + 1 < len(offsets) else len(str_bytes)
      string_content = str_bytes[start:end].split(b"\x00")[0].decode("utf-8")
      result.append(chk_types.String(id=i, content=string_content))

    self.logger.debug(f"get_strings complete. {len(result)} strings parsed.")
    return result

  @property
  def scenario_properties(self) -> chk_types.ScenarioProperty:
    SPRP = struct.unpack("2H", self.chkt.getsection("SPRP"))
    name = self.strings[SPRP[0] - 1]
    description = self.strings[SPRP[1] - 1]

    self.logger.debug(
      f"get_scenario_properties complete. name: {name}, description: {description}"
    )

    return chk_types.ScenarioProperty(name=name, description=description)

  """
  Validation section processing 
  """

  @property
  def validation(self) -> chk_types.Validation:
    ver_bytes = self.chkt.getsection("VER ")

    # FIXME: VCOD validation need
    vcod_bytes = self.chkt.getsection("VCOD")

    self.logger.debug("get_validation complete.")
    return chk_types.Validation(
      ver=ver_bytes,
      vcod=vcod_bytes,
    )

  @property
  def mask(self) -> list[chk_types.Mask]:
    mask_bytes = self.chkt.getsection("MASK")

    result: list[chk_types.Mask] = []
    for x in range(self.terrain.size.height):
      for y in range(self.terrain.size.width):
        position = y * self.terrain.size.width + x
        flag = struct.unpack("B", mask_bytes[position : position + 1])[0]
        result.append(
          chk_types.Mask(
            position=spatial.Position(x=x, y=y),
            flags=chk_types.MaskFlag(flag),
          )
        )

    self.logger.debug("get_mask complete.")
    return result

  """
  Tech section processings
  """

  @property
  def upgrade_restrictions(self) -> list[chk_types.UpgradeRestriction]:
    pupx_bytes = self.chkt.getsection("PUPx")

    UPGRADE_COUNT = 61
    PLAYER_COUNT = 12
    PLAYER_MAX_OFFSET = 0
    PLAYER_MIN_OFFSET = PLAYER_MAX_OFFSET + UPGRADE_COUNT * PLAYER_COUNT
    DEFAULT_MAX_OFFSET = PLAYER_MIN_OFFSET + UPGRADE_COUNT * PLAYER_COUNT
    DEFAULT_START_OFFSET = DEFAULT_MAX_OFFSET + UPGRADE_COUNT
    USES_DEFAULT_OFFSET = DEFAULT_START_OFFSET + UPGRADE_COUNT

    result: list[chk_types.UpgradeRestriction] = []

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
        chk_types.UpgradeRestriction(
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

  @property
  def tech_restrictions(self) -> list[chk_types.TechRestriction]:
    ptex_bytes = self.chkt.getsection("PTEx")

    TECH_COUNT = 44
    PLAYER_COUNT = 12
    PLAYER_AVAILABILITY_OFFSET = 0
    PLAYER_RESEARCHED_OFFSET = PLAYER_AVAILABILITY_OFFSET + TECH_COUNT * PLAYER_COUNT
    DEFAULT_AVAILABILITY_OFFSET = PLAYER_RESEARCHED_OFFSET + TECH_COUNT * PLAYER_COUNT
    DEFAULT_RESEARCHED_OFFSET = DEFAULT_AVAILABILITY_OFFSET + TECH_COUNT
    USES_DEFAULT_OFFSET = DEFAULT_RESEARCHED_OFFSET + TECH_COUNT

    result: list[chk_types.TechRestriction] = []
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
        chk_types.TechRestriction(
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

  @property
  def upgrade_settings(self) -> list[chk_types.Upgrade]:
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

    result: list[chk_types.Upgrade] = []
    for i in range(UPGRADE_COUNT):
      result.append(
        chk_types.Upgrade(
          id=i,
          uses_default=UPGx[USES_DEFAULT_OFFSET + i],
          base_cost=chk_types.Cost(
            mineral=UPGx[BASE_MINERAL_OFFSET + i],
            gas=UPGx[BASE_GAS_OFFSET + i],
            time=UPGx[BASE_TIME_OFFSET + i],
          ),
          factor_cost=chk_types.Cost(
            mineral=UPGx[FACTOR_MINERAL_OFFSET + i],
            gas=UPGx[FACTOR_GAS_OFFSET + i],
            time=UPGx[FACTOR_TIME_OFFSET + i],
          ),
        )
      )

    self.logger.debug(f"get_upgrade_settings complete. {len(result)} settings parsed.")
    return result

  @property
  def technologies(self) -> list[chk_types.Technology]:
    tecx_bytes = self.chkt.getsection("TECx")
    TECx = struct.unpack("44B 44H 44H 44H 44H", tecx_bytes)

    TECH_COUNT = 44
    USE_DEFAULT_OFFSET = 0
    MINERAL_COST_OFFSET = USE_DEFAULT_OFFSET + TECH_COUNT
    GAS_COST_OFFSET = MINERAL_COST_OFFSET + TECH_COUNT
    TIME_COST_OFFSET = GAS_COST_OFFSET + TECH_COUNT
    ENERGY_COST_OFFSET = TIME_COST_OFFSET + TECH_COUNT

    result: list[chk_types.Technology] = []
    for i in range(TECH_COUNT):
      result.append(
        chk_types.Technology(
          id=i,
          use_default=TECx[USE_DEFAULT_OFFSET + i : USE_DEFAULT_OFFSET + i + 1][0],
          cost=chk_types.CostWithEnergy(
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

  @property
  def triggers(self) -> chk_types.Trigger:
    trig_bytes = self.chkt.getsection("TRIG")

    self.logger.debug("get_triggers complete.")
    return chk_types.Trigger(raw_data=trig_bytes)

  @property
  def mbrf_triggers(self) -> chk_types.Trigger:
    mbrf_bytes = self.chkt.getsection("MBRF")

    self.logger.debug("get_mbrf_triggers complete.")
    return chk_types.Trigger(raw_data=mbrf_bytes)


def section(name: str, data: bytes) -> bytes:
  header = struct.pack("<4sI", name.encode(), len(data))
  return header + data


class CHKBuilder:
  """
  CHKBuilder is a class that builds a CHK file from a Usemap.
  """

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

    tiles = [t for t in self.map.entities if isinstance(t, chk_types.Tile)]

    for y in range(self.map.terrain.size.height):
      for x in range(self.map.terrain.size.width):
        tile = tiles[y * self.map.terrain.size.width + x]
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
    from app.models.unit import Unit

    b = bytearray()

    units = [u for u in self.map.entities if isinstance(u, Unit)]

    for unit in units:
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
    from app.models.sprite import Sprite

    b = bytearray()

    sprites = [s for s in self.map.entities if isinstance(s, Sprite)]

    for sprite in sprites:
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
    from app.models.location import Location

    b = bytearray()

    locations = [
      location for location in self.map.entities if isinstance(location, Location)
    ]

    for location in locations:
      b += struct.pack(
        "<4I2H",
        location.transform.position.x,
        location.transform.position.y,
        location.transform.position.x + location.transform.size.width,
        location.transform.position.y + location.transform.size.height,
        self.find_string_by_content(location.name).id,
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
