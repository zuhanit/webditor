from .wobject import WObject
from app.services.hex_validator import HexBytes


class RawTriggerSection(WObject):
  """Bytes-based raw trigger section(e.g. TRIG and MBRF)

  Webditor uses `eudplib` for trigger programming, so every triggers need to written for eudplib. But
  user can use his own trigger on map thanks to eudplib supports it. So TRIG and MBRF sections are used
  to only compile map.
  """

  name: str = "RawTrigger"
  raw_data: HexBytes
