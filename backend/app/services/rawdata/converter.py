from typing import cast
from app.models.components.transform import TransformComponent
from app.models.definitions.tech import TechCost
from app.models.structs.cost import Cost
from app.models.structs.required_and_provided import RequiredAndProvided
from app.models.structs.spatial import Position2D, RectPosition, Size
from app.models.structs.stat import Stat
from app.services.utils.reverse import reverse_tbl_dict
from .dat import DAT
from .chk import CHK
from functools import cached_property


class MapConverter:
  def __init__(self, dat: DAT, chk: CHK):
    self.dat = dat
    self.chk = chk

  @cached_property
  def terrain(self):
    from app.models.terrain import RawTerrain

    return RawTerrain(
      size=Size(width=self.chk.terrain.size.width, height=self.chk.terrain.size.height),
      tileset=self.chk.terrain.tileset,
    )

  @cached_property
  def tiles(self):
    from app.models.entities.tile import Tile

    return [
      Tile(
        id=id,
        group=tile.group,
        tile_id=tile.id,
        transform=TransformComponent(
          position=Position2D(x=tile.position.x, y=tile.position.y),
          size=Size(width=32, height=32),
        ),
        kind="Tile",
      )
      for id, tile in enumerate(self.chk.tiles)
    ]

  @cached_property
  def locations(self):
    from app.models.entities.location import Location

    return [
      Location(
        id=id,
        name=location.string.content,
        transform=TransformComponent(
          position=Position2D(x=location.position.x, y=location.position.y),
          size=Size(width=1, height=1),
        ),
        elevation_flags=location.elevation_flag,
        kind="Location",
      )
      for id, location in enumerate(self.chk.locations)
    ]

  @cached_property
  def validation(self):
    from app.models.validation import Validation

    return Validation(
      vcod=self.chk.validation.vcod,
      ver=self.chk.validation.ver,
    )

  @cached_property
  def mask(self):
    from app.models.entities.mask import Mask

    return [
      Mask(
        id=id,
        name=f"Mask {id}",
        transform=TransformComponent(
          position=Position2D(x=0, y=0),
          size=Size(width=1, height=1),
        ),
        kind="Mask",
        flags=mask.flags,
      )
      for id, mask in enumerate(self.chk.mask)
    ]

  @cached_property
  def scenario_property(self):
    from app.models.project import ScenarioProperty
    from app.models.string import String

    return ScenarioProperty(
      name=String(
        id=self.chk.scenario_properties.name.id,
        content=self.chk.scenario_properties.name.content,
      ),
      description=String(
        id=self.chk.scenario_properties.description.id,
        content=self.chk.scenario_properties.description.content,
      ),
    )

  @cached_property
  def players(self):
    from app.models.player import Player

    return [
      Player(
        id=id,
        name=f"Player {id + 1}",
        color=player.color,
        rgb_color=player.rgb_color,
        player_type=player.player_type,
        race=player.race,
        force=player.force.id,
      )
      for id, player in enumerate(self.chk.players)
    ]

  @cached_property
  def forces(self):
    from app.models.player import Force

    return [
      Force(id=id, name=force.name.content, properties=force.properties)
      for id, force in enumerate(self.chk.forces)
    ]

  @cached_property
  def triggers(self):
    from app.models.rawtrigger import RawTriggerSection

    return RawTriggerSection(
      raw_data=self.chk.triggers.raw_data,
    )

  @cached_property
  def mbrf_triggers(self):
    from app.models.rawtrigger import RawTriggerSection

    return RawTriggerSection(
      raw_data=self.chk.mbrf_triggers.raw_data,
    )

  @cached_property
  def strings(self):
    from app.models.string import String

    return [
      String(id=id, content=string.content)
      for id, string in enumerate(self.chk.strings)
    ]

  @cached_property
  def unit_properties(self):
    from app.models.entities.unit import UnitProperty

    return [
      UnitProperty(
        id=id,
        name="Unit Property",
        special_properties=unit_property.special_properties,
        valid_properties=unit_property.valid_properties,
        owner=unit_property.owner,
        hit_point_percent=unit_property.stats.hit_points,
        shield_point_percent=unit_property.stats.shield_points,
        energy_point_percent=unit_property.stats.energy_points or 0,
        resource_amount=unit_property.resource_amount,
        flags=unit_property.flags,
        units_in_hangar=unit_property.hangar,
      )
      for id, unit_property in enumerate(self.chk.unit_properties)
    ]

  """
  Entity section processing
  """

  @cached_property
  def placed_units(self):
    from app.models.entities.unit import Unit

    return [
      Unit(
        id=id,
        name=self.chk.unit_definitions[unit.unit_id].name,
        transform=TransformComponent(
          position=Position2D(x=unit.position.x, y=unit.position.y),
          size=Size(width=1, height=1),
        ),
        kind="Unit",
        owner=self.players[unit.owner.id],
        unit_definition=self.unit_definitions[unit.unit_id],
        unit_state=unit.unit_state,
        relation_type=unit.relation_type,
        related_unit=unit.related_unit,
        special_properties=unit.special_properties,
        valid_properties=unit.valid_properties,
        resource_amount=unit.resource_amount,
        hangar=unit.hangar,
      )
      for id, unit in enumerate(self.chk.placed_units)
    ]

  @cached_property
  def placed_sprites(self):
    from app.models.entities.sprite import Sprite

    return [
      Sprite(
        id=id,
        name=self.dat.sprites[id].name,
        transform=TransformComponent(
          position=Position2D(x=sprite.position.x, y=sprite.position.y),
          size=Size(width=1, height=1),
        ),
        kind="Sprite",
        owner=self.players[sprite.owner.id],
        definition=self.sprite_definitions[sprite.sprite_id],
        flags=sprite.flags,
      )
      for id, sprite in enumerate(self.chk.sprites)
    ]

  @cached_property
  def default_unit_entities(self):
    from app.models.entities.unit import Unit

    return [
      Unit(
        id=id,
        name=unit_definition.name,
        transform=TransformComponent(
          position=Position2D(x=0, y=0),
          size=Size(width=1, height=1),
        ),
        kind="Unit",
        owner=self.players[0],
        unit_definition=unit_definition,
        unit_state=0,
        relation_type=0,
        related_unit=0,
        special_properties=0,
        valid_properties=0,
        resource_amount=0,
        hangar=0,
      )
      for id, unit_definition in enumerate(self.unit_definitions)
    ]

  @cached_property
  def default_sprite_entities(self):
    from app.models.entities.sprite import Sprite

    return [
      Sprite(
        id=id,
        name=sprite.name,
        transform=TransformComponent(
          position=Position2D(x=0, y=0),
          size=Size(width=1, height=1),
        ),
        kind="Sprite",
        owner=self.players[0],
        definition=sprite,
        flags=0,
      )
      for id, sprite in enumerate(self.sprite_definitions)
    ]

  """
  Definition section processing
  """

  @cached_property
  def upgrades(self):
    from app.models.definitions.tech import Upgrade
    from eudplib.core.rawtrigger.strdict.upgrade import DefUpgradeDict
    from .datdata.scdat import UpgradesDat

    return [
      Upgrade(
        id=id,
        name=reverse_tbl_dict(DefUpgradeDict)[id],
        use_default=self.chk.upgrade_settings[id].uses_default,
        base_cost=Cost(
          mineral=self.chk.upgrade_settings[id].base_cost.mineral,
          gas=self.chk.upgrade_settings[id].base_cost.gas,
          time=self.chk.upgrade_settings[id].base_cost.time,
        ),
        factor_cost=Cost(
          mineral=self.chk.upgrade_settings[id].factor_cost.mineral,
          gas=self.chk.upgrade_settings[id].factor_cost.gas,
          time=self.chk.upgrade_settings[id].factor_cost.time,
        ),
        icon=upgrade["icon"],
        label=upgrade["icon"],
        race=upgrade["race"],
      )
      for id, upgrade in enumerate(UpgradesDat.result)
    ]

  @cached_property
  def tech(self):
    from app.models.definitions.tech import Technology
    from eudplib.core.rawtrigger.strdict.tech import DefTechDict
    from .datdata.scdat import TechdataDat

    return [
      Technology(
        id=id,
        name=reverse_tbl_dict(DefTechDict)[id],
        use_default=False,
        cost=TechCost(
          mineral=self.chk.technologies[id].cost.mineral,
          gas=self.chk.technologies[id].cost.gas,
          time=self.chk.technologies[id].cost.time,
          energy=self.chk.technologies[id].cost.energy,
        ),
        energy_required=bool(tech["energy_required"]),
        icon=tech["icon"],
        label=tech["label"],
        race=tech["race"],
      )
      for id, tech in enumerate(TechdataDat.result)
    ]

  @cached_property
  def upgrade_restrictions(self):
    from app.models.definitions.tech import UpgradeRestriction
    from eudplib.core.rawtrigger.strdict.upgrade import DefUpgradeDict

    return [
      UpgradeRestriction(
        id=id,
        name=reverse_tbl_dict(DefUpgradeDict)[id],
        player_maximum_level=upgrade_restriction.player_maximum_level,
        player_minimum_level=upgrade_restriction.player_minimum_level,
        default_maximum_level=upgrade_restriction.default_maximum_level,
        default_minimum_level=upgrade_restriction.default_minimum_level,
        uses_default=upgrade_restriction.uses_default,
      )
      for id, upgrade_restriction in enumerate(self.chk.upgrade_restrictions)
    ]

  @cached_property
  def tech_restrictions(self):
    from app.models.definitions.tech import TechRestriction
    from eudplib.core.rawtrigger.strdict.tech import DefTechDict

    return [
      TechRestriction(
        id=id,
        name=reverse_tbl_dict(DefTechDict)[id],
        player_availability=tech_restriction.player_availability,
        player_already_researched=tech_restriction.player_already_researched,
        default_availability=tech_restriction.default_availability,
        default_already_researched=tech_restriction.default_already_researched,
        uses_default=tech_restriction.uses_default,
      )
      for id, tech_restriction in enumerate(self.chk.tech_restrictions)
    ]

  @cached_property
  def unit_restrictions(self):
    from app.models.definitions.unit import UnitRestriction
    from eudplib.core.rawtrigger.strdict import DefUnitDict

    return [
      UnitRestriction(
        id=id,
        name=reverse_tbl_dict(DefUnitDict)[id],
        availability=unit_restriction.availability,
        global_availability=unit_restriction.global_availability,
        uses_defaults=unit_restriction.uses_defaults,
      )
      for id, unit_restriction in enumerate(self.chk.unit_restrictions)
    ]

  @cached_property
  def flingy_definitions(self):
    from app.models.definitions.flingy import FlingyDefinition

    return [
      FlingyDefinition(
        id=id,
        name=flingy.name,
        sprite=self.sprite_definitions[flingy.sprite],
        top_speed=flingy.top_speed,
        acceleration=flingy.acceleration,
        halt_distance=flingy.halt_distance,
        turn_radius=flingy.turn_radius,
        unused=flingy.unused,
        move_control=flingy.move_control,
      )
      for id, flingy in enumerate(self.dat.flingy)
    ]

  @cached_property
  def image_definitions(self):
    from app.models.definitions.image import ImageDefinition

    return [
      ImageDefinition(
        id=id,
        name=image.name,
        graphic=image.graphic,
        turnable=image.turnable,
        clickable=image.clickable,
        use_full_iscript=image.use_full_iscript,
        draw_if_cloaked=image.draw_if_cloaked,
        draw_function=image.draw_function,
        remapping=image.remapping,
        iscript_id=image.iscript_id,
        shield_overlay=image.shield_overlay,
        attack_overlay=image.attack_overlay,
        damage_overlay=image.damage_overlay,
        special_overlay=image.special_overlay,
        landing_dust_overlay=image.landing_dust_overlay,
        lift_off_overlay=image.lift_off_overlay,
      )
      for id, image in enumerate(self.dat.images)
    ]

  @cached_property
  def sprite_definitions(self):
    from app.models.definitions.sprite import SpriteDefinition

    return [
      SpriteDefinition(
        id=id,
        name=sprite.name,
        image=self.image_definitions[sprite.image],
        health_bar_id=sprite.health_bar,
        selection_circle_image_id=sprite.selection_circle_image,
        selection_circle_offset=sprite.selection_circle_offset,
      )
      for id, sprite in enumerate(self.dat.sprites)
    ]

  @cached_property
  def weapon_definitions(self):
    from app.models.definitions.weapon import (
      WeaponDefinition,
      Damage,
      Bullet,
      Splash,
    )
    from .datdata.scdat import WeaponsDat
    from eudplib.core.rawtrigger.strdict.weapon import DefWeaponDict

    return [
      WeaponDefinition(
        id=id,
        name=reverse_tbl_dict(DefWeaponDict)[id],
        damage=Damage(
          amount=weapon_definition.damage.amount,
          bonus=weapon_definition.damage.bonus,
          factor=WeaponsDat.result[id]["damage_factor"],
        ),
        bullet=Bullet(
          behaviour=WeaponsDat.result[id]["weapon_behavior"],
          remove_after=WeaponsDat.result[id]["remove_after"],
          attack_angle=WeaponsDat.result[id]["attack_angle"],
          launch_spin=WeaponsDat.result[id]["launch_spin"],
          x_offset=WeaponsDat.result[id]["forward_offset"],
          y_offset=WeaponsDat.result[id]["upward_offset"],
        ),
        splash=Splash(
          inner=WeaponsDat.result[id]["inner_splash"],
          medium=WeaponsDat.result[id]["medium_splash"],
          outer=WeaponsDat.result[id]["outer_splash"],
        ),
        cooldown=WeaponsDat.result[id]["weapon_cooldown"],
        upgrade=WeaponsDat.result[id]["damage_upgrade"],
        weapon_type=WeaponsDat.result[id]["weapon_type"],
        explosion_type=WeaponsDat.result[id]["explosion_type"],
        target_flags=WeaponsDat.result[id]["target_flags"],
        error_message=WeaponsDat.result[id]["target_error_msg"],
        icon=WeaponsDat.result[id]["icon"],
        graphics=WeaponsDat.result[id]["graphics"],
      )
      for id, weapon_definition in enumerate(self.chk.weapons)
    ]

  @cached_property
  def unit_definitions(self):
    from app.models.definitions.unit import (
      UnitDefinition,
      UnitSpecification,
      UnitStatus,
      UnitWeapon,
      UnitSound,
      UnitAI,
      UnitCost,
      UnitSize,
    )
    from .datdata.scdat import UnitsDat

    return [
      UnitDefinition(
        id=id,
        name=unit_definition.name,
        use_default=unit_definition.use_default,
        specification=UnitSpecification(
          name="Unit Specification",
          graphics=self.flingy_definitions[UnitsDat.result[id]["graphics"]],
          subunit1=UnitsDat.result[id]["subunit1"],
          subunit2=UnitsDat.result[id]["subunit2"],
          infestation=UnitsDat.result[id]["infestation"] if 106 <= id <= 201 else None,
          construction_animation=UnitsDat.result[id]["construction_animation"],
          unit_direction=UnitsDat.result[id]["unit_direction"],
          portrait=UnitsDat.result[id]["portrait"],
          label=0,
        ),
        stats=UnitStatus(
          name="Unit Status",
          hit_points=Stat(
            current=self.chk.unit_definitions[id].stat.hit_points,
            max=self.chk.unit_definitions[id].stat.hit_points,
          ),
          shield_points=Stat(
            current=self.chk.unit_definitions[id].stat.shield_points,
            max=self.chk.unit_definitions[id].stat.shield_points,
          ),
          shield_enable=cast(bool, UnitsDat.result[id]["shield_enable"]),
          energy_points=Stat(
            current=self.chk.unit_definitions[id].stat.energy_points or 0,
            max=self.chk.unit_definitions[id].stat.energy_points or 0,
          ),
          armor_upgrade=UnitsDat.result[id]["armor_upgrade"],
          rank=UnitsDat.result[id]["rank"],
          elevation_level=UnitsDat.result[id]["elevation_level"],
        ),
        weapons=UnitWeapon(
          ground_weapon=self.weapon_definitions[UnitsDat.result[id]["ground_weapon"]]
          if UnitsDat.result[id]["ground_weapon"] < 130
          else None,
          air_weapon=self.weapon_definitions[UnitsDat.result[id]["air_weapon"]]
          if UnitsDat.result[id]["air_weapon"] < 130
          else None,
          max_ground_hits=UnitsDat.result[id]["max_ground_hits"],
          max_air_hits=UnitsDat.result[id]["max_air_hits"],
          target_acquisition_range=UnitsDat.result[id]["target_acquisition_range"],
          sight_range=UnitsDat.result[id]["sight_range"],
          special_ability_flags=UnitsDat.result[id]["special_ability_flags"],
        ),
        sound=UnitSound(
          ready=UnitsDat.result[id]["ready_sound"] if id <= 105 else None,
          what_start=UnitsDat.result[id]["what_sound_start"],
          what_end=UnitsDat.result[id]["what_sound_end"],
          piss_start=UnitsDat.result[id]["piss_sound_start"] if id <= 105 else None,
          piss_end=UnitsDat.result[id]["piss_sound_end"] if id <= 105 else None,
          yes_start=UnitsDat.result[id]["yes_sound_start"] if id <= 105 else None,
          yes_end=UnitsDat.result[id]["yes_sound_end"] if id <= 105 else None,
        ),
        size=UnitSize(
          size_type=UnitsDat.result[id]["unit_size"],
          placement_box_size=Size(
            height=UnitsDat.result[id]["placement_box_height"],
            width=UnitsDat.result[id]["placement_box_width"],
          ),
          bounds=RectPosition(
            left=UnitsDat.result[id]["size_left"],
            right=UnitsDat.result[id]["size_right"],
            top=UnitsDat.result[id]["size_up"],
            bottom=UnitsDat.result[id]["size_down"],
          ),
          addon_position=Position2D(
            x=cast(int, UnitsDat.result[id]["addon_horizontal"]),
            y=cast(int, UnitsDat.result[id]["addon_vertical"]),
          )
          if 106 <= id <= 201
          else None,
        ),
        cost=UnitCost(
          cost=Cost(
            mineral=unit_definition.cost.mineral,
            gas=unit_definition.cost.gas,
            time=unit_definition.cost.time,
          ),
          build_score=UnitsDat.result[id]["build_score"],
          destroy_score=UnitsDat.result[id]["destroy_score"],
          is_broodwar=cast(bool, UnitsDat.result[id]["broodwar_unit_flag"]),
          supply=RequiredAndProvided(
            required=UnitsDat.result[id]["supply_required"],
            provided=UnitsDat.result[id]["supply_provided"],
          ),
          space=RequiredAndProvided(
            required=UnitsDat.result[id]["space_required"],
            provided=UnitsDat.result[id]["space_provided"],
          ),
        ),
        ai=UnitAI(
          computer_idle=UnitsDat.result[id]["comp_ai_idle"],
          human_idle=UnitsDat.result[id]["human_ai_idle"],
          return_to_idle=UnitsDat.result[id]["return_to_idle"],
          attack_and_move=UnitsDat.result[id]["attack_move"],
          internal=UnitsDat.result[id]["ai_internal"],
          right_click=UnitsDat.result[id]["right_click_action"],
          attack_unit=UnitsDat.result[id]["attack_unit"],
        ),
      )
      for id, unit_definition in enumerate(self.chk.unit_definitions)
    ]

  @cached_property
  def orders(self):
    from app.models.definitions.order import OrderDefinition
    from eudplib.core.rawtrigger.strdict.unitorder import DefUnitOrderDict

    return [
      OrderDefinition(
        id=id,
        name=reverse_tbl_dict(DefUnitOrderDict)[id],
        label=order.label,
        use_weapon_targeting=order.use_weapon_targeting,
        can_be_interrupted=order.can_be_interrupted,
        can_be_queued=order.can_be_queued,
        targeting=order.targeting,
        energy=order.energy,
        animation=order.animation,
        highlight=order.highlight,
        obscured_order=order.obscured_order,
      )
      for id, order in enumerate(self.dat.orders)
    ]

  @cached_property
  def portraits(self):
    from app.models.definitions.portrait import PortraitDefinition
    from eudplib.core.rawtrigger.strdict.portrait import DefPortraitDict

    return [
      PortraitDefinition(
        id=id,
        name=reverse_tbl_dict(DefPortraitDict)[id],
        portrait_file=portrait.portrait_file,
        smk_change=portrait.smk_change,
        unknown1=portrait.unknown1,
      )
      for id, portrait in enumerate(self.dat.portraits)
    ]
