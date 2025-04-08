from eudplib import EUDMethod, EUDOnStart
from wengine.entities.unit import Unit
from app.models.project import Map
from typing import Callable

class Transformer():
  """Backend model into wengine-based trigger transformer."""
  def __init__(self, map: Map):
    self.map = map
    
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
    for rawunit in self.map.unit:
      unit = TrgUnit(rawunit.id)
      
      "Weapon"
      unit.groundWeapon = rawunit.weapons.ground_weapon.id if rawunit.weapons.ground_weapon else 130
      unit.airWeapon = rawunit.weapons.air_weapon.id if rawunit.weapons.air_weapon else 130
      unit.maxGroundHits = rawunit.weapons.max_ground_hits
      unit.maxAirHits = rawunit.weapons.max_air_hits
      unit.seekRange = rawunit.weapons.target_acquisition_range
      unit.sightRange = rawunit.weapons.sight_range
    
      "Basic Specification"
      unit.flingy = rawunit.basic_specification.graphics
      unit.subUnit = rawunit.basic_specification.subunit1
      if rawunit.basic_specification.infestation:
        ... #TODO: Infestation is not supported current version of eudplib, so have to deal with manually.
      unit.constructionGraphic = rawunit.basic_specification.construction_animation
      unit.startDirection = rawunit.basic_specification.unit_direction
      unit.portrait = rawunit.basic_specification.portrait
      
      "AI"
      unit.computerIdleOrder = rawunit.ai.computer_idle
      unit.humanIdleOrder = rawunit.ai.return_to_idle
      unit.returnToIdleOrder = rawunit.ai.return_to_idle
      unit.attackMoveOrder = rawunit.ai.attack_and_move
      unit.attackUnitOrder = rawunit.ai.attack_unit
      unit.rightClickAction = rawunit.ai.right_click
      # unit.internal = rawunit.ai.internal #TODO: scdata doesn't support unit.internal?
      
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
    
  @EUDMethod
  def initialize_tech_specification(self):
    """Initialize technology specificaiton"""
    from eudplib import Tech
    for rawtech in self.map.technologies:
      tech = Tech(rawtech.id)
      
      tech.icon = rawtech.icon
      tech.label = rawtech.label
      tech.race = rawtech.race
  
  @EUDMethod
  def initialize_upgrade_specification(self):
    from eudplib import Upgrade
    for rawupgrade in self.map.upgrades:
      upgrade = Upgrade(rawupgrade.id)
      
      upgrade.icon = rawupgrade.icon
      upgrade.label = rawupgrade.label
      upgrade.race = rawupgrade.race
  
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