from app.core.w_logging import get_logger
from eudplib import EUDMethod, EUDOnStart
from app.models.project import Usemap
from typing import Callable

class Transformer():
  """Backend model into wengine-based trigger transformer."""
  def __init__(self, map: Usemap):
    self.map = map
    self.logger = get_logger("transformer")
    
  def transform(self) -> Callable:
    def _main():
      EUDOnStart(self.allocate_objects)
      EUDOnStart(self.initialize_specifications)
      
    return _main
  
  @EUDMethod
  def initialize_specifications(self):
    """Initialize every specifications(unit, tech, etc) into map.

    Where chk related specification can be processed in map serialization,
    dat related specification need to processed via EUD Trigger.
    
    Those specifications initialized once and never used.
    """
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
    ... #TODO: Allocate objects, like placed unit, terrain, locations.
    
  @EUDMethod
  def initialize_unit_specification(self):
    """Initialize unit specification(dat file related data)
     
    Unit Specification isn't placed unit information, so not entity. Therefore internally using
    `scdata.TrgUnit` for unit data processing.
    
    Note: Placed unit will be allocated in wengine main loop. For more information see
    `Transformer.alloc_units()`
    """
    from eudplib import TrgUnit
    for rawunit in self.map.unit_definitions:
      unit = TrgUnit(rawunit.id)
      
      "Weapon"
      unit.groundWeapon = rawunit.weapons.ground_weapon.id if rawunit.weapons.ground_weapon else 130
      unit.airWeapon = rawunit.weapons.air_weapon.id if rawunit.weapons.air_weapon else 130
      unit.maxGroundHits = rawunit.weapons.max_ground_hits
      unit.maxAirHits = rawunit.weapons.max_air_hits
      unit.seekRange = rawunit.weapons.target_acquisition_range
      unit.sightRange = rawunit.weapons.sight_range
    
      "Basic Specification"
      unit.flingy = rawunit.specification.graphics
      unit.subUnit = rawunit.specification.subunit1
      if rawunit.specification.infestation:
        ... #TODO: Infestation is not supported current version of eudplib, so have to deal with manually.
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

    self.logger.info(f"Initializing unit specifications was succesful. Total initialized {len(self.map.unit_definitions)}")
    
  @EUDMethod
  def initialize_tech_specification(self):
    """Initialize technology specificaiton"""
    from eudplib import Tech
    for rawtech in self.map.technologies:
      tech = Tech(rawtech.id)
      
      tech.icon = rawtech.icon
      tech.label = rawtech.label
      tech.race = rawtech.race

    self.logger.info(f"Initializing tech specifications was succesful. Total initialized {len(self.map.technologies)}")
  
  @EUDMethod
  def initialize_upgrade_specification(self):
    from eudplib import Upgrade
    for rawupgrade in self.map.upgrades:
      upgrade = Upgrade(rawupgrade.id)
      
      upgrade.icon = rawupgrade.icon
      upgrade.label = rawupgrade.label
      upgrade.race = rawupgrade.race

    self.logger.info(f"Initializing upgrade specifications was succesful. Total initialized {len(self.map.upgrades)}")
  
  @EUDMethod
  def initialize_weapon_specification(self):
    from eudplib import Weapon

    for rawweapon in self.map.weapons:
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

    self.logger.info(f"Initializing weapon specifications was succesful. Total initialized {len(self.map.weapons)}")
    
  @EUDMethod
  def initialize_sprite_speicification(self):
    from eudplib import Sprite
    for rawsprite in self.map.sprite:
      sprite = Sprite(rawsprite.id)

      sprite.image = rawsprite.image
      if rawsprite.health_bar:
        """
        TODO: health_bar, selection_circle_image, selection_circle offset is not supported yet
        current version of eudplib.
        """
        ...

    self.logger.info(f"Initializing sprite_specfications was succesful. Total initialized {len(self.map.sprite)}")

  @EUDMethod
  def initialize_image_specifications(self):
    from eudplib import Image
    for rawimage in self.map.images:
      image = Image(rawimage.id)
      
      image.isTurnable = rawimage.turnable
      image.isClickable = rawimage.clickable
      image.useFullIscript = rawimage.use_full_iscript
      image.drawIfCloaked = rawimage.draw_if_cloaked
      image.drawingFunction = rawimage.draw_function
      image.iscript = rawimage.iscript_id
      image.useFullIscript = rawimage.use_full_iscript

    self.logger.info(f"Initializing image specifications was succesful. Total initialized {len(self.map.images)}")
  
  @EUDMethod
  def initialize_flingy_specifications(self):
    from eudplib import Flingy
    for rawflingy in self.map.flingy:
      flingy = Flingy(rawflingy.id)
      
      flingy.sprite = rawflingy.sprite
      flingy.topSpeed = rawflingy.topSpeed
      flingy.acceleration = rawflingy.acceleration
      flingy.haltDistance = rawflingy.haltDistance
      flingy.turnSpeed = rawflingy.turnRadius
      flingy.turnRadius = rawflingy.turnRadius
      flingy.movementControl = rawflingy.moveControl

    self.logger.info(f"Initializing flingy specifications was succesful. Total initialized {len(self.map.flingy)}")
  
  @EUDMethod
  def initialize_order_specifications(self):
    from eudplib import UnitOrder 
    for raworder in self.map.orders:
      order = UnitOrder(raworder.id)
      
      order.label = raworder.label
      order.useWeaponTargeting = raworder.use_weapon_targeting
      order.canBeInterrupted = raworder.can_be_interrupted
      order.canBeQueued = raworder.can_be_queued
      order.disablingKeepsTarget = raworder.targeting
      order.animation = raworder.animation
      order.obscuredOrder = raworder.obscured_order

    self.logger.info(f"Initializing order specifications was succesful. Total initialized {len(self.map.orders)}")