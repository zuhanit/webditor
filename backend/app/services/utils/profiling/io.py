from app.services.rawdata.chk import CHK
from app.services.rawdata.dat import DAT
from app.services.mapdata.io import get_chkt, get_map
from cProfile import Profile
from io import BytesIO
import pstats

with Profile(builtins=False) as profiler:
  with open("example/various_units.scx", "rb") as f:
    content = f.read()
    profiler.runcall(lambda: get_chkt(BytesIO(content)))

  with open("app/services/utils/profiling/result/io/get_chkt.prof", "w") as f:
    stats = pstats.Stats(profiler, stream=f)
    stats.sort_stats("cumulative")
    stats.print_stats(10)

with open("example/various_units.scx", "rb") as f:
  chkt = get_chkt(BytesIO(f.read()))
  chk = CHK(chkt)
  dat = DAT()


with Profile(builtins=False) as profiler:
  profiler.runcall(lambda: get_map(chk, dat))

  with open("app/services/utils/profiling/result/io/get_map.prof", "w") as f:
    stats = pstats.Stats(profiler, stream=f)
    stats.sort_stats("cumulative")
    stats.print_stats(10)
