from app.services.rawdata.chk import CHK
from app.services.rawdata.dat import DAT
from app.services.rawdata.converter import MapConverter
from app.services.mapdata.io import get_chkt
from cProfile import Profile
from io import BytesIO
import pstats

with open("example/various_units.scx", "rb") as f:
  chkt = get_chkt(BytesIO(f.read()))
  chk = CHK(chkt)
  dat = DAT()

  converter = MapConverter(dat, chk)

properties = [
  name
  for name in dir(converter)
  if not name.startswith("__") and not name.endswith("__")
]

with Profile(builtins=False) as profiler:
  for property in properties:
    profiler.runcall(lambda: getattr(converter, property))

  with open("app/services/utils/profiling/result/converter.prof", "w") as f:
    stats = pstats.Stats(profiler, stream=f)
    stats.sort_stats("cumulative")
    stats.print_stats()
