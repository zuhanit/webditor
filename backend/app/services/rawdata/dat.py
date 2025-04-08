from app.models.flingy import Flingy
from app.models.images import Image
from app.models.order import Order
from app.models.portrait import Portrait
from .datdata import *

class DAT():
  def get_images(self) -> list[Image]:
    result: list[Image] = []
    for id, image in enumerate(ImagesDat.result):
      result.append(Image(
        id=id,
        graphic=image["grp_id"],
        turnable=image["turnable"],
        clickable=image["clickable"],
        use_full_iscript=image["use_full_iscript"],
        draw_if_cloaked=image["draw_if_cloaked"],
        draw_function=image["draw_function"],
        remapping=image["remapping"],
        iscript_id=image["iscript_id"],
        shield_overlay=image["shield_overlay"],
        attack_overlay=image["attack_overlay"],
        damage_overlay=image["damage_overlay"],
        special_overlay=image["special_overlay"],
        landing_dust_overlay=image["landing_dust_overlay"],
        lift_off_overlay=image["lift_off_overlay"]
      ))

    return result
  
  def get_flingy(self) -> list[Flingy]:
    result: list[Flingy] = []
    for id, flingy in enumerate(FlingyDat.result):
      result.append(Flingy(
        id=id,
        sprite=flingy["sprite"],
        topSpeed=flingy["topSpeed"],
        acceleration=flingy["acceleration"],
        haltDistance=flingy["haltDistance"],
        turnRadius=flingy["turnRadius"],
        unused=flingy["unused"],
        moveControl=flingy["moveControl"]
      ))
      
    return result
  
  def get_orders(self) -> list[Order]:
    result: list[Order] = []
    for id, order in enumerate(OrdersDat.result):
      result.append(Order(
        id=id,
        label=order["label"],
        use_weapon_targeting=order["use_weapon_targeting"],
        can_be_interrupted=order["can_be_interrupted"],
        can_be_queued=order["can_be_queued"],
        targeting=order["targeting"],
        energy=order["energy"],
        animation=order["animation"],
        highlight=order["highlight"],
        obscured_order=order["obscured_order"]
      ))
      
    return result
  
  def get_portraits(self) -> list[Portrait]:
    result: list[Portrait] = []
    for id, portrait in enumerate(PortdataDat.result):
      result.append(Portrait(
        id=id,
        portrait_file=portrait["portrait_file"],
        smk_change=portrait["smk_change"],
        unknown1=portrait["unknown1"]
      ))
      
    return result