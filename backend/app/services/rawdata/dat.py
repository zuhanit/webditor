from ..utils.reverse import reverse_tbl_dict
from .datdata import ImagesDat, FlingyDat, OrdersDat, PortdataDat, SpritesDat
from app.types import dat_types


class DAT:
  """
  DAT is a class that contains necessary data from the DAT file.
  """

  @property
  def images(self) -> list[dat_types.Image]:
    from eudplib.core.rawtrigger.strdict.image import DefImageDict

    result: list[dat_types.Image] = []
    for id, image in enumerate(ImagesDat.result):
      result.append(
        dat_types.Image(
          id=id,
          name=reverse_tbl_dict(DefImageDict)[id],
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
          lift_off_overlay=image["lift_off_overlay"],
        )
      )

    return result

  @property
  def flingy(self) -> list[dat_types.Flingy]:
    from eudplib.core.rawtrigger.strdict.flingy import DefFlingyDict

    result: list[dat_types.Flingy] = []
    for id, flingy in enumerate(FlingyDat.result):
      result.append(
        dat_types.Flingy(
          id=id,
          name=reverse_tbl_dict(DefFlingyDict)[id],
          sprite=flingy["sprite"],
          top_speed=flingy["topSpeed"],
          acceleration=flingy["acceleration"],
          halt_distance=flingy["haltDistance"],
          turn_radius=flingy["turnRadius"],
          unused=flingy["unused"],
          move_control=flingy["moveControl"],
        )
      )

    return result

  @property
  def orders(self) -> list[dat_types.Order]:
    from eudplib.core.rawtrigger.strdict.unitorder import DefUnitOrderDict

    result: list[dat_types.Order] = []
    for id, order in enumerate(OrdersDat.result):
      result.append(
        dat_types.Order(
          id=id,
          name=reverse_tbl_dict(DefUnitOrderDict)[id],
          label=order["label"],
          use_weapon_targeting=order["use_weapon_targeting"],
          can_be_interrupted=order["can_be_interrupted"],
          can_be_queued=order["can_be_queued"],
          targeting=order["targeting"],
          energy=order["energy"],
          animation=order["animation"],
          highlight=order["highlight"],
          obscured_order=order["obscured_order"],
        )
      )

    return result

  @property
  def portraits(self) -> list[dat_types.Portrait]:
    from eudplib.core.rawtrigger.strdict.portrait import DefPortraitDict

    result: list[dat_types.Portrait] = []
    for id, portrait in enumerate(PortdataDat.result):
      result.append(
        dat_types.Portrait(
          id=id,
          name=reverse_tbl_dict(DefPortraitDict)[id],
          portrait_file=portrait["portrait_file"],
          smk_change=portrait["smk_change"],
          unknown1=portrait["unknown1"],
        )
      )

    return result

  @property
  def sprites(self) -> list[dat_types.Sprite]:
    from eudplib.core.rawtrigger.strdict.sprite import DefSpriteDict

    result: list[dat_types.Sprite] = []
    for id, sprite in enumerate(SpritesDat.result):
      result.append(
        dat_types.Sprite(
          id=id,
          name=reverse_tbl_dict(DefSpriteDict)[id],
          owner=0,
          flags=0,
          image=sprite["image_file"],
          health_bar=sprite["health_bar"] if "health_bar" in sprite.keys() else None,
          selection_circle_image=sprite["selection_circle_image"]
          if "selection_circle_image" in sprite.keys()
          else None,
          selection_circle_offset=sprite["selection_circle_offset"]
          if "selection_circle_offset" in sprite.keys()
          else None,
        )
      )

    return result
