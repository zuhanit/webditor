import abc
import struct
from typing import Callable, Literal, Optional, TypeVar, Generic, TypedDict, cast
from pathlib import Path

T = TypeVar("T")
DatFiles = Literal[
  "flingy", "images", "mapdata", "orders", "portdata", "sfxdata",
  "sprites", "techdata", "units", "upgrades", "weapons"
]

class DAT(Generic[T]):
  format: str
  binary_data: bytes
  fname: DatFiles
  
  def __init__(self, fname: DatFiles, *, entry_count: int, field_formats: list[str], parse:
  Callable[[tuple], T]):
    self.fname = fname
    self.entry_count = entry_count
    self.field_formats = field_formats
    self.parse_entry = parse
    self.binary_data = self.read_rawfile()
  
  def read_rawfile(self) -> bytes:
    try:
      datpath = Path(__file__).parent / "arr" / f"{self.fname}.dat"
      with open(datpath, "rb") as f:
        return f.read()
    except Exception as e:
      raise RuntimeError(f"Cannot read raw dat file {self.fname}.dat. Detail: {str(e)}")

  @property
  def result(self) -> tuple[T, ...]:
    offset = 0
    fields = []
    
    for fmt in self.field_formats:
      size = struct.calcsize(fmt)
      field = [
        struct.unpack("<" + fmt, self.binary_data[offset + i * size : offset + (i + 1) * size])[0]
        for i in range(self.entry_count)
      ]
      fields.append(field)
      offset += size * self.entry_count

    return tuple(
      self.parse_entry(tuple(field[i] for field in fields))
      for i in range(self.entry_count)
    )

class Flingy(TypedDict):
  sprite: int
  topSpeed: int
  acceleration: int
  haltDistance: int
  turnRadius: int
  unused: int
  moveControl: int

FlingyDat = DAT[Flingy](
  "flingy",
  entry_count=209,
  field_formats=["H", "I", "H", "I", "B", "B", "B"],
  parse=lambda x: {
  "sprite": x[0],
  "topSpeed": x[1],
  "acceleration": x[2],
  "haltDistance": x[3],
  "turnRadius": x[4],
  "unused": x[5],
  "moveControl": x[6]
})

class Image(TypedDict):
  grp_id: int
  turnable: bool
  clickable: bool 
  use_full_iscript: bool
  draw_if_cloaked: bool 
  draw_function: int
  remapping: int
  iscript_id: int
  shield_overlay: int
  attack_overlay: int
  damage_overlay: int
  special_overlay: int
  landing_dust_overlay: int
  lift_off_overlay: int

ImagesDat = DAT[Image](
  "images",
  entry_count=1,
  field_formats=["I", "B", "B", "B", "B", "I", "I", "I", "I", "I", "I", "I", "I", "I"],
  parse= lambda x: {
    "grp_id": x[0],
    "turnable": x[1],
    "clickable": x[2],
    "use_full_iscript": x[3],
    "draw_if_cloaked": x[4],
    "draw_function": x[5],
    "remapping": x[6],
    "iscript_id": x[7],
    "shield_overlay": x[8],
    "attack_overlay": x[9],
    "damage_overlay": x[10],
    "special_overlay": x[11],
    "landing_dust_overlay": x[12],
    "lift_off_overlay": x[13],
  }
)

class Order(TypedDict):
  label: int
  use_weapon_targeting: bool
  can_be_interrupted: bool
  can_be_queued: bool
  targeting: int
  energy: int
  animation: int
  highlight: int
  obscured_order: int

OrdersDat = DAT[Order](
  "orders",
  entry_count=180,
  field_formats = [
    "H",  # Label (2 bytes)
    "B",  # Use Weapon Targeting
    "B",  # Unknown2
    "B",  # Unknown3
    "B",  # Unknown4
    "B",  # Unknown5
    "B",  # Can Be Interrupted
    "B",  # Unknown7
    "B",  # Can Be Queued
    "B",  # Unknown9
    "B",  # Unknown10
    "B",  # Unknown11
    "B",  # Unknown12
    "B",  # Targeting
    "B",  # Energy
    "B",  # Animation
    "H",  # Highlight (2 bytes)
    "H",  # Unknown17 (2 bytes)
    "B",  # Obscured Order
  ],
  parse=lambda x: {
    "label": x[0],
    "use_weapon_targeting": bool(x[1]),
    "can_be_interrupted": bool(x[6]),
    "can_be_queued": bool(x[8]),
    "targeting": x[13],
    "energy": x[14],
    "animation": x[15],
    "highlight": x[16],
    "obscured_order": x[18]
  }
)

class Portdata(TypedDict):
  portrait_file: int
  smk_change: int
  unknown1: int

PortdataDat = DAT[Portdata](
  "portdata",
  entry_count=220,
  field_formats=["I", "B", "B"],
  parse=lambda x: {
    "portrait_file": x[0],
    "smk_change": x[1],
    "unknown1": x[2],
  }
)

class Sfxdata(TypedDict):
  sound_file: int
  unknown1: int
  unknown2: int
  unknown3: int
  unknown4: int

SfxdataDat = DAT[Sfxdata](
  "sfxdata",
  entry_count=1144,
  field_formats=["I", "B", "B", "H", "B"],
  parse=lambda x: {
    "sound_file": x[0],
    "unknown1": x[1],
    "unknown2": x[2],
    "unknown3": x[3],
    "unknown4": x[4],
  }
)

class Sprite(TypedDict):
  image_file: int
  health_bar: Optional[int]
  unknown2: int
  is_visible: int
  selection_circle_image: Optional[int]
  selection_circle_offset: Optional[int]

class SpritesDatFile(DAT[Sprite]):
    def __init__(self):
        self.fname = "sprites"
        self.entry_count = 517
        self.binary_data = self.read_rawfile()

    def read_field(self, offset: int, fmt: str, count: int, stride: Optional[int] = None, index_offset: int = 0) -> list:
        size = struct.calcsize(fmt)
        if stride is None:
            stride = size
        return [
            struct.unpack("<" + fmt, self.binary_data[offset + (i - index_offset) * stride : offset + (i - index_offset) * stride + size])[0]
            for i in range(index_offset, index_offset + count)
        ]

    @property
    def result(self) -> tuple[Sprite, ...]:
        s = [{} for _ in range(self.entry_count)]

        def set_range(name, values, start=0):
            for i, v in enumerate(values):
                s[start + i][name] = v

        set_range("image_file", self.read_field(0x000, "H", 517))
        set_range("health_bar", self.read_field(0x40A, "B", 387, index_offset=130), start=130)
        set_range("unknown2", self.read_field(0x58D, "B", 517))
        set_range("is_visible", self.read_field(0x792, "B", 517))
        
        raw = self.read_field(0x997, "B", 387, index_offset=130)
        adjusted = [v + 561 for v in raw]
        set_range("selection_circle_image", adjusted, start=130)
        set_range("selection_circle_offset", self.read_field(0xB1A, "B", 387, index_offset=130), start=130)

        return tuple(cast(Sprite, entry) for entry in s)

SpritesDat = SpritesDatFile()

class Techdata(TypedDict):
  mineral_cost: int
  vespene_cost: int
  research_time: int
  energy_required: int
  unknown4: int
  icon: int
  label: int
  race: int
  unused: int
  brood_war_flag: int
  
TechdataDat = DAT[Techdata](
  "techdata",
  entry_count=44,
  field_formats=["H", "H", "H", "H", "I", "H", "H", "B", "B", "B"],
  parse=lambda x: {
    "mineral_cost": x[0],
    "vespene_cost": x[1],
    "research_time": x[2],
    "energy_required": x[3],
    "unknown4": x[4],
    "icon": x[5],
    "label": x[6],
    "race": x[7],
    "unused": x[8],
    "brood_war_flag": x[9],
  }
)

class Unit(TypedDict):
  graphics: int
  subunit1: int
  subunit2: int
  infestation: Optional[int]
  """ID 106-201 only"""
  construction_animation: int
  unit_direction: int
  shield_enable: int
  shield_amount: int
  hit_points: int
  elevation_level: int
  old_movement_flags: int
  rank: int
  comp_ai_idle: int
  human_ai_idle: int
  return_to_idle: int
  attack_unit: int
  attack_move: int
  ground_weapon: int
  max_ground_hits: int
  air_weapon: int
  max_air_hits: int
  ai_internal: int
  special_ability_flags: int
  target_acquisition_range: int
  sight_range: int
  armor_upgrade: int
  unit_size: int
  armor: int
  right_click_action: int
  ready_sound: Optional[int]
  """ID 0-105 only"""
  what_sound_start: int
  what_sound_end: int
  piss_sound_start: Optional[int]
  "ID 0-105 only"""
  piss_sound_end: Optional[int]
  """ID 0-105 only"""
  yes_sound_start: Optional[int]
  """ID 0-105 only"""
  yes_sound_end: Optional[int]
  """ID 0-105 only"""
  placement_box_width: int
  placement_box_height: int
  addon_horizontal: Optional[int]
  """ID 106-201 only"""
  addon_vertical: Optional[int]
  """ID 106-201 only"""
  size_left: int
  size_up: int
  size_right: int
  size_down: int
  portrait: int
  mineral_cost: int
  vespene_cost: int
  build_time: int
  unknown1: int
  staredit_group_flags: int
  supply_provided: int
  supply_required: int
  space_required: int
  space_provided: int
  build_score: int
  destroy_score: int
  unit_map_string: int
  broodwar_unit_flag: int
  availability_flags: int

class UnitsDatFile(DAT[Unit]):
    """Unlike other .dat files, units.dat parsing logic is special.
    
    Some properties(Infestation, PissSoundStart, PissSoundStart) is valid on some ID, spatial data
    need to structuring.
    """
    def __init__(self):
        self.fname = "units"
        self.entry_count = 228
        self.binary_data = self.read_rawfile()

    def read_field(self, offset: int, fmt: str, count: int, stride: Optional[int] = None, index_offset: int = 0) -> list:
        size = struct.calcsize(fmt)
        if stride is None:
            stride = size
        return [
            struct.unpack("<" + fmt, self.binary_data[offset + (i - index_offset) * stride : offset + (i - index_offset) * stride + size])[0]
            for i in range(index_offset, index_offset + count)
        ]

    @property
    def result(self) -> tuple[Unit, ...]:
        u = [{} for _ in range(self.entry_count)]

        def set_range(name, values, start=0):
            for i, v in enumerate(values):
                u[start + i][name] = v

        # Example subset of fields
        set_range("graphics",     self.read_field(0x0000, "B", 228))
        set_range("subunit1",     self.read_field(0x00E4, "H", 228))
        set_range("subunit2",     self.read_field(0x02AC, "H", 228))

        # Conditional field example (unit id 106 ~ 201)
        infestation = self.read_field(0x0474, "H", 96, stride=2, index_offset=106)
        for i, val in enumerate(infestation):
            u[106 + i]["infestation"] = val

        set_range("construction_animation", self.read_field(0x0534, "I", 228))
        set_range("unit_direction", self.read_field(0x08C4, "B", 228))
        set_range("shield_enable", self.read_field(0x09A8, "B", 228))
        set_range("shield_amount", self.read_field(0x0A8C, "H", 228))
        set_range("hit_points", self.read_field(0x0C54, "I", 228))
        set_range("elevation_level", self.read_field(0x0FE4, "B", 228))
        set_range("old_movement_flags", self.read_field(0x10C8, "B", 228))
        set_range("rank", self.read_field(0x11AC, "B", 228))
        set_range("comp_ai_idle", self.read_field(0x1290, "B", 228))
        set_range("human_ai_idle", self.read_field(0x1374, "B", 228))
        set_range("return_to_idle", self.read_field(0x1458, "B", 228))
        set_range("attack_unit", self.read_field(0x153C, "B", 228))
        set_range("attack_move", self.read_field(0x1620, "B", 228))
        set_range("ground_weapon", self.read_field(0x1704, "B", 228))
        set_range("max_ground_hits", self.read_field(0x17E8, "B", 228))
        set_range("air_weapon", self.read_field(0x18CC, "B", 228))
        set_range("max_air_hits", self.read_field(0x19B0, "B", 228))
        set_range("ai_internal", self.read_field(0x1A94, "B", 228))
        set_range("special_ability_flags", self.read_field(0x1B78, "I", 228))
        set_range("target_acquisition_range", self.read_field(0x1F08, "B", 228))
        set_range("sight_range", self.read_field(0x1FEC, "B", 228))
        set_range("armor_upgrade", self.read_field(0x20D0, "B", 228))
        set_range("unit_size", self.read_field(0x21B4, "B", 228))
        set_range("armor", self.read_field(0x2298, "B", 228))
        set_range("right_click_action", self.read_field(0x237C, "B", 228))
        ready_sound = self.read_field(0x2460, "H", 106, stride=2)
        for i, val in enumerate(ready_sound):
            u[i]["ready_sound"] = val
        set_range("what_sound_start", self.read_field(0x2534, "H", 228))
        set_range("what_sound_end", self.read_field(0x26FC, "H", 228))
        piss_start = self.read_field(0x28C4, "H", 106, stride=2)
        for i, val in enumerate(piss_start):
            u[i]["piss_sound_start"] = val
        piss_end = self.read_field(0x2998, "H", 106, stride=2)
        for i, val in enumerate(piss_end):
            u[i]["piss_sound_end"] = val
        yes_start = self.read_field(0x2A6C, "H", 106, stride=2)
        for i, val in enumerate(yes_start):
            u[i]["yes_sound_start"] = val
        yes_end = self.read_field(0x2B40, "H", 106, stride=2)
        for i, val in enumerate(yes_end):
            u[i]["yes_sound_end"] = val

        # Interleaved example: placement box
        for i in range(228):
            base = 0x2C14 + i * 4
            u[i]["placement_box_width"] = struct.unpack("<H", self.binary_data[base : base + 2])[0]
            u[i]["placement_box_height"] = struct.unpack("<H", self.binary_data[base + 2 : base + 4])[0]

        addon_h = self.read_field(0x2FA4, "H", 96, stride=2, index_offset=106)
        for i, val in enumerate(addon_h):
            u[106 + i]["addon_horizontal"] = val
        addon_v = self.read_field(0x3064, "H", 96, stride=2, index_offset=106)
        for i, val in enumerate(addon_v):
            u[106 + i]["addon_vertical"] = val

        for i in range(228):
            base = 0x3124 + i * 8
            u[i]["size_left"] = struct.unpack("<H", self.binary_data[base + 0 : base + 2])[0]
            u[i]["size_up"] = struct.unpack("<H", self.binary_data[base + 2 : base + 4])[0]
            u[i]["size_right"] = struct.unpack("<H", self.binary_data[base + 4 : base + 6])[0]
            u[i]["size_down"] = struct.unpack("<H", self.binary_data[base + 6 : base + 8])[0]

        set_range("portrait", self.read_field(0x3844, "H", 228))
        set_range("mineral_cost", self.read_field(0x3A0C, "H", 228))
        set_range("vespene_cost", self.read_field(0x3BD4, "H", 228))
        set_range("build_time", self.read_field(0x3D9C, "H", 228))
        set_range("unknown1", self.read_field(0x3F64, "H", 228))
        set_range("staredit_group_flags", self.read_field(0x412C, "B", 228))
        set_range("supply_provided", self.read_field(0x4210, "B", 228))
        set_range("supply_required", self.read_field(0x42F4, "B", 228))
        set_range("space_required", self.read_field(0x43D8, "B", 228))
        set_range("space_provided", self.read_field(0x44BC, "B", 228))
        set_range("build_score", self.read_field(0x45A0, "H", 228))
        set_range("destroy_score", self.read_field(0x4768, "H", 228))
        set_range("unit_map_string", self.read_field(0x4930, "H", 228))
        set_range("broodwar_unit_flag", self.read_field(0x4AF8, "B", 228))
        set_range("availability_flags", self.read_field(0x4BDC, "H", 228))
        return tuple(cast(Unit, entry) for entry in u)

UnitsDat = UnitsDatFile()

class Upgrade(TypedDict):
  mineral_cost_base: int
  mineral_cost_factor: int
  vespene_cost_base: int
  vespene_cost_factor: int
  research_time_base: int
  research_time_factor: int
  unknown6: int
  icon: int
  label: int
  race: int
  max_repeats: int
  broodwar_flag: int

UpgradesDat = DAT[Upgrade](
  "upgrades",
  entry_count=61,
  field_formats=["H", "H", "H", "H", "H", "H", "H", "H", "H", "B", "B", "B"],
  parse=lambda x: {
    "mineral_cost_base": x[0],
    "mineral_cost_factor": x[1],
    "vespene_cost_base": x[2],
    "vespene_cost_factor": x[3],
    "research_time_base": x[4],
    "research_time_factor": x[5],
    "unknown6": x[6],
    "icon": x[7],
    "label": x[8],
    "race": x[9],
    "max_repeats": x[10],
    "broodwar_flag": x[11],
  }
)

class Weapon(TypedDict):
  label: int
  graphics: int
  unused: int
  target_flags: int
  min_range: int
  max_range: int
  damage_upgrade: int
  weapon_type: int
  weapon_behavior: int
  remove_after: int
  explosion_type: int
  inner_splash: int
  medium_splash: int
  outer_splash: int
  damage_amount: int
  damage_bonus: int
  weapon_cooldown: int
  damage_factor: int
  attack_angle: int
  launch_spin: int
  forward_offset: int
  upward_offset: int
  target_error_msg: int
  icon: int

WeaponsDat = DAT[Weapon](
  "weapons",
  entry_count=130,
  field_formats=["H", "I", "B", "H", "I", "I", "B", "B", "B", "B", "B", "H", "H", "H", "H", "H",
                 "B", "B", "B", "B", "B", "B", "H", "H"],
  parse=lambda x: {
    "label": x[0],
    "graphics": x[1],
    "unused": x[2],
    "target_flags": x[3],
    "min_range": x[4],
    "max_range": x[5],
    "damage_upgrade": x[6],
    "weapon_type": x[7],
    "weapon_behavior": x[8],
    "remove_after": x[9],
    "explosion_type": x[10],
    "inner_splash": x[11],
    "medium_splash": x[12],
    "outer_splash": x[13],
    "damage_amount": x[14],
    "damage_bonus": x[15],
    "weapon_cooldown": x[16],
    "damage_factor": x[17],
    "attack_angle": x[18],
    "launch_spin": x[19],
    "forward_offset": x[20],
    "upward_offset": x[21],
    "target_error_msg": x[22],
    "icon": x[23],
  }
)

if __name__ == "__main__":
    for dat in [
        FlingyDat, ImagesDat, OrdersDat, PortdataDat,
        SfxdataDat, TechdataDat,
        UpgradesDat, WeaponsDat,
        UnitsDat, SpritesDat
    ]:
      _ = dat.result

print("AA")
