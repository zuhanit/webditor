from typing import cast
from app.models.sprite import CHKSprite, Sprite
from app.services.mapdata.chk import CHK
from app.models.spatial import Position2D, RectPosition, Size
from app.models.components.transform import TransformComponent
from app.models.components.weapon_component import WeaponComponent
from app.models.definitions.weapon_definition import Bullet, Damage, Splash, WeaponDefinition
from app.models.tech import Technology, Upgrade
from app.models.unit import CHKUnit, RequiredAndProvided, Unit, UnitAIComponent, UnitCostComponent, UnitSizeComponent, UnitSoundComponent, UnitSpecificationComponent, UnitStatComponent
from app.services.rawdata.dat import DAT
from .rawdata.datdata import *
from .utils.reverse import reverse_tbl_dict

class Merger():
  def __init__(self, chk: CHK, dat: DAT):
    self.chk = chk
    self.dat = dat

  def merge_weapon(self) -> list[WeaponDefinition]:
    from eudplib.core.rawtrigger.strdict.weapon import DefWeaponDict
    result: list[WeaponDefinition] = []
    chk_weapons = self.chk.get_weapons()
    for id, weapon in enumerate(WeaponsDat.result):
      chk_damage = chk_weapons[id].damage

      result.append(WeaponDefinition(
        id=id,
        name=reverse_tbl_dict(DefWeaponDict)[id],
        damage=Damage(
          amount=chk_damage.amount,
          bonus=chk_damage.bonus,
          factor=weapon["damage_factor"],
        ),
        bullet=Bullet(
          behaviour=weapon["weapon_behavior"],
          remove_after=weapon["remove_after"],
          attack_angle=weapon["attack_angle"],
          launch_spin=weapon["launch_spin"],
          x_offset=weapon["forward_offset"],
          y_offset=weapon["upward_offset"],
        ),
        splash=Splash(
          inner=weapon["inner_splash"],
          medium=weapon["medium_splash"],
          outer=weapon["outer_splash"],
        ),
        cooldown=weapon["weapon_cooldown"],
        upgrade=weapon["damage_upgrade"],
        weapon_type=weapon["weapon_type"],
        explosion_type=weapon["explosion_type"],
        target_flags=weapon["target_flags"],
        error_message=weapon["target_error_msg"],
        icon=weapon["icon"],
        graphics=weapon["graphics"]
      ))
    
    return result

  def merge_upgrade(self) -> list[Upgrade]:
    from eudplib.core.rawtrigger.strdict.upgrade import DefUpgradeDict
    result: list[Upgrade] = []
    chk_upgrades = self.chk.get_upgrade_settings()
    for id, upgrade in enumerate(UpgradesDat.result):
      chk_upgrade = chk_upgrades[id]
      
      result.append(Upgrade(
        id=id,
        name=reverse_tbl_dict(DefUpgradeDict)[id],
        use_default=False,
        base_cost=chk_upgrade.base_cost,
        factor_cost=chk_upgrade.factor_cost,
        icon=upgrade["icon"],
        label=upgrade["icon"],
        race=upgrade["race"]
      ))
    
    return result
  
  def merge_tech(self) -> list[Technology]:
    from eudplib.core.rawtrigger.strdict.tech import DefTechDict
    result: list[Technology] = []
    chk_technologies = self.chk.get_technologies()
    for id, tech in enumerate(TechdataDat.result):
      chk_tech = chk_technologies[id]
      
      result.append(Technology(
        id=id,
        name=reverse_tbl_dict(DefTechDict)[id],
        use_default=False,
        cost=chk_tech.cost,
        energy_required=bool(tech["energy_required"]),
        icon=tech["icon"],
        label=tech["label"],
        race=tech["race"],
      ))
    
    return result
  
  def merge_unit(self) -> list[Unit]:
    result: list[Unit] = []
    weapon_definitions: list[WeaponDefinition] = self.merge_weapon()
    
    for id, unit in enumerate(UnitsDat.result):
      chk_unit = self.chk.unitdata_table[id]
      try: 
        ground_weapon_id = unit["ground_weapon"]
        air_weapon_id = unit["air_weapon"]
        # ground_weapon = weapon_definitions[ground_weapon_id] if ground_weapon_id < 130 else None
        ground_weapon = weapon_definitions[8]
        # air_weapon = weapon_definitions[air_weapon_id] if air_weapon_id < 130 else None
        air_weapon = weapon_definitions[8]
      except IndexError as e:
        raise IndexError(f"Invalid weapon id of unit {id}. Ground: {ground_weapon_id}, Air: {air_weapon_id}")

      unit_basic_specificaiton = UnitSpecificationComponent(
        graphics=unit["graphics"],
        subunit1=unit["subunit1"],
        subunit2=unit["subunit2"],
        infestation=unit["infestation"] if 106 <= id <= 201 else None,
        construction_animation=unit["construction_animation"],
        unit_direction=unit["unit_direction"],
        portrait=unit["portrait"],
        label=0
      )
      
      unit_stats = UnitStatComponent(
        hit_points=chk_unit.hit_points,
        shield_enable=cast(bool, unit["shield_enable"]),
        shield_points=chk_unit.shield_points,
        energy_points=chk_unit.energy_points,
        armor_points=chk_unit.armor_points,
        armor_upgrade=unit["armor_upgrade"],
        rank=unit["rank"],
        elevation_level=unit["elevation_level"]
      )
      
      unit_ai = UnitAIComponent(
        computer_idle=unit["comp_ai_idle"],
        human_idle=unit["human_ai_idle"],
        return_to_idle=unit["return_to_idle"],
        attack_and_move=unit["attack_move"],
        internal=unit["ai_internal"],
        right_click=unit["right_click_action"],
        attack_unit=unit["attack_unit"]
      )
      
      unit_sound = UnitSoundComponent(
        ready=unit["ready_sound"] if id <= 105 else None,
        what_start=unit["what_sound_start"] ,
        what_end=unit["what_sound_end"],
        piss_start=unit["piss_sound_start"] if id <= 105 else None,
        piss_end=unit["piss_sound_end"] if id <= 105 else None,
        yes_start=unit["yes_sound_start"] if id <= 105 else None,
        yes_end=unit["yes_sound_end"] if id <= 105 else None,
      )
      
      unit_size = UnitSizeComponent(
        size_type=unit["unit_size"],
        placement_box_size=Size(
          height=unit["placement_box_height"],
          width=unit["placement_box_width"],
        ),
        bounds=RectPosition(
          left=unit["size_left"],
          top=unit["size_up"],
          right=unit["size_right"],
          bottom=unit["size_down"]
        ),
        addon_position=Position2D(
          x=cast(int, unit["addon_horizontal"]),
          y=cast(int, unit["addon_vertical"])
        ) if 106 <= id <= 201 else None,
      )


      result.append(Unit(
        id=id,
        name=chk_unit.name,
        transform=TransformComponent(
          position=Position2D()
        ),
        basic_specification=unit_basic_specificaiton,
        stats=unit_stats,
        ai=unit_ai,
        sound=unit_sound,
        size=unit_size,
        cost=UnitCostComponent(
          cost=chk_unit.cost,
          build_score=unit["build_score"],
          destroy_score=unit["destroy_score"],
          is_broodwar=cast(bool, unit["broodwar_unit_flag"]),
          supply=RequiredAndProvided(
            required=unit["supply_required"],
            provided=unit["supply_provided"],
          ),
          space=RequiredAndProvided(
            required=unit["space_required"],
            provided=unit["space_provided"]
          ),
        ),
        weapons=WeaponComponent(
          ground_weapon=ground_weapon,
          # max_ground_hits=unit["max_ground_hits"],
          max_ground_hits=3,
          air_weapon=air_weapon,
          max_air_hits=unit["max_air_hits"],
          target_acquisition_range=unit["target_acquisition_range"],
          sight_range=unit["sight_range"],
          special_ability_flags=unit["special_ability_flags"]
        ),
      ))
      
    return result
  
  def merge_placed_unit(self) -> list[Unit]:
    def _merge(chkunit: CHKUnit, unitspec: Unit):
      from copy import deepcopy
      unitdata = deepcopy(unitspec)
      unitdata.id = chkunit.id
      unitdata.transform = chkunit.transform
      unitdata.serial_number = chkunit.serial_number
      unitdata.relation_type = chkunit.relation_type
      unitdata.special_properties = chkunit.special_properties
      unitdata.valid_properties = chkunit.valid_properties
      unitdata.owner = chkunit.owner
      unitdata.resource_amount = chkunit.resource_amount
      unitdata.hangar = chkunit.hangar
      unitdata.unit_state = chkunit.unit_state
      unitdata.related_unit = chkunit.related_unit
      unitdata.stats.hit_points = chkunit.hit_points
      unitdata.stats.shield_points = chkunit.hit_points
      
      return unitdata 

    result: list[Unit] = []
    chk_placed_units = self.chk.get_placed_units()
    unit_specs = self.merge_unit()
    
    for id, unit in enumerate(chk_placed_units):
      unit_spec = unit_specs[unit.id]
      
      result.append(_merge(unit, unit_spec))
    
    return result
  
  def merge_placed_sprite(self) -> list[Sprite]:
    def _merge(chksprite: CHKSprite, spritespec: Sprite):
      from copy import deepcopy
      spritedata = deepcopy(spritespec)
      spritedata.id = chksprite.id
      spritedata.transform = chksprite.transform
      spritedata.owner = chksprite.owner
      spritedata.flags = chksprite.flags
      
      return spritedata
    result: list[Sprite] = []
    chk_sprites = self.chk.get_placed_sprites() 
    sprite_specs = self.dat.get_sprites()

    for id, sprite in enumerate(chk_sprites):
      sprite_spec = sprite_specs[id]

      result.append(_merge(sprite, sprite_spec))
    
    return result