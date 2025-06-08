from app.services.rawdata.chk import CHK
from app.services.io import get_chkt
from io import BytesIO
from cProfile import Profile
import pstats


with open("example/various_units.scx", "rb") as f:
  chkt = get_chkt(BytesIO(f.read()))
  chk = CHK(chkt)

properties = [
  name for name in dir(chk) if not name.startswith("__") and not name.endswith("__")
]

with Profile(builtins=False) as profiler:
  for property in properties:
    profiler.runcall(lambda: getattr(chk, property))

  with open("app/services/utils/profiling/result/chk.prof", "w") as f:
    stats = pstats.Stats(profiler, stream=f)
    stats.sort_stats("cumulative")
    stats.print_stats(10)
