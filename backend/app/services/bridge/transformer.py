from app.core.w_logging import get_logger
from eudplib import (
  EUDDoEvents,
  EUDEndIf,
  EUDEndInfLoop,
  EUDFunc,
  EUDIf,
  EUDInfLoop,
  EUDMethod,
  CUnit,
  EUDTypedFunc,
  EUDTypedFuncPtr,
  f_println,
  f_simpleprint,
)
from eudplib.trigtrg.runtrigtrg import RunTrigTrigger
from app.models.project import Usemap
from typing import Callable
from wengine.main import main_loop


class Transformer:
  """Backend model into wengine-based trigger transformer."""

  def __init__(self, map: Usemap):
    self.map = map
    self.logger = get_logger("transformer")

  def transform(self) -> Callable:
    @EUDFunc
    def _main():
      self.initialize_specifications()
      self.allocate_objects()

      if EUDInfLoop()():
        main_loop()
        RunTrigTrigger()
        EUDDoEvents()

      EUDEndInfLoop()

    return _main

  @EUDMethod
  def initialize_specifications(self):
    """Initialize every specifications(unit, tech, etc) into map.

    Where chk related specification can be processed in map serialization,
    dat related specification need to processed via EUD Trigger.

    Those specifications initialized once and never used.
    """
    f_simpleprint("Initialize Specification Phase")
    self.initialize_weapon_specification()
    self.initialize_unit_specification()
    self.initialize_tech_specification()
    self.initialize_upgrade_specification()
    self.initialize_sprite_speicification()

  @EUDMethod
  def allocate_objects(self):
    """Allocate every wengine based objects(wobject) into map.

    Unlike `initialize_specifications()`, allocated objects will be used every tick
    on main loop.
    """
    f_simpleprint("Allocationg Phase 1234")
    self.allocate_placed_units()

  @EUDMethod
  def allocate_placed_units(self):
    from wengine.entities.unit import Unit
    from app.models.entities.unit import Unit as UnitEntity

    @EUDTypedFunc([Unit], [])
    def on_burrow(unit: Unit):
      cunit = CUnit.from_ptr(unit.ptr)
      if EUDIf()(cunit.is_burrowed()):
        cunit.die()
      EUDEndIf()

    @EUDTypedFunc([Unit], [])
    def event_tick(unit: Unit):
      f_println("Unit address: {}", unit.ptr)

    placed_units = [u.data for u in self.map.entities if isinstance(u.data, UnitEntity)]

    id_without_start_location = 0
    for rawunit in placed_units:
      if rawunit.id is not None and rawunit.unit_definition.id != 214:
        unit = Unit.alloc(id_without_start_location)
        id_without_start_location += 1
        cunit = CUnit.from_ptr(unit.ptr)
        cunit.unitID = rawunit.unit_definition.id
        self.logger.info(f"Allocating unit {rawunit.id}: {rawunit.name}")
        self.logger.info(
          f"Unit definition id: {rawunit.unit_definition.id}, serial_number: {rawunit.serial_number}"
        )

        # unit.on_burrow = EUDFuncPtr(1, 0)(on_burrow)
        unit.on_burrow = EUDTypedFuncPtr([Unit], [])(on_burrow)
        unit.event_tick = EUDTypedFuncPtr([Unit], [])(event_tick)

        unit.allocate()

    self.logger.info(
      f"Allocating placed units were succesful. Total allocated {id_without_start_location}"
    )

  @EUDMethod
  def initialize_unit_specification(self):
    """Initialize unit specification(dat file related data)

    Unit Specification isn't placed unit information, so not entity. Therefore internally using
    `scdata.TrgUnit` for unit data processing.

    Note: Placed unit will be allocated in wengine main loop. For more information see
    `Transformer.alloc_units()`
    """
    from eudplib import TrgUnit
    from app.models.definitions.unit import UnitDefinition

    units = [a.data for a in self.map.assets if isinstance(a.data, UnitDefinition)]
    for rawunit in units:
      unit = TrgUnit(rawunit.id)

      "Weapon"
      unit.groundWeapon = (
        rawunit.weapons.ground_weapon.id if rawunit.weapons.ground_weapon else 130
      )
      unit.airWeapon = (
        rawunit.weapons.air_weapon.id if rawunit.weapons.air_weapon else 130
      )
      unit.maxGroundHits = rawunit.weapons.max_ground_hits
      unit.maxAirHits = rawunit.weapons.max_air_hits
      unit.seekRange = rawunit.weapons.target_acquisition_range
      unit.sightRange = rawunit.weapons.sight_range

      "Basic Specification"
      unit.flingy = rawunit.specification.graphics.id
      unit.subUnit = rawunit.specification.subunit1
      if rawunit.specification.infestation:
        ...  # TODO: Infestation is not supported current version of eudplib, so have to deal with manually.
      unit.constructionGraphic = rawunit.specification.construction_animation
      unit.startDirection = rawunit.specification.unit_direction
      unit.portrait = rawunit.specification.portrait

      "AI"
      unit.computerIdleOrder = rawunit.ai.computer_idle
      unit.humanIdleOrder = rawunit.ai.return_to_idle
      unit.returnToIdleOrder = rawunit.ai.return_to_idle
      unit.attackMoveOrder = rawunit.ai.attack_and_move
      unit.attackUnitOrder = rawunit.ai.attack_unit
      unit.rightClickAction = rawunit.ai.right_click
      # unit.internal = unit.ai.internal #TODO: scdata doesn't support unit.internal?

      "Sound"
      unit.whatSoundStart = rawunit.sound.what_start
      unit.whatSoundEnd = rawunit.sound.what_end
      if rawunit.sound.ready:
        unit.readySound = rawunit.sound.ready
      if rawunit.sound.piss_start:
        unit.pissedSoundStart = rawunit.sound.piss_start
      if rawunit.sound.piss_end:
        unit.pissedSoundEnd = rawunit.sound.piss_end
      if rawunit.sound.yes_start:
        unit.yesSoundStart = rawunit.sound.yes_start
      if rawunit.sound.yes_end:
        unit.yesSoundEnd = rawunit.sound.yes_end

      "Size"
      unit.sizeType = rawunit.size.size_type
      unit.unitBoundsB = rawunit.size.bounds.bottom
      unit.unitBoundsL = rawunit.size.bounds.left
      unit.unitBoundsR = rawunit.size.bounds.right
      unit.unitBoundsT = rawunit.size.bounds.top

      "Cost"
      unit.mineralCost = rawunit.cost.cost.mineral
      unit.gasCost = rawunit.cost.cost.gas
      unit.timeCost = rawunit.cost.cost.time
      unit.buildScore = rawunit.cost.build_score
      unit.killScore = rawunit.cost.destroy_score
      unit.broodWarFlag = rawunit.cost.is_broodwar
      unit.supplyProvided = rawunit.cost.supply.provided
      unit.supplyUsed = rawunit.cost.supply.required
      unit.transportSpaceProvided = rawunit.cost.space.provided
      unit.transportSpaceRequired = rawunit.cost.space.required

    self.logger.info(
      f"Initializing unit specifications was succesful. Total initialized {len(units)}"
    )

  @EUDMethod
  def initialize_tech_specification(self):
    """Initialize technology specificaiton"""
    from eudplib import Tech
    from app.models.definitions.tech import Technology

    technologies = [a.data for a in self.map.assets if isinstance(a.data, Technology)]
    for rawtech in technologies:
      tech = Tech(rawtech.id)

      tech.icon = rawtech.icon
      tech.label = rawtech.label
      tech.race = rawtech.race

    self.logger.info(
      f"Initializing tech specifications was succesful. Total initialized {len(technologies)}"
    )

  @EUDMethod
  def initialize_upgrade_specification(self):
    from eudplib import Upgrade
    from app.models.definitions.tech import Upgrade as UpgradeDefinition

    upgrades = [
      a.data for a in self.map.assets if isinstance(a.data, UpgradeDefinition)
    ]
    for rawupgrade in upgrades:
      upgrade = Upgrade(rawupgrade.id)

      upgrade.icon = rawupgrade.icon
      upgrade.label = rawupgrade.label
      upgrade.race = rawupgrade.race

    self.logger.info(
      f"Initializing upgrade specifications was succesful. Total initialized {len(upgrades)}"
    )

  @EUDMethod
  def initialize_weapon_specification(self):
    from eudplib import Weapon
    from app.models.definitions.weapon import WeaponDefinition

    weapons = [a.data for a in self.map.assets if isinstance(a.data, WeaponDefinition)]
    for rawweapon in weapons:
      weapon = Weapon(rawweapon.id)

      weapon.cooldown = rawweapon.cooldown
      weapon.upgrade = rawweapon.upgrade
      weapon.damageType = rawweapon.weapon_type
      weapon.explosionType = rawweapon.explosion_type
      weapon.targetFlags = rawweapon.target_flags
      weapon.targetErrorMessage = rawweapon.error_message
      weapon.icon = rawweapon.icon
      weapon.flingy = rawweapon.graphics

      "Damage"
      weapon.damageFactor = rawweapon.damage.factor

      "Bullet"
      weapon.behavior = rawweapon.bullet.behaviour
      weapon.removeAfter = rawweapon.bullet.remove_after
      weapon.attackAngle = rawweapon.bullet.attack_angle
      weapon.launchSpin = rawweapon.bullet.launch_spin
      weapon.graphicXOffset = rawweapon.bullet.x_offset
      weapon.graphicYOffset = rawweapon.bullet.y_offset

      "Splash"
      weapon.splashInnerRadius = rawweapon.splash.inner
      weapon.splashMiddleRadius = rawweapon.splash.medium
      weapon.splashOuterRadius = rawweapon.splash.outer

    self.logger.info(
      f"Initializing weapon specifications was succesful. Total initialized {len(weapons)}"
    )

  @EUDMethod
  def initialize_sprite_speicification(self):
    from eudplib import Sprite
    from app.models.definitions.sprite import SpriteDefinition

    sprites = [a.data for a in self.map.assets if isinstance(a.data, SpriteDefinition)]
    for rawsprite in sprites:
      sprite = Sprite(rawsprite.id)

      sprite.image = rawsprite.image.id
      if rawsprite.health_bar_id:
        """
        TODO: health_bar, selection_circle_image, selection_circle offset is not supported yet
        current version of eudplib.
        """
        ...

    self.logger.info(
      f"Initializing sprite_specfications was succesful. Total initialized {len(sprites)}"
    )

  @EUDMethod
  def initialize_image_specifications(self):
    from eudplib import Image
    from app.models.definitions.image import ImageDefinition

    images = [a.data for a in self.map.assets if isinstance(a.data, ImageDefinition)]
    for rawimage in images:
      image = Image(rawimage.id)

      image.isTurnable = rawimage.turnable
      image.isClickable = rawimage.clickable
      image.useFullIscript = rawimage.use_full_iscript
      image.drawIfCloaked = rawimage.draw_if_cloaked
      image.drawingFunction = rawimage.draw_function
      image.iscript = rawimage.iscript_id
      image.useFullIscript = rawimage.use_full_iscript

    self.logger.info(
      f"Initializing image specifications was succesful. Total initialized {len(images)}"
    )

  @EUDMethod
  def initialize_flingy_specifications(self):
    from eudplib import Flingy
    from app.models.definitions.flingy import FlingyDefinition

    flingys = [a.data for a in self.map.assets if isinstance(a.data, FlingyDefinition)]
    for rawflingy in flingys:
      flingy = Flingy(rawflingy.id)

      flingy.sprite = rawflingy.sprite.id
      flingy.topSpeed = rawflingy.top_speed
      flingy.acceleration = rawflingy.acceleration
      flingy.haltDistance = rawflingy.halt_distance
      flingy.turnSpeed = rawflingy.turn_radius
      flingy.turnRadius = rawflingy.turn_radius
      flingy.movementControl = rawflingy.move_control

    self.logger.info(
      f"Initializing flingy specifications was succesful. Total initialized {len(flingys)}"
    )

  @EUDMethod
  def initialize_order_specifications(self):
    from eudplib import UnitOrder
    from app.models.definitions.order import OrderDefinition

    orders = [a.data for a in self.map.assets if isinstance(a.data, OrderDefinition)]
    for raworder in orders:
      order = UnitOrder(raworder.id)

      order.label = raworder.label
      order.useWeaponTargeting = raworder.use_weapon_targeting
      order.canBeInterrupted = raworder.can_be_interrupted
      order.canBeQueued = raworder.can_be_queued
      order.disablingKeepsTarget = raworder.targeting
      order.animation = raworder.animation
      order.obscuredOrder = raworder.obscured_order

    self.logger.info(
      f"Initializing order specifications was succesful. Total initialized {len(orders)}"
    )
