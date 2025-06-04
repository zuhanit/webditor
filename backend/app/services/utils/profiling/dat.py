from cProfile import Profile
import pstats

from app.services.rawdata.dat import DAT


with open("example/various_units.scx", "rb") as f:
  dat = DAT()

properties = [
  name for name in dir(dat) if not name.startswith("__") and not name.endswith("__")
]

with Profile(builtins=False) as profiler:
  for property in properties:
    profiler.runcall(lambda: getattr(dat, property))

  with open("app/services/utils/profiling/result/dat.prof", "w") as f:
    stats = pstats.Stats(profiler, stream=f)
    stats.sort_stats("cumulative")
    stats.print_stats(10)
